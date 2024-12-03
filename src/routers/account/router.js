import Router from 'koa-router'
import Controller from './controller.js'

class RouterHanlder {
  constructor (config = {}) {
    this.middleware = config.middleware

    if (!this.middleware) { throw new Error('Middleware must be provided when instantiate a Router') }

    this.controller = new Controller(config)
    this.port = config.port

    const baseUrl = '/account'
    this.router = new Router({ prefix: baseUrl })

    // Bind function to this class.
    this.start = this.start.bind(this)
    this.createAccount = this.createAccount.bind(this)
  }

  async start (app) {
    if (!app) { throw new Error('App is required!') }

    this.router.post('/', this.createAccount)

    app.use(this.router.routes())
    app.use(this.router.allowedMethods())
  }

  async createAccount (ctx, next) {
    // TODO : add admin validators.
    await this.middleware.userValidators.ensureUser(ctx, next)
    await this.controller.createAccount(ctx, next)
  }
}
export default RouterHanlder
