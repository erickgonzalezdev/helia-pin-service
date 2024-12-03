export default class AccountController {
  constructor (config = {}) {
    this.useCases = config.useCases

    if (!this.useCases) { throw new Error('Uses cases must be provided when instantiate a Controller') }

    this.handleError = config.errorHandler.handleCtxError

    // Bind function to this class.
    this.createAccount = this.createAccount.bind(this)
  }

  /**
 * @api {post} /accounts Create a new account
 * @apiPermission user
 * @apiName CreateAccount
 * @apiGroup Accounts
 * @apiVersion 1.0.0
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -X POST -d '{  "userId": "user mongodb id", "type": 1 ,"expirationData" : { "months" : 3 }  }' localhost:5001/accounts
 *
 *
 */
  async createAccount (ctx) {
    try {
      const inObj = ctx.request.body
      const account = await this.useCases.accounts.createAccount(inObj)
      ctx.body = {
        account
      }
    } catch (error) {
      this.handleError(ctx, error)
    }
  }
}
