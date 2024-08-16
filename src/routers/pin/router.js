import Router from 'koa-router'
import Controller from './controller.js'

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
    this.getPinsByBox = this.getPinsByBox.bind(this)
    this.addPin = this.addPin.bind(this)
  }

  async start (app) {
    if (!app) { throw new Error('App is required!') }

    this.router.post('/', this.addPin)
    this.router.get('/box/:id', this.getPinsByBox)

    app.use(this.router.routes())
    app.use(this.router.allowedMethods())
  }

  async addPin (ctx, next) {
    const type = await this.middleware.getJWTType(ctx)
    console.log('type', type)
    if (type === 'userAccess') {
      await this.middleware.userValidators.ensureUser(ctx, next)
    }
    if (type === 'boxAccess') {
      await this.middleware.boxValidator.ensureBoxSignature(ctx, next)
    }

    await this.controller.addPin(ctx, next)
  }

  async getPinsByBox (ctx, next) {
    const type = await this.middleware.getJWTType(ctx)
    if (type === 'userAccess') {
      await this.middleware.userValidators.ensureUser(ctx, next)
    }
    if (type === 'boxAccess') {
      await this.middleware.boxValidator.ensureBoxSignature(ctx, next)
    }
    await this.controller.getPinsByBox(ctx, next)
  }
}

export default RouterHanlder
