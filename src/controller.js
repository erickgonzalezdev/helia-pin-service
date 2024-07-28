import Routers from './routers/index.js'
import UseCases from './use-cases/index.js'
import Libraries from './lib/index.js'
import Middleware from './middlewares/index.js'
import ErrorHandler from './utils/error.js'

export default class InitController {
  constructor (config = {}) {
    this.config = config

    this.errorHandler = new ErrorHandler()
    this.config.errorHandler = this.errorHandler

    this.libraries = new Libraries(config)
    this.config.libraries = this.libraries

    this.useCases = new UseCases(this.config)
    this.config.useCases = this.useCases

    this.middleware = new Middleware(this.config)
    this.config.middleware = this.middleware

    this.routers = new Routers(this.config)

    this.start = this.start.bind(this)
  }

  async start (app) {
    await this.libraries.start()
    this.routers.start(app)
  }
}
