import DbModels from './db-models/index.js'
import Passport from './passport.js'
import Logger from './winston-logger.js'
import HeliaNode from './helia-ipfs-node.js'
import jwt from 'jsonwebtoken'
import AccountLib from './account.js'
import PaymentGateway from './payment.js'

class Lib {
  constructor (config = {}) {
    this.config = config
    // Setting w-logger
    const loggerInstance = new Logger(this.config)

    loggerInstance.outputToConsole() // Allow the logger to write to the console.

    this.wlogger = loggerInstance.wlogger
    this.config.wlogger = this.wlogger

    this.dbModels = new DbModels(this.config)
    this.config.dbModels = this.dbModels
    this.passport = new Passport(this.config)

    this.heliaNode = new HeliaNode(this.config)
    this.accountLib = new AccountLib(this.config)
    this.payment = new PaymentGateway(this.config)

    this.jwt = jwt
  }

  // Start libraries functionalities
  async start () {
    await this.heliaNode.start()
    await this.payment.auth()
  }
}

export default Lib
