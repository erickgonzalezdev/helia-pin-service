import Router from 'koa-router'
import Controller from './controller.js'

class RouterHanlder {
  constructor (config = {}) {
    this.middleware = config.middleware

    if (!this.middleware) { throw new Error('Middleware must be provided when instantiate a Router') }

    this.controller = new Controller(config)
    this.port = config.port

    const baseUrl = '/users'
    this.router = new Router({ prefix: baseUrl })

    // Bind function to this class.
    this.start = this.start.bind(this)
    this.createUser = this.createUser.bind(this)
    this.authUser = this.authUser.bind(this)
    this.getUsers = this.getUsers.bind(this)
    this.getUser = this.getUser.bind(this)
    this.updateUser = this.updateUser.bind(this)
  }

  async start (app) {
    if (!app) { throw new Error('App is required!') }

    this.router.post('/', this.createUser)
    this.router.post('/auth', this.authUser)
    this.router.get('/', this.getUsers)
    this.router.get('/:id', this.getUser)
    this.router.put('/:id', this.updateUser)
    // this.router.delete('/:id', this.deleteUser)

    app.use(this.router.routes())
    app.use(this.router.allowedMethods())
  }

  async createUser (ctx, next) {
    await this.controller.createUser(ctx, next)
  }

  async authUser (ctx, next) {
    await this.controller.authUser(ctx, next)
  }

  async getUsers (ctx, next) {
    await this.middleware.userValidators.ensureUser(ctx, next)
    await this.controller.getUsers(ctx, next)
  }

  async getUser (ctx, next) {
    await this.middleware.userValidators.ensureUser(ctx, next)
    await this.controller.getUser(ctx, next)
  }

  async updateUser (ctx, next) {
    await this.middleware.userValidators.ensureUser(ctx, next)
    await this.controller.getUser(ctx, next)
    await this.controller.updateUser(ctx, next)
  }
}

export default RouterHanlder
