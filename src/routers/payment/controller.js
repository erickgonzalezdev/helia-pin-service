export default class PaymentController {
  constructor (config = {}) {
    this.useCases = config.useCases

    if (!this.useCases) { throw new Error('Uses cases must be provided when instantiate a Controller') }

    this.handleError = config.errorHandler.handleCtxError

    // Bind function to this class.
    this.createPayment = this.createPayment.bind(this)
    this.validatePayment = this.validatePayment.bind(this)
    this.cancelPayment = this.cancelPayment.bind(this)
    this.getUserPayments = this.getUserPayments.bind(this)
  }

  /**
 * @api {post} /payment Create new Payment
 * @apiPermission user
 * @apiName CreatePayment
 * @apiGroup Payments
 * @apiVersion 1.0.0
 * @apiIgnore
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -X POST -d '{"accountType": 1  , chain:'avax' }' localhost:5001/payment
 *
 *
 */
  async createPayment (ctx) {
    try {
      const inObj = ctx.request.body
      inObj.user = ctx.state.user
      const payment = await this.useCases.payments.createPayment(inObj)
      ctx.body = {
        payment
      }
    } catch (error) {
      this.handleError(ctx, error)
    }
  }

  /**
* @api {post} /payments Validate Payment.
* @apiPermission user
* @apiName ValidatePayment
* @apiGroup Payments
* @apiVersion 1.0.0
* @apiIgnore
* @apiExample Example usage:
* curl -H "Content-Type: application/json" -X POST -d '{"paymentId": 'payment id' }' localhost:5001/payment/validate
*
*
*/
  async validatePayment (ctx) {
    try {
      const inObj = ctx.request.body
      inObj.user = ctx.state.user
      const result = await this.useCases.payments.validatePayment(inObj)
      ctx.body = result
    } catch (error) {
      this.handleError(ctx, error)
    }
  }

  /**
* @api {post} /payments Cancel Payment.
* @apiPermission user
* @apiName CancelPayment
* @apiGroup Payments
* @apiVersion 1.0.0
* @apiIgnore
* @apiExample Example usage:
* curl -H "Content-Type: application/json" -X DELETE  localhost:5001/payment/cancel/<id>
*
*
*/
  async cancelPayment (ctx) {
    try {
      const result = await this.useCases.payments.cancelPayment(ctx.params)
      ctx.body = result
    } catch (error) {
      this.handleError(ctx, error)
    }
  }

  /**
* @api {post} /payments/user/ Get Payments By User.
* @apiPermission user
* @apiName GetUserPayments
* @apiGroup Payments
* @apiVersion 1.0.0
* @apiIgnore
* @apiExample Example usage:
* curl -H "Content-Type: application/json" -X DELETE  localhost:5001/payment/user/
*
*
*/
  async getUserPayments (ctx) {
    try {
      const payments = await this.useCases.payments.getUserPayments(ctx.state.user)
      ctx.body = {
        payments
      }
    } catch (error) {
      this.handleError(ctx, error)
    }
  }
}
