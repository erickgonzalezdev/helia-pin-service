import UsersUseCases from './users.js'

export default class UseCases {
  constructor (config = {}) {
    if (!config.libraries) { throw new Error('Libraries instance should be passed in UseCases Constructor.') }

    this.users = new UsersUseCases(config)
  }
}
