import UsersUseCases from './users.js'
import PinUseCases from './pin.js'
import BoxUseCases from './box.js'

export default class UseCases {
  constructor (config = {}) {
    if (!config.libraries) { throw new Error('Libraries instance should be passed in UseCases Constructor.') }

    this.users = new UsersUseCases(config)
    this.pin= new PinUseCases(config)
    this.Box = new BoxUseCases(config)
  }
}
