export default class AccountUseCases {
  constructor (config = {}) {
    this.db = config.libraries.dbModels
    this.wlogger = config.libraries.wlogger
    this.accountLib = config.libraries.accountLib

    // Bind function to this class.
    this.createAccount = this.createAccount.bind(this)
    this.refreshAccount = this.refreshAccount.bind(this)
    this.getFreeAccount = this.getFreeAccount.bind(this)
    this.cleanExpiredAcc = this.cleanExpiredAcc.bind(this)
  }

  // Create  a user account,
  async createAccount (inObj = {}) {
    try {
      const { userId, type } = inObj

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

      // Assign new account to user.
      user.account = account._id.toString()
      await account.save()
      await user.save()

      return account
    } catch (error) {
      console.log(error)
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

      const pins = await this.db.Pin.find({ userOwner: account.owner })
      const box = await this.db.Box.find({ owner: account.owner })

      account.currentPins = pins.length
      account.currentBox = box.length

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
      console.log(error)
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
      const users = await this.db.Users.find({ }).populate('account')

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
        }
      }
      return users
    } catch (error) {
      console.log(error)
      throw error
    }
  }
}
