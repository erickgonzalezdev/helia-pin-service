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
      if (!token) throw new Error('Token could not be retrieved from header')

      // TODO : use RegExp
      const _match = token.split('.')
      let type = 'boxAccess'
      if (_match.length > 1) {
        type = 'userAccess'
      }
      ctx.state.jwtType = type
      return type
    } catch (error) {
      if (!ctx) throw error
      ctx.status = 401
      ctx.throw(401, error.message)
    }
  }
}
