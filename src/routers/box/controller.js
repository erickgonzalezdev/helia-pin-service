export default class PinBoxController {
  constructor(config = {}) {
    this.useCases = config.useCases

    if (!this.useCases) { throw new Error('Uses cases must be provided when instantiate a Controller') }

    this.handleError = config.errorHandler.handleCtxError

    // Bind function to this class.
    this.createBox = this.createBox.bind(this)
    this.getBox = this.getBox.bind(this)
    this.getBoxes = this.getBoxes.bind(this)
    this.updateBox = this.updateBox.bind(this)
    this.deleteBox = this.deleteBox.bind(this)
    this.addPin = this.addPin.bind(this)
    this.boxSignature = this.boxSignature.bind(this)
  }

  /**
 * @api {post} /box Create a new box
 * @apiPermission user
 * @apiName CreateBox
 * @apiGroup Box
 * @apiVersion 1.0.0
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -H "Authorization: Bearer <JWT Token>" -X POST -d '{  "label": "my box", "description": "art box"  }' localhost:5001/box
 *
 * @apiParam {String} label Box title.
 * @apiParam {String} description  Box description.
 *
 *
 */
  async createBox(ctx) {
    try {
      const inObj = ctx.request.body
      inObj.user = ctx.state.user
      const box = await this.useCases.Box.createBox(inObj)
      ctx.body = {
        box
      }
    } catch (error) {
      this.handleError(ctx, error)
    }
  }


  /**
 * @api {get} /box/:id Get Box
 * @apiPermission user
 * @apiName GetBox
 * @apiGroup Box
 * @apiVersion 1.0.0
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -H "Authorization: Bearer <JWT Token>" -X GET localhost:5001/box/<id>
 *
 */
  async getBox(ctx, next) {
    try {
      const box = await this.useCases.Box.getBox(ctx.params)
      ctx.body = { box }
    } catch (error) {
      this.handleError(ctx, error)
    }

    if (next) {
      return next()
    }
  }

  /**
* @api {get} /box Get all boxes
* @apiPermission user
* @apiName GetBoxes
* @apiGroup Box
* @apiVersion 1.0.0
*
* @apiExample Example usage:
* curl -H "Content-Type: application/json" -H "Authorization: Bearer <JWT Token>" -X GET localhost:5001/box
*
*/
  async getBoxes(ctx) {
    try {
      const boxes = await this.useCases.Box.getBoxes()
      ctx.body = boxes
    } catch (error) {
      this.handleError(ctx, error)
    }
  }

  /**
 * @api {put} /box/:id Update a box
 * @apiPermission user
 * @apiName UpdateBox
 * @apiGroup Box
 * @apiVersion 1.0.0
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -H "Authorization: Bearer <JWT Token>" -X PUT -d '{ "description": "new description" }' localhost:5001/box/<id>

 */

  async updateBox(ctx) {
    try {
      const existingData = ctx.body.box
      const newData = ctx.request.body
      const result = await this.useCases.Box.updateBox({ existingData, newData })
      ctx.body = result
    } catch (error) {
      this.handleError(ctx, error)
    }
  }



  /**
   * @api {delete} /box/:id Delete a box
   * @apiPermission user
   * @apiName DeleteBox
   * @apiGroup Box
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X DELETE localhost:5001/box/<id>
   *
   */

  async deleteBox(ctx) {
    try {
      const box = ctx.body.box
      const result = await this.useCases.Box.deleteBox(box)
      ctx.body = result
    } catch (error) {
      this.handleError(ctx, error)
    }
  }

  /**
 * @api {post} /box/add Add a pin to box.
 * @apiPermission User || Box Signature
 * @apiName AddPin
 * @apiGroup Box
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -H "Authorization: Bearer <JWT Token>" -X POST -d '{  "pinId": "my pin id", "boxId": "my box id"  }' localhost:5001/box/add
 *
 */

  async addPin(ctx) {
    try {
      const type = ctx.state.jwtType
      const input = ctx.request.body
      input.user = ctx.state.user
      input.box = ctx.state.box

      let result
      if (type === 'userAccess') {
        result = await this.useCases.Box.addPinByUser(input)
      }

      if (type === 'boxAccess') {
        result = await this.useCases.Box.addPinBySignature(input)
      }
      ctx.body = result
    } catch (error) {
      this.handleError(ctx, error)
    }
  }

  /**
* @api {post} /box/sign Box signature.
* @apiPermission user
* @apiName BoxSignature
* @apiGroup Box
*
* @apiExample Example usage:
* curl -H "Content-Type: application/json" -H "Authorization: Bearer <JWT Token>" -X POST -d '{  "label": "signature label", "boxId": "my box id"  }' localhost:5001/box/sign
*
*/

  async boxSignature(ctx) {
    try {
      const input = ctx.request.body
      input.user = ctx.state.user
      const result = await this.useCases.Box.boxSignature(input)
      ctx.body = result
    } catch (error) {
      this.handleError(ctx, error)
    }
  }
}