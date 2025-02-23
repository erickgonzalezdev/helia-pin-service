export default class AccountController {
  constructor (config = {}) {
    this.useCases = config.useCases

    if (!this.useCases) { throw new Error('Uses cases must be provided when instantiate a Controller') }

    this.handleError = config.errorHandler.handleCtxError

    // Bind function to this class.
    this.refreshAccount = this.refreshAccount.bind(this)
    this.getFreeAccount = this.getFreeAccount.bind(this)
  }

  /**
 * @api {get} /accounts/free Get free account
 * @apiPermission user
 * @apiName CreateAccount
 * @apiGroup Accounts
 * @apiVersion 1.0.0
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -H "Authorization: Bearer <JWT Token>" -X GET  localhost:5001/account/free
 *
 *
 */
  async getFreeAccount (ctx) {
    try {
      const account = await this.useCases.accounts.getFreeAccount(ctx.state.user)
      ctx.body = {
        account
      }
    } catch (error) {
      this.handleError(ctx, error)
    }
  }

  /**
* @api {post} /accounts Get Account by id.
* @apiPermission user
* @apiName RefreshAccount
* @apiGroup Accounts
* @apiVersion 1.0.0
*
* @apiExample Example usage:
* curl -H "Content-Type: application/json" -H "Authorization: Bearer <JWT Token>" -X GET  localhost:5001/account/<id>
*
*
*/
  async refreshAccount (ctx) {
    try {
      const account = await this.useCases.accounts.refreshAccount(ctx.params)
      ctx.body = {
        account
      }
    } catch (error) {
      this.handleError(ctx, error)
    }
  }
}
