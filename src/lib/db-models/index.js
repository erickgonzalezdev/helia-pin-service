import Users from './users.js'
import Files from './files.js'
import Box from './box.js'

class DbModels {
  constructor () {
    this.Users = Users
    this.Files = Files
    this.Box = Box
  }
}

export default DbModels
