import Users from './users.js'
import Files from './files.js'
import Box from './box.js'
import Pin from './pin.js'
class DbModels {
  constructor () {
    this.Users = Users
    this.Files = Files
    this.Box = Box
    this.Pin = Pin
  }
}

export default DbModels
