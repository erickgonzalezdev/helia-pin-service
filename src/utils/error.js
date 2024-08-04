class ErrorHandler {
  constructor (config = {}) {
    this.config = config
  }

  handleCtxError (ctx, err) {
    if (err.status) {
      if (err.message) {
        ctx.throw(err.status, err.message)
      } else {
        ctx.throw(err.status, 'Unknow Error')
      }
    } else if (err.message) {
      ctx.throw(422, err.message)
    } else {
      ctx.throw(422, 'Unknow Error')
    }
  }
}

export default ErrorHandler
