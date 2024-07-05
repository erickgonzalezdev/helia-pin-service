import DbModels from './db-models/index.js'
import Passport from './passport.js'
import Logger from './winston-logger.js'

class Lib {
  constructor (config = {}) {
    this.config =  config
    // Setting w-logger
    const loggerInstance = new Logger(this.config)

    loggerInstance.outputToConsole() // Allow the logger to write to the console.

    this.wlogger = loggerInstance.wlogger
    this.config.wlogger =  this.wlogger

    this.dbModels = new DbModels(this.config)
    this.passport = new Passport(this.config)

  }
}

export default Lib
