import Router from 'koa-router'
import Controller from './controller.js'

class RouterHanlder {
  constructor (config = {}) {
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
    this.createSignature = this.createSignature.bind(this)
    this.getBoxSignatures = this.getBoxSignatures.bind(this)
    this.getBoxesByUser = this.getBoxesByUser.bind(this)
  }

  async start (app) {
    if (!app) { throw new Error('App is required!') }

    this.router.post('/', this.createBox)
    this.router.get('/', this.getBoxes)
    this.router.get('/user', this.getBoxesByUser)
    this.router.get('/:id', this.getBox)
    this.router.put('/:id', this.updateBox)
    this.router.delete('/:id', this.deleteBox)
    this.router.post('/sign', this.createSignature)
    this.router.get('/sign/:id', this.getBoxSignatures)

    app.use(this.router.routes())
    app.use(this.router.allowedMethods())
  }

  async createBox (ctx, next) {
    await this.middleware.userValidators.ensureUser(ctx, next)
    await this.controller.createBox(ctx, next)
  }

  async getBoxes (ctx, next) {
    await this.middleware.userValidators.ensureUser(ctx, next)
    await this.controller.getBoxes(ctx, next)
  }

  async getBox (ctx, next) {
    await this.middleware.userValidators.ensureUser(ctx, next)
    await this.controller.getBox(ctx, next)
  }

  async updateBox (ctx, next) {
    await this.middleware.userValidators.ensureUser(ctx, next)
    await this.controller.getBox(ctx, next)
    await this.controller.updateBox(ctx, next)
  }

  async deleteBox (ctx, next) {
    await this.middleware.userValidators.ensureUser(ctx, next)
    await this.controller.getBox(ctx, next)
    await this.controller.deleteBox(ctx, next)
  }

  async createSignature (ctx, next) {
    await this.middleware.userValidators.ensureUser(ctx, next)
    await this.controller.createSignature(ctx, next)
  }

  async getBoxSignatures (ctx, next) {
    await this.middleware.userValidators.ensureUser(ctx, next)
    await this.controller.getBoxSignatures(ctx, next)
  }

  async getBoxesByUser (ctx, next) {
    await this.middleware.userValidators.ensureUser(ctx, next)
    await this.controller.getBoxesByUser(ctx, next)
  }
}

export default RouterHanlder
