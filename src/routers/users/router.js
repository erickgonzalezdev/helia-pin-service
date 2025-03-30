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
    this.sendEmailVerificationCode = this.sendEmailVerificationCode.bind(this)
    this.verifyEmailCode = this.verifyEmailCode.bind(this)
    this.verifyTelegram = this.verifyTelegram.bind(this)
    this.changePassword = this.changePassword.bind(this)
    this.sendPasswordResetEmail = this.sendPasswordResetEmail.bind(this)
    this.resetPassword = this.resetPassword.bind(this)
  }

  async start (app) {
    if (!app) { throw new Error('App is required!') }

    this.router.post('/', this.createUser)
    this.router.post('/auth', this.authUser)
    this.router.get('/', this.getUsers)
    this.router.get('/:id', this.getUser)
    this.router.put('/password', this.changePassword)
    this.router.put('/:id', this.updateUser)
    this.router.post('/email/verify', this.verifyEmailCode)
    this.router.get('/email/code', this.sendEmailVerificationCode)
    this.router.post('/telegram/verify', this.verifyTelegram)
    this.router.get('/password/reset', this.resetPassword)
    this.router.post('/password/reset', this.sendPasswordResetEmail)

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

  async sendEmailVerificationCode (ctx, next) {
    await this.middleware.userValidators.ensureUser(ctx, next)
    await this.controller.sendEmailVerificationCode(ctx, next)
  }

  async verifyEmailCode (ctx, next) {
    await this.middleware.userValidators.ensureUser(ctx, next)
    await this.controller.verifyEmailCode(ctx, next)
  }

  async verifyTelegram (ctx, next) {
    await this.middleware.userValidators.ensureUser(ctx, next)
    await this.controller.verifyTelegram(ctx, next)
  }

  async changePassword (ctx, next) {
    await this.middleware.userValidators.ensureUser(ctx, next)
    await this.controller.changePassword(ctx, next)
  }

  async sendPasswordResetEmail (ctx, next) {
    await this.controller.sendPasswordResetEmail(ctx, next)
  }

  async resetPassword (ctx, next) {
    await this.middleware.userValidators.ensurePasswordResetToken(ctx, next)
    await this.controller.resetPassword(ctx, next)
  }
}

export default RouterHanlder
