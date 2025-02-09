import Users from './users/router.js'
import Files from './files/router.js'
import Box from './box/router.js'
import Pin from './pin/router.js'
import Nodes from './nodes/router.js'
import Account from './account/router.js'
import Payment from './payment/router.js'

export default class InitRouter {
  constructor (config = {}) {
    this.config = config
    this.users = new Users(this.config)
    this.files = new Files(this.config)
    this.box = new Box(this.config)
    this.pin = new Pin(this.config)
    this.nodes = new Nodes(this.config)
    this.account = new Account(this.config)
    this.payment = new Payment(this.config)

    // Bind function to this class.
    this.start = this.start.bind(this)
  }

  start (app) {
    this.users.start(app)
    this.files.start(app)
    this.box.start(app)
    this.pin.start(app)
    this.nodes.start(app)
    this.account.start(app)
    this.payment.start(app)
  }
}
