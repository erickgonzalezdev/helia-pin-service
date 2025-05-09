export default class PinController {
  constructor (config = {}) {
    this.useCases = config.useCases

    if (!this.useCases) { throw new Error('Uses cases must be provided when instantiate a Controller') }

    this.handleError = config.errorHandler.handleCtxError

    // Bind function to this class.
    this.addPin = this.addPin.bind(this)
    this.getPinsByBox = this.getPinsByBox.bind(this)
    this.deletePin = this.deletePin.bind(this)
  }

  /**
 * @api {post} /pin Add a pin to box.
 * @apiPermission User || Box Signature
 * @apiName AddPin
 * @apiGroup Pin
 *
 * @apiParam {String} pinId The ID of the pin to add
 * @apiParam {String} boxId The ID of the box to add the pin to
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -H "Authorization: Bearer <JWT Token>" -X POST -d '{  "pinId": "my pin id", "boxId": "my box id"  }' localhost:5001/pin
 *
 */

  async addPin (ctx) {
    try {
      const type = ctx.state.jwtType
      const input = ctx.request.body
      input.user = ctx.state.user
      input.box = ctx.state.box

      let result
      if (type === 'userAccess') {
        result = await this.useCases.pin.addPinByUser(input)
      }

      if (type === 'boxAccess') {
        result = await this.useCases.pin.addPinBySignature(input)
      }
      ctx.body = result
    } catch (error) {
      this.handleError(ctx, error)
    }
  }

  /**
 * @api {get} /pin/box/:id Get box pins.
 * @apiPermission User || Box Signature
 * @apiName GetPinsByBox
 * @apiGroup Pin
 *
 * @apiParam {String} id The ID of the box to get pins from
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -H "Authorization: Bearer <JWT Token>" -X GET localhost:5001/pin/box/<id>
 *
 */
  async getPinsByBox (ctx) {
    try {
      const boxId = ctx.request.params.id
      const user = ctx.state.user
      const result = await this.useCases.pin.getPinsByBox({ boxId, user })
      ctx.body = result
    } catch (error) {
      this.handleError(ctx, error)
    }
  }

  /**
 * @api {delete} /pin/:id Delete Pin.
 * @apiPermission User
 * @apiName DeletePin
 * @apiGroup Pin
 *
 * @apiParam {String} id The ID of the pin to delete
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -H "Authorization: Bearer <JWT Token>" -X DELETE localhost:5001/pin/<id>
 *
 */
  async deletePin (ctx) {
    try {
      const pinId = ctx.request.params.id
      const user = ctx.state.user

      const result = await this.useCases.pin.deletePin({ pinId, user })
      ctx.body = result
    } catch (error) {
      this.handleError(ctx, error)
    }
  }
}
