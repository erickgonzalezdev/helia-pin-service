import UsersUseCases from './users.js'
import FilesUseCases from './files.js'
import BoxUseCases from './box.js'
import PinUseCases from './pin.js'
import NodesUseCases from './nodes.js'
export default class UseCases {
  constructor (config = {}) {
    if (!config.libraries) { throw new Error('Libraries instance should be passed in UseCases Constructor.') }

    this.libraries = config.libraries
    this.users = new UsersUseCases(config)
    this.files = new FilesUseCases(config)
    this.box = new BoxUseCases(config)
    this.pin = new PinUseCases(config)
    this.nodes = new NodesUseCases(config)
  }
}
