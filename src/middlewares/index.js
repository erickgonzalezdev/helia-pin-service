import UserValidators from './user-validators.js'

export default class Middleware {
  constructor (config = {}) {
    if (!config.libraries) { throw new Error('Lib instance should be passed in UseCases Constructor.') }

    this.userValidators = new UserValidators(config)
  }
}
