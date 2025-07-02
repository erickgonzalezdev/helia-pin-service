export default class AccountUseCases {
  constructor (config = {}) {
    this.db = config.libraries.dbModels
    this.libraries = config.libraries
    this.wlogger = config.libraries.wlogger
    this.accountLib = config.libraries.accountLib

    // Bind function to this class.
    this.createAccount = this.createAccount.bind(this)
    this.refreshAccount = this.refreshAccount.bind(this)
    this.getFreeAccount = this.getFreeAccount.bind(this)
    this.cleanExpiredAcc = this.cleanExpiredAcc.bind(this)
    this.getAccountsData = this.getAccountsData.bind(this)
    this.notifyExpiredDate = this.notifyExpiredDate.bind(this)
  }

  // Create  a user account,
  async createAccount (inObj = {}) {
    try {
      const { userId, type, paymentId } = inObj

      if (!userId) throw new Error('userId must be a string')
      if (!type) throw new Error('type must be a number')

      // Find user data
      const user = await this.db.Users.findById(userId)
      if (!user) {
        throw new Error('user not found!')
      }
      // Looking for existing account

      /*
      TODO : Merge existing account time left to the new account timer
      in order to be able to upgrade account and expand the account expiration data.

       */
      const accData = await this.accountLib.getTypeData(type)
      accData.expiredAt = await this.accountLib.calculateAccExpiration(accData.expirationData)

      const account = new this.db.Account(accData)
      account.owner = user._id.toString()
      account.createdAt = new Date().getTime()
      account.paymentId = paymentId

      // Assign new account to user.
      user.account = account._id.toString()
      await account.save()
      await user.save()

      return account
    } catch (error) {
      this.wlogger.error(`Error in use-cases/createAccount() $ ${error.message}`)
      throw error
    }
  }

  async refreshAccount (inObj = {}) {
    try {
      const { id } = inObj

      if (!id || typeof id !== 'string') {
        throw new Error('id is required')
      }
      const account = await this.db.Account.findById(id)

      const pins = await this.db.Pin.find({ userOwner: account.owner }).populate('file', ['-host'])
      const box = await this.db.Box.find({ owner: account.owner })

      // Get total bytes from pins
      const cBytes = pins.reduce((acc, val) => {
        if (!val.file) return acc + 0
        return acc + val.file.size
      }, 0)

      account.currentPins = pins.length
      account.currentBox = box.length
      account.currentBytes = cBytes

      const now = new Date().getTime()
      const expiredAt = new Date(account.expiredAt).getTime()

      if (now > expiredAt) {
        account.expired = true
      }

      await account.save()

      return account
    } catch (error) {
      this.wlogger.error(`Error in use-cases/refreshAccount() $ ${error.message}`)
      throw error
    }
  }

  async getFreeAccount (user = {}) {
    try {
      if (!user.emailVerified && !user.telegramVerified) throw new Error('Account Verification is required!.')

      if (user.account) throw new Error('User already have an account')

      const accData = await this.accountLib.getTypeData(1)
      accData.expiredAt = await this.accountLib.calculateAccExpiration(accData.expirationData)

      const account = new this.db.Account(accData)
      account.owner = user._id.toString()
      account.createdAt = new Date().getTime()

      // Assign new account to user.
      user.account = account._id.toString()
      await account.save()
      await user.save()

      return account
    } catch (error) {
      this.wlogger.error(`Error in use-cases/getFreeAccount() $ ${error.message}`)
      throw error
    }
  }

  // Clean all expired accounts
  // Delete al pins and boxes from an expired account.
  async cleanExpiredAcc () {
    try {
      // Current Timestamp
      const now = new Date().getTime()
      // Get all users with current actived account.
      const users = await this.db.Users.find({}).populate('account')

      // Map each account
      for (let i = 0; i < users.length; i++) {
        const user = users[i]
        const acc = user.account
        // Continue if the users does not have an associated account.
        if (!acc) { continue }
        // Dele al pins and boxes from expired account.
        if (now > acc.expiredAt) {
          await this.db.Pin.deleteMany({ userOwner: acc.owner })
          await this.db.Box.deleteMany({ owner: acc.owner })
          await this.refreshAccount({ id: acc._id.toString() })
        } else {
          // verify if account is expired in 3 days
          await this.notifyExpiredDate()
        }
      }
      return users
    } catch (error) {
      this.wlogger.error(`Error in use-cases/getFreeAccount() $ ${error.message}`)
      throw error
    }
  }

  async notifyExpiredDate () {
    try {
      // Get all users with current actived account.
      const users = await this.db.Users.find({}).populate('account')

      // Map each account
      for (let i = 0; i < users.length; i++) {
        const user = users[i]
        const acc = user.account
        // Continue if the users does not have an associated account.
        if (!acc) { continue }
        if (acc.expired) { continue }
        if (acc.renewNotified) { continue }
        // calc if epiredAt is in 3 days or less
        const now = new Date().getTime()
        const daysToExpired = new Date(acc.expiredAt)
        daysToExpired.setDate(daysToExpired.getDate() - 3)
        // if 3 days or less before expire, notify user
        if (daysToExpired.getTime() < now) {
          const expiredAt = new Date(acc.expiredAt)
          // notify user
          const emailObj = {
            to: [user.email],
            subject: 'Your Account is Expiring',
            html: `Your account is expiring , please renew your account to avoid losing your data.
            <br>
            <br>
            <span>Account type: ${acc.typeLabel}</span>
            <br>
            <span>Expired At: ${expiredAt.toISOString().split('T')[0]}</span>
            <br>
            <span>Disk Usage: ${acc.currentBytes / 1024 / 1024} MB </span>
            <br>
            <span>Pins: ${acc.currentPins}</span>
            <br>
            <span>Boxes: ${acc.currentBox} }</span>
            `
          }

          try {
            await this.libraries.emailService.sendEmail(emailObj)
            acc.renewNotified = true
            await acc.save()
          } catch (error) {
            // Skip error
          }
        }
      }
      return true
    } catch (error) {
      this.wlogger.error(`Error in use-cases/notifyExpiredDate() $ ${error.message}`)
      throw error
    }
  }

  async getAccountsData () {
    try {
      return this.accountLib.getAccountsData()
    } catch (error) {
      this.wlogger.error(`Error in use-cases/getFreeAccount() $ ${error.message}`)
      throw error
    }
  }
}
