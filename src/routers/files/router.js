import Router from 'koa-router'
import Controller from './controller.js'
import { koaBody } from 'koa-body' // Allow multi part

class RouterHanlder {
  constructor (config = {}) {
    this.middleware = config.middleware

    if (!this.middleware) { throw new Error('Middleware must be provided when instantiate a Router') }

    this.controller = new Controller(config)
    this.port = config.port

    const baseUrl = '/files'
    this.router = new Router({ prefix: baseUrl })

    // Bind function to this class.
    this.start = this.start.bind(this)
    this.uploadFile = this.uploadFile.bind(this)
    this.getFiles = this.getFiles.bind(this)
    this.getFile = this.getFile.bind(this)
  }

  async start (app) {
    if (!app) { throw new Error('App is required!') }

    this.router.post('/', koaBody({ multipart: true, formidable: { maxFileSize: 10 ** 6 * 1000 * 2 } }), this.uploadFile)
    this.router.get('/', this.getFiles)
    this.router.get('/:id', this.getFile)

    app.use(this.router.routes())
    app.use(this.router.allowedMethods())
  }

  async uploadFile (ctx, next) {
    const type = await this.middleware.getJWTType(ctx)
    if (type === 'userAccess') {
      await this.middleware.userValidators.ensureUser(ctx, next)
    }
    if (type === 'boxAccess') {
      await this.middleware.boxValidator.ensureBoxSignature(ctx, next)
    }
    await this.middleware.userValidators.ensureAccount(ctx, next)
    await this.controller.uploadFile(ctx, next)
  }

  async getFiles (ctx, next) {
    await this.middleware.userValidators.ensureUser(ctx, next)
    await this.controller.getFiles(ctx, next)
  }

  async getFile (ctx, next) {
    await this.middleware.userValidators.ensureUser(ctx, next)
    await this.controller.getFile(ctx, next)
  }
}

export default RouterHanlder
