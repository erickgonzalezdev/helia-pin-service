export default class UsersController {
  constructor (config = {}) {
    this.useCases = config.useCases

    if (!this.useCases) { throw new Error('Uses cases must be provided when instantiate a Controller') }

    this.handleError = config.errorHandler.handleCtxError

    // Bind function to this class.
    this.createUser = this.createUser.bind(this)
    this.authUser = this.authUser.bind(this)
    this.getUser = this.getUser.bind(this)
    this.getUsers = this.getUsers.bind(this)
    this.updateUser = this.updateUser.bind(this)
  }

  async createUser (ctx) {
    try {
      const inObj = ctx.request.body
      const user = await this.useCases.users.createUser(inObj)
      ctx.body = {
        user
      }
    } catch (error) {
      this.handleError(ctx, error)
    }
  }

  async authUser (ctx) {
    try {
      const res = await this.useCases.users.authUser(ctx)
      ctx.body = {
        user: res.userObj,
        token: res.token
      }
    } catch (error) {
      this.handleError(ctx, error)
    }
  }

  async getUser (ctx, next) {
    try {
      const user = await this.useCases.users.getUser(ctx.params)
      ctx.body = user
    } catch (error) {
      this.handleError(ctx, error)
    }

    if (next) {
      return next()
    }
  }

  async getUsers (ctx) {
    try {
      const users = await this.useCases.users.getUsers()
      ctx.body = users
    } catch (error) {
      this.handleError(ctx, error)
    }
  }

  async updateUser (ctx) {
    try {
      const existingData = ctx.body
      const newData = ctx.request.body
      const result = await this.useCases.users.updateUser({ existingData, newData })
      ctx.body = result
    } catch (error) {
      this.handleError(ctx, error)
    }
  }
}
