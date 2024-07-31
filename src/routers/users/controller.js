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

  /**
 * @api {post} /users Create a new user
 * @apiPermission user
 * @apiName CreateUser
 * @apiGroup Users
 * @apiVersion 1.0.0
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -X POST -d '{  "username": "newUser", "password": "mypass"  }' localhost:5001/users
 *
 * @apiParam {String} username User Username.
 * @apiParam {String} password User Password.
 *
 * @apiSuccess {Object}   user            User object
 * @apiSuccess {ObjectId} users._id       User id
 * @apiSuccess {String}   users.username  User username
 *
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
 * @apiGroup Auth
 * @apiVersion 1.0.0
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -X POST -d '{ "username": "username", "password": "mypass" }' localhost:5001/users/auth
 *
 *
 * @apiParam {String} username  User username.
 * @apiParam {String} password  User password.
 *
 * @apiSuccess {String}   token          Encoded JWT
 * @apiSuccess {Object}   user           User object
 * @apiSuccess {ObjectId} user._id       User id
 * @apiSuccess {String}   user.username  User username
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
 * @apiSuccess {String}   users.username  User username
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
* @apiSuccess {String}   users.username  User username
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
 * @apiSuccess {String}   users.username  Updated username
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
}
