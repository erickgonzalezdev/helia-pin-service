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
    this.getToken = this.getToken.bind(this)
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
}
