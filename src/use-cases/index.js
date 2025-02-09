import UsersUseCases from './users.js'
import FilesUseCases from './files.js'
import BoxUseCases from './box.js'
import PinUseCases from './pin.js'
import NodesUseCases from './nodes.js'
import AccountUseCases from './account.js'
import PaymentUseCases from './payment.js'
export default class UseCases {
  constructor (config = {}) {
    if (!config.libraries) { throw new Error('Libraries instance should be passed in UseCases Constructor.') }
    this.config = config
    this.libraries = config.libraries
    this.users = new UsersUseCases(this.config)
    this.files = new FilesUseCases(this.config)
    this.box = new BoxUseCases(this.config)
    this.pin = new PinUseCases(this.config)
    this.nodes = new NodesUseCases(this.config)
    this.accounts = new AccountUseCases(this.config)
    this.config.accountsUseCases = this.accounts
    this.payments = new PaymentUseCases(this.config)
  }
}
