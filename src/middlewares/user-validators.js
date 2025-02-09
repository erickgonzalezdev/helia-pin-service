import jwt from 'jsonwebtoken'

export default class UserValidator {
  constructor (config = {}) {
    this.config = config
    this.libraries = this.config.libraries
    // if (!this.libraries) { throw new Error('Libraries instance should be passed in UserValidator middleware Constructor.') }

    this.dbModels = this.config.libraries.dbModels
    // if (!this.dbModels) { throw new Error('DbModels instance should be passed in UserValidator middleware Constructor.') }

    this.jwt = jwt

    this.ensureUser = this.ensureUser.bind(this)
    this.ensureAccount = this.ensureAccount.bind(this)
    this.getToken = this.getToken.bind(this)
    this.validatePinsLimit = this.validatePinsLimit.bind(this)
    this.validateBoxesLimit = this.validateBoxesLimit.bind(this)
  }

  async ensureUser (ctx, next) {
    try {
      if (!ctx) throw new Error('Koa context (ctx) is required!')
      const token = this.getToken(ctx)

      if (!token) {
        throw new Error('Token could not be retrieved from header')
      }

      let decoded = null
      try {
        decoded = this.jwt.verify(token, this.config.passKey)
      } catch (err) {
        throw new Error('Could not verify JWT')
      }
      if (decoded.type !== 'userAccess') {
        throw new Error('Could not verify JWT')
      }
      ctx.state.user = await this.dbModels.Users.findById(decoded.id, '-password')

      if (!ctx.state.user) {
        throw new Error('Could not find user')
      }

      return true
    } catch (error) {
      if (!ctx) throw error
      ctx.status = 401
      ctx.throw(401, error.message)
    }
  }

  getToken (ctx) {
    if (!ctx) return null
    const header = ctx.request.header.authorization
    if (!header) {
      return null
    }
    const parts = header.split(' ')
    if (parts.length !== 2) {
      return null
    }
    const scheme = parts[0]
    const token = parts[1]
    if (/^Bearer$/i.test(scheme)) {
      return token
    }
    return null
  }

  // Ensure associated account to the user is currently active.
  async ensureAccount (ctx, next) {
    try {
      if (!ctx) throw new Error('Koa context (ctx) is required!')

      if (!ctx.state.user) {
        throw new Error('Could not find user')
      }

      if (!ctx.state.user.account) {
        throw new Error('Could not find user account type')
      }

      const acc = await this.dbModels.Account.findById(ctx.state.user.account)
      ctx.state.account = acc
      const now = new Date().getTime()
      const expiredAt = new Date(acc.expiredAt).getTime()
      if (now > expiredAt) {
        throw new Error('Account expired!.')
      }
      return true
    } catch (error) {
      if (!ctx) throw error
      ctx.status = 401
      ctx.throw(401, error.message)
    }
  }

  async validatePinsLimit (ctx, next) {
    try {
      if (!ctx) throw new Error('Koa context (ctx) is required!')

      if (!ctx.state.user) {
        throw new Error('Could not find user')
      }

      if (!ctx.state.user.account) {
        throw new Error('Could not find user account type')
      }

      const acc = await this.dbModels.Account.findById(ctx.state.user.account)
      ctx.state.account = acc

      const pins = await this.dbModels.Pin.find({ userOwner: ctx.state.user._id })

      if (acc.maxPins <= pins.length) {
        throw new Error('Account reached max number of Pins!.')
      }
      return true
    } catch (error) {
      if (!ctx) throw error
      ctx.status = 401
      ctx.throw(401, error.message)
    }
  }

  async validateBoxesLimit (ctx, next) {
    try {
      if (!ctx) throw new Error('Koa context (ctx) is required!')

      if (!ctx.state.user) {
        throw new Error('Could not find user')
      }

      if (!ctx.state.user.account) {
        throw new Error('Could not find user account type')
      }

      const acc = await this.dbModels.Account.findById(ctx.state.user.account)
      ctx.state.account = acc

      const boxes = await this.dbModels.Box.find({ owner: ctx.state.user._id })

      if (acc.maxBoxes <= boxes.length) {
        throw new Error('Account reached max number of Boxes!.')
      }
      return true
    } catch (error) {
      if (!ctx) throw error
      ctx.status = 401
      ctx.throw(401, error.message)
    }
  }
}
