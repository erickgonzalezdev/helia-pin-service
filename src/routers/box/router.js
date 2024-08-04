import Router from 'koa-router'
import Controller from './controller.js'

class RouterHanlder {
  constructor(config = {}) {
    this.middleware = config.middleware

    if (!this.middleware) { throw new Error('Middleware must be provided when instantiate a Router') }

    this.controller = new Controller(config)
    this.port = config.port

    const baseUrl = '/box'
    this.router = new Router({ prefix: baseUrl })

    // Bind function to this class.
    this.start = this.start.bind(this)
    this.createBox = this.createBox.bind(this)
    this.getBox = this.getBox.bind(this)
    this.getBoxes = this.getBoxes.bind(this)
    this.updateBox = this.updateBox.bind(this)
    this.deleteBox = this.deleteBox.bind(this)
    this.addPin = this.addPin.bind(this)
    this.boxSignature = this.boxSignature.bind(this)
  }

  async start(app) {
    if (!app) { throw new Error('App is required!') }

    this.router.post('/', this.createBox)
    this.router.get('/', this.getBoxes)
    this.router.get('/:id', this.getBox)
    this.router.put('/:id', this.updateBox)
    this.router.delete('/:id', this.deleteBox)
    this.router.post('/add', this.addPin)
    this.router.post('/sign', this.boxSignature)


    app.use(this.router.routes())
    app.use(this.router.allowedMethods())
  }

  async createBox(ctx, next) {
    await this.middleware.userValidators.ensureUser(ctx, next)
    await this.controller.createBox(ctx, next)
  }

  async getBoxes(ctx, next) {
    await this.middleware.userValidators.ensureUser(ctx, next)
    await this.controller.getBoxes(ctx, next)
  }
  async getBox(ctx, next) {
    await this.middleware.userValidators.ensureUser(ctx, next)
    await this.controller.getBox(ctx, next)
  }
  async updateBox(ctx, next) {
    await this.middleware.userValidators.ensureUser(ctx, next)
    await this.controller.getBox(ctx, next)
    await this.controller.updateBox(ctx, next)
  }
  async deleteBox(ctx, next) {
    await this.middleware.userValidators.ensureUser(ctx, next)
    await this.controller.getBox(ctx, next)
    await this.controller.deleteBox(ctx, next)
  }

  async addPin(ctx, next) {
    const type = await this.middleware.getJWTType(ctx)
    if (type === 'userAccess') {
      await this.middleware.userValidators.ensureUser(ctx, next)
    }
    if (type === 'boxAccess') {
      await this.middleware.boxValidator.ensureBoxSignature(ctx, next)
    }

    await this.controller.addPin(ctx, next)
  }

  async boxSignature(ctx, next) {
    await this.middleware.userValidators.ensureUser(ctx, next)
    await this.controller.boxSignature(ctx, next)
  }
}

export default RouterHanlder