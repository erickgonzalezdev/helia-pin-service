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
    this.sendEmailVerificationCode = this.sendEmailVerificationCode.bind(this)
    this.verifyEmailCode = this.verifyEmailCode.bind(this)
    this.verifyTelegram = this.verifyTelegram.bind(this)
    this.changePassword = this.changePassword.bind(this)
    this.sendPasswordResetEmail = this.sendPasswordResetEmail.bind(this)
    this.resetPassword = this.resetPassword.bind(this)
  }

  /**
 * @api {post} /users Create a new user
 * @apiPermission user
 * @apiName CreateUser
 * @apiGroup Users
 * @apiVersion 1.0.0
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -X POST -d '{  "email": "newuser@email.com", "password": "mypass"  }' localhost:5001/users
 *
 * @apiParam {String} email User Email.
 * @apiParam {String} password User Password.
 *
 * @apiSuccess {Object}   user            User object
 * @apiSuccess {ObjectId} users._id       User id
 * @apiSuccess {String}   users.email     User Email
 * @apiIgnore
 */
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

  /**
 * @api {post} /users/auth Authenticate user
 * @apiName AuthUser
 * @apiGroup Users
 * @apiVersion 1.0.0
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -X POST -d '{ "email": "newuser@email.com", "password": "mypass" }' localhost:5001/users/auth
 *
 *
 * @apiParam {String} email  User Email.
 * @apiParam {String} password  User Password.
 *
 * @apiSuccess {String}   token          Encoded JWT
 * @apiSuccess {Object}   user           User object
 * @apiSuccess {ObjectId} user._id       User id
 * @apiSuccess {String}   user.email     User email
 *
 */

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

  /**
 * @api {get} /users/:id Get user
 * @apiPermission user
 * @apiName GetUser
 * @apiGroup Users
 * @apiVersion 1.0.0
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -H "Authorization: Bearer <JWT Token>" -X GET localhost:5001/users/<id>
 *
 * @apiParam {String} :id  User _id.
 *
 * @apiSuccess {Object}   user            User object
 * @apiSuccess {ObjectId} users._id       User id
 * @apiSuccess {String}   user.email     User email
 * @apiIgnore
 */
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

  /**
* @api {get} /users Get all users
* @apiPermission user
* @apiName GetUsers
* @apiGroup Users
* @apiVersion 1.0.0
*
* @apiExample Example usage:
* curl -H "Content-Type: application/json" -H "Authorization: Bearer <JWT Token>" -X GET localhost:5001/users
*
*
* @apiSuccess {Array} users              Users Array
* @apiSuccess {Object}   user            User object
* @apiSuccess {ObjectId} users._id       User id
 * @apiSuccess {String}   user.email     User email
 * @apiIgnore
*/
  async getUsers (ctx) {
    try {
      const users = await this.useCases.users.getUsers()
      ctx.body = users
    } catch (error) {
      this.handleError(ctx, error)
    }
  }

  /**
 * @api {put} /users/:id Update a user
 * @apiPermission user
 * @apiName UpdateUser
 * @apiGroup Users
 * @apiVersion 1.0.0
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -H "Authorization: Bearer <JWT Token>" -X PUT -d '{ "username": "new username" }' localhost:5001/users/<id>
 *
 * @apiParam {String} :id  User _id.
 * @apiParam {String} username     Username.
 *
 * @apiSuccess {ObjectId} users._id       User id
 * @apiSuccess {String}   user.email      User email
 * @apiIgnore
 */

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

  /**
 * @api {POST} /users/email/verify Verify Email Code.
 * @apiPermission user
 * @apiName VerifyEmailCode
 * @apiGroup Users
 * @apiVersion 1.0.0
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -H "Authorization: Bearer <JWT Token>" -X POST -d '{ "code": 123456 }' localhost:5001/users/email/verify
 * @apiIgnore
 */
  async verifyEmailCode (ctx) {
    try {
      const code = ctx.request.body.code
      const user = ctx.state.user
      const result = await this.useCases.users.verifyEmailCode({ code, user })

      ctx.body = result
    } catch (err) {
      this.handleError(ctx, err)
    }
  }

  /**
 * @api {get} /users/email/code Get Email Code.
 * @apiPermission user
 * @apiName GetEmailCode
 * @apiGroup Users
 * @apiVersion 1.0.0
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -H "Authorization: Bearer <JWT Token>" -X GET localhost:5001/users/email/code
 * @apiIgnore
 */
  async sendEmailVerificationCode (ctx) {
    try {
      const user = ctx.state.user
      const result = await this.useCases.users.sendEmailVerificationCode({ user })

      ctx.body = result
    } catch (err) {
      this.handleError(ctx, err)
    }
  }

  /**
* @api {POST} /users/telegram/verify Verify Telegram.
* @apiPermission user
* @apiName VerifyTelegram
* @apiGroup Users
* @apiVersion 1.0.0
*
* @apiExample Example usage:
* curl -H "Content-Type: application/json" -H "Authorization: Bearer <JWT Token>" -X POST -d '{ "code": 123456 }' localhost:5001/users/telegram/verify
* @apiIgnore
*/
  async verifyTelegram (ctx) {
    try {
      const code = ctx.request.body.code
      const chatId = ctx.request.body.chatId
      const user = ctx.state.user
      const result = await this.useCases.users.verifyTelegram({ code, chatId, user })

      ctx.body = result
    } catch (err) {
      this.handleError(ctx, err)
    }
  }

  /**
* @api {PUT} /users/password
* @apiPermission user
* @apiName ChangePassword
* @apiGroup Users
* @apiVersion 1.0.0
*
* @apiExample Example usage:
* curl -H "Content-Type: application/json" -H "Authorization: Bearer <JWT Token>" -X PUT -d '{ "newPassword":"newpass123","currentPassword": 123456 }' localhost:5001/users/password
* @apiIgnore
*/
  async changePassword (ctx) {
    try {
      const user = ctx.state.user
      const newPassword = ctx.request.body.newPassword
      const currentPassword = ctx.request.body.currentPassword

      const result = await this.useCases.users.changePassword({ user, newPassword, currentPassword })
      ctx.body = result
    } catch (err) {
      this.handleError(ctx, err)
    }
  }

  /**
 * @api {POST} /users/password/reset Send Password Reset Email.
 * @apiPermission public
 * @apiName SendPasswordResetEmail
 * @apiGroup Users
 * @apiVersion 1.0.0
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -X POST -d '{ "email": "newuser@email.com" }' localhost:5001/users/password/reset
 * @apiIgnore
 */
  async sendPasswordResetEmail (ctx) {
    try {
      const email = ctx.request.body.email
      const token = await this.useCases.users.sendPasswordResetEmail({ email })
      ctx.body = {
        token
      }
    } catch (err) {
      this.handleError(ctx, err)
    }
  }

  /**
 * @api {GET} /users/password/reset Reset Password.
 * @apiPermission user
 * @apiName ResetPassword
 * @apiGroup Users
 * @apiVersion 1.0.0
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -H "Authorization: Bearer <JWT Token>" -X POST localhost:5001/users/password/reset
 */
  async resetPassword (ctx) {
    try {
      const user = ctx.state.user
      await this.useCases.users.resetPassword({ user })
      ctx.body = { success: true }
    } catch (err) {
      this.handleError(ctx, err)
    }
  }
}
