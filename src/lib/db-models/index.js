import Users from './users.js'
import Files from './files.js'
import BoxSchemas from './box.js'
import Pin from './pin.js'
class DbModels {
  constructor () {
    this.Users = Users.User
    this.Files = Files
    this.Box = BoxSchemas.Box
    this.BoxSignature = BoxSchemas.BoxSignature
    this.Pin = Pin
    this.Account = Users.AccountData
  }
}

export default DbModels
