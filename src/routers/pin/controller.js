export default class PinController {
  constructor (config = {}) {
    this.useCases = config.useCases

    if (!this.useCases) { throw new Error('Uses cases must be provided when instantiate a Controller') }

    this.handleError = config.errorHandler.handleCtxError

    // Bind function to this class.
    this.pin = this.pin.bind(this)
    this.getPins = this.getPins.bind(this)
  }

  /**
 * @api {post} /pin Upload and pin file.
 * @apiPermission user
 * @apiName PinFile
 * @apiGroup PIN
 * @apiVersion 1.0.0
 *
 * @apiExample Example usage:
 * curl --form upload=@image.jpeg localhost:5001/pin
 *
 * @apiParam {FILE} File to upload.
 *
 * @apiSuccess {String}   CID  content id.
 *
 */
  async pin (ctx) {
    try {
      const file = ctx.request.files.file || ctx.request.files.upload

      const result = await this.useCases.pin.pinFile({ file })
      ctx.body = result
    } catch (error) {
      this.handleError(ctx, error)
    }
  }

  /**
 * @api {get} /users/:id Get Pins
 * @apiPermission user
 * @apiName GetPINs
 * @apiGroup PIN
 * @apiVersion 1.0.0
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -H "Authorization: Bearer <JWT Token>" -X GET localhost:5001/pins
 *
 */
  async getPins (ctx) {
    try {
      const pins = await this.useCases.pin.getPins()
      ctx.body = pins
    } catch (error) {
      this.handleError(ctx, error)
    }
  }
}
