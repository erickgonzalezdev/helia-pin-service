import UserValidators from './user-validators.js'
import BoxValidator from './box-access-validator.js'

export default class Middleware {
  constructor (config = {}) {
    this.config = config
    if (!config.libraries) { throw new Error('Lib instance should be passed in UseCases Constructor.') }
    this.jwt = config.libraries.jwt

    this.userValidators = new UserValidators(config)
    this.boxValidator = new BoxValidator(config)

    this.getJWTType = this.getJWTType.bind(this)
  }

  getJWTType (ctx) {
    try {
      const token = this.userValidators.getToken(ctx)

      let decoded = null
      try {
        decoded = this.jwt.verify(token, this.config.passKey)
      } catch (err) {
        throw new Error('Could not verify JWT')
      }
      if (decoded.type !== 'userAccess' && decoded.type !== 'boxAccess') {
        throw new Error('Could not verify JWT')
      }

      ctx.state.jwtType = decoded.type
      return decoded.type
    } catch (error) {
      if (!ctx) throw error
      ctx.status = 401
      ctx.throw(401, error.message)
    }
  }
}
