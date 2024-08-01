import Users from './users/router.js'
import Pin from './pin/router.js'
import Box from './box/router.js'

export default class InitRouter {
  constructor (config = {}) {
    this.config = config
    this.users = new Users(this.config)
    this.pin = new Pin(this.config)
    this.box = new Box(this.config)

    // Bind function to this class.
    this.start = this.start.bind(this)
  }

  start (app) {
    this.users.start(app)
    this.pin.start(app)
    this.box.start(app)
  }
}
