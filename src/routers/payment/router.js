import Router from 'koa-router'
import Controller from './controller.js'

class RouterHanlder {
  constructor (config = {}) {
    this.middleware = config.middleware

    if (!this.middleware) { throw new Error('Middleware must be provided when instantiate a Router') }

    this.controller = new Controller(config)
    this.port = config.port

    const baseUrl = '/payment'
    this.router = new Router({ prefix: baseUrl })

    // Bind function to this class.
    this.start = this.start.bind(this)
    this.createPayment = this.createPayment.bind(this)
    this.validatePayment = this.validatePayment.bind(this)
    this.cancelPayment = this.cancelPayment.bind(this)
    this.getUserPayments = this.getUserPayments.bind(this)
    this.createPaymentReport = this.createPaymentReport.bind(this)
    this.getReports = this.getReports.bind(this)

  }

  async start (app) {
    if (!app) { throw new Error('App is required!') }

    this.router.post('/', this.createPayment)
    this.router.post('/validate', this.validatePayment)
    this.router.delete('/cancel/:id', this.cancelPayment)
    this.router.get('/user', this.getUserPayments)
    this.router.post('/report', this.createPaymentReport)
    this.router.get('/reports', this.getReports)


    app.use(this.router.routes())
    app.use(this.router.allowedMethods())
  }

  async createPayment (ctx, next) {
    await this.middleware.userValidators.ensureUser(ctx, next)
    await this.controller.createPayment(ctx, next)
  }

  async validatePayment (ctx, next) {
    await this.middleware.userValidators.ensureUser(ctx, next)
    await this.controller.validatePayment(ctx, next)
  }

  async cancelPayment (ctx, next) {
    await this.middleware.userValidators.ensureUser(ctx, next)
    await this.controller.cancelPayment(ctx, next)
  }

  async getUserPayments (ctx, next) {
    await this.middleware.userValidators.ensureUser(ctx, next)
    await this.controller.getUserPayments(ctx, next)
  }

  async createPaymentReport (ctx, next) {
    await this.middleware.userValidators.ensureUser(ctx, next)
    await this.controller.createPaymentReport(ctx, next)
  }
  async getReports (ctx, next) {
    // await this.middleware.userValidators.ensureUser(ctx, next)
    await this.controller.getReports(ctx, next)
  }
}

export default RouterHanlder
