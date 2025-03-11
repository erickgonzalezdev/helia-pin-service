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
    this.refreshAccount = this.refreshAccount.bind(this)
    this.getFreeAccount = this.getFreeAccount.bind(this)
  }

  async start (app) {
    if (!app) { throw new Error('App is required!') }

    this.router.get('/free', this.getFreeAccount)
    this.router.get('/data/:id', this.refreshAccount)
    this.router.get('/pricing', this.controller.getAccountsData)

    app.use(this.router.routes())
    app.use(this.router.allowedMethods())
  }

  async getFreeAccount (ctx, next) {
    await this.middleware.userValidators.ensureUser(ctx, next)
    await this.controller.getFreeAccount(ctx, next)
  }

  async refreshAccount (ctx, next) {
    await this.middleware.userValidators.ensureUser(ctx, next)
    await this.controller.refreshAccount(ctx, next)
  }
}

export default RouterHanlder
