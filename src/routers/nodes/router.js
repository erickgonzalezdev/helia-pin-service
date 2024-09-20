import Router from 'koa-router'
import Controller from './controller.js'

class RouterHanlder {
  constructor (config = {}) {
    this.middleware = config.middleware

    if (!this.middleware) { throw new Error('Middleware must be provided when instantiate a Router') }

    this.controller = new Controller(config)
    this.port = config.port

    const baseUrl = '/nodes'
    this.router = new Router({ prefix: baseUrl })

    // Bind function to this class.
    this.start = this.start.bind(this)
    this.getRemoteNodes = this.getRemoteNodes.bind(this)
  }

  async start (app) {
    if (!app) { throw new Error('App is required!') }

    this.router.get('/remote', this.getRemoteNodes)

    app.use(this.router.routes())
    app.use(this.router.allowedMethods())
  }

  async getRemoteNodes (ctx, next) {
    await this.controller.getRemoteNodes(ctx, next)
  }
}

export default RouterHanlder
