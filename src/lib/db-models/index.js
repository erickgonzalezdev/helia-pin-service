import Users from './users.js'
import Files from './files.js'
import BoxSchemas from './box.js'
import Pin from './pin.js'

class DbModels {
  constructor () {
    this.Users = Users
    this.Files = Files
    this.Box = BoxSchemas.Box
    this.Pin = Pin
  }
}

export default DbModels
