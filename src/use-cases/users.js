export default class UsersUseCases {
  constructor (config = {}) {
    this.config = config
    this.db = config.libraries.dbModels
    this.libraries = config.libraries
    this.wlogger = config.libraries.wlogger
    this.passport = config.libraries.passport
    this.emailRequestWitingTime = 60 // 60 seconds

    // Bind function to this class.
    this.createUser = this.createUser.bind(this)
    this.getUser = this.getUser.bind(this)
    this.getUsers = this.getUsers.bind(this)
    this.updateUser = this.updateUser.bind(this)
    this.sendEmailVerificationCode = this.sendEmailVerificationCode.bind(this)
    this.verifyEmailCode = this.verifyEmailCode.bind(this)
    this.verifyTelegram = this.verifyTelegram.bind(this)
    this.changePassword = this.changePassword.bind(this)
  }

  async createUser (inObj = {}) {
    try {
      const { email, password } = inObj
      if (!email || typeof email !== 'string') {
        throw new Error('email is required!')
      }

      if (!password || typeof password !== 'string') {
        throw new Error('password is required!')
      }

      const user = new this.db.Users(inObj)
      /*       const account =  new this.db.Account()
      account.owner =  user._id.toString()
      user.account = account._id.toString() */

      user.createdAt = new Date().getTime()
      /*    account.createdAt = new Date().getTime()
 */
      await user.save()
      // await account.save()

      // generate jwt
      const token = user.generateToken()

      const userData = user.toJSON()
      userData.token = token
      // password should be omited on response
      delete userData.password

      const emailObj = {
        to: [user.email],
        subject: 'Account Successfully Registered!',
        html: 'Your account has been successfully registered'
      }

      try {
        await this.libraries.emailService.sendEmail(emailObj)
      } catch (error) {
        // Skip error
      }

      return userData
    } catch (error) {
      this.wlogger.error(`Error in use-cases/createUser() $ ${error.message}`)
      throw error
    }
  }

  async authUser (ctx) {
    try {
      const user = await this.passport.authUser(ctx)
      if (!user) {
        const err = new Error('Unauthorized')
        err.status = 401
        throw err
      }

      const token = user.generateToken()

      const userObj = user.toJSON()

      delete userObj.password

      return {
        userObj,
        token
      }
    } catch (error) {
      this.wlogger.error(`Error in use-cases/authUser() $ ${error.message}`)
      throw error
    }
  }

  async getUser (inObj = {}) {
    try {
      const { id } = inObj

      if (!id || typeof id !== 'string') {
        throw new Error('id is required')
      }
      const user = await this.db.Users.findById(id, ['-password']).populate('account')
      return user
    } catch (error) {
      this.wlogger.error(`Error in use-cases/getUser() $ ${error.message}`)
      throw error
    }
  }

  async getUsers () {
    try {
      const users = await this.db.Users.find({}, ['-password']).populate('account')
      return users
    } catch (error) {
      this.wlogger.error(`Error in use-cases/getUsers() $ ${error.message}`)
      throw error
    }
  }

  async updateUser (inObj = {}) {
    try {
      const { existingData, newData } = inObj
      if (!existingData || typeof existingData !== 'object') {
        throw new Error('existingData is required!')
      }

      if (!newData || typeof newData !== 'object') {
        throw new Error('newData data is required!')
      }

      Object.assign(existingData, newData)

      // Save the changes to the database.
      await existingData.save()
      return existingData
    } catch (error) {
      this.wlogger.error(`Error in use-cases/updateUser() $ ${error.message}`)
      throw error
    }
  }

  async sendEmailVerificationCode (inObj = {}) {
    try {
      const { user } = inObj

      if (!user) throw new Error('user is required')
      // returns false if a code was sent less than 1 minute ago.
      if (user.emailSentAt) {
        console.log(`User Verification code ${user.emailVerificationCode}`)
        const emailSentAt = new Date(user.emailSentAt)
        const now = new Date()
        const dateDiff = now.getTime() - emailSentAt.getTime()
        const sDiff = Math.floor(dateDiff / 1000) // seconds difference

        // prevent code was sent less than 60 seconds ago.
        if (sDiff <= this.emailRequestWitingTime) {
          return {
            result: false,
            emailSentAt: user.emailSentAt,
            waitingTime: this.emailRequestWitingTime, // time on seconds
            message: 'Rate Limit'
          }
        }
      }

      const code = Math.floor(100000 + Math.random() * 900000)
      user.emailVerificationCode = code
      user.emailSentAt = new Date().toISOString()
      console.log(`New Verification code ${user.emailVerificationCode}`)

      const emailObj = {
        to: [user.email],
        subject: 'Code Verification.',
        html: `
             <div style="width:500px ; padding: 1em ; border-radius: 10px; border: 2px solid #6C6D6F ; background : #A35EE2 ; color:white ; text-align: center; margin: 0 auto"><p style="margin-bottom:2em; font-size : 15px">Code Verification</p><h3 style="font-size: 25px"><strong>${code}</strong><h3></div>
             `
      }
      await user.save()

      await this.libraries.emailService.sendEmail(emailObj)

      return {
        result: true,
        emailSentAt: user.emailSentAt,
        waitingTime: this.emailRequestWitingTime, // time on seconds
        message: 'Code Sent Successfully.'
      }
    } catch (err) {
      this.wlogger.error(`Error in use-cases/sendEmailVerificationCode() $ ${err.message}`)
      throw err
    }
  }

  // Verify email code verification
  async verifyEmailCode (inObj = {}) {
    try {
      const { code, user } = inObj
      if (!user) throw new Error('user is required')

      const currentCode = user.emailVerificationCode

      if (code !== currentCode) throw new Error('Invalid Code.')

      user.emailVerificationCode = null
      user.emailVerified = true
      await user.save()
      return user
    } catch (err) {
      this.wlogger.error(`Error in use-cases/verifyEmailCode() $ ${err.message}`)
      throw err
    }
  }

  // Verify email code verification
  async verifyTelegram (inObj = {}) {
    try {
      const { code, chatId, user } = inObj
      if (!user) throw new Error('user is required')
      if (!chatId) throw new Error('chatId is required')
      if (!code || code !== this.config.telegramVerificationCode) throw new Error('Invalid Code.')

      if (user.telegramChatId === chatId) {
        throw new Error('User already associated with this telegram id.')
      }

      const existingChatId = await this.db.Users.findOne({ telegramChatId: chatId })
      if (existingChatId) throw new Error('Telegram id is currently associated with another user')

      user.telegramVerified = true
      user.telegramChatId = chatId

      await user.save()
      return user
    } catch (err) {
      this.wlogger.error(`Error in use-cases/verifyTelegram() $ ${err.message}`)
      throw err
    }
  }

  async changePassword (inObj = {}) {
    try {
      const { user, newPassword, oldPassword } = inObj
      if (!user) throw new Error('user is required')
      if (!newPassword) throw new Error('newPassword is required')
      if (!oldPassword) throw new Error('oldPassword is required')

      // get user with password
      const userWithPass = await this.db.Users.findById(user._id)
      const isMatch = await userWithPass.validatePassword(oldPassword.toString())

      if (!isMatch) throw new Error('Invalid old password')
      user.password = newPassword
      await user.save()
      return true
    } catch (error) {
      this.wlogger.error(`Error in use-cases/changePassword() $ ${error.message}`)
      throw error
    }
  }

/*   async resetPassword(inObj = {}){
    try {
      const { user } = inObj
      if (!user) throw new Error('user is required')

      const length = 12
      const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
      let newPassword = ''
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length)
        newPassword += charset[randomIndex]
      }

      user.password = newPassword
      const emailObj = {
        to: [user.email],
        subject: 'Password Reset Successfully!',
        html: `Your password has been reset successfully, please use the following password to login:
         <br>
         <br>
         <strong>${newPassword}</strong>
         <br>
         <br>
         <br>
         `
      }

      try {
        await this.libraries.emailService.sendEmail(emailObj)
      } catch (error) {
        // Skip error
      }
      await user.save()

      return true
    } catch (error) {
      this.wlogger.error(`Error in use-cases/resetPassword() $ ${error.message}`)
      throw error
    }
  } */
}
