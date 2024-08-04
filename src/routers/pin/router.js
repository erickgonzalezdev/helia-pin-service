import Router from 'koa-router'
import Controller from './controller.js'
import { koaBody } from 'koa-body' // Allow multi part

class RouterHanlder {
  constructor (config = {}) {
    this.middleware = config.middleware

    if (!this.middleware) { throw new Error('Middleware must be provided when instantiate a Router') }

    this.controller = new Controller(config)
    this.port = config.port

    const baseUrl = '/pin'
    this.router = new Router({ prefix: baseUrl })

    // Bind function to this class.
    this.start = this.start.bind(this)
    this.pin = this.pin.bind(this)
    this.getPins = this.getPins.bind(this)
  }

  async start (app) {
    if (!app) { throw new Error('App is required!') }

    this.router.post('/', koaBody({ multipart: true }), this.pin)
    this.router.get('/', this.getPins)

    app.use(this.router.routes())
    app.use(this.router.allowedMethods())
  }

  async pin (ctx, next) {
    await this.controller.pin(ctx, next)
  }

  async getPins (ctx, next) {
    await this.controller.getPins(ctx, next)
  }
}

export default RouterHanlder
