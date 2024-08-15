import UsersUseCases from './users.js'
import FilesUseCases from './files.js'
import BoxUseCases from './box.js'

export default class UseCases {
  constructor (config = {}) {
    if (!config.libraries) { throw new Error('Libraries instance should be passed in UseCases Constructor.') }

    this.users = new UsersUseCases(config)
    this.files = new FilesUseCases(config)
    this.Box = new BoxUseCases(config)
  }
}
