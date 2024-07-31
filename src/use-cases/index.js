import UsersUseCases from './users.js'
import PinUseCases from './pin.js'
export default class UseCases {
  constructor (config = {}) {
    if (!config.libraries) { throw new Error('Libraries instance should be passed in UseCases Constructor.') }

    this.users = new UsersUseCases(config)
    this.pin= new PinUseCases(config)
  }
}
