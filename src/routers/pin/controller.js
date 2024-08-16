export default class PinController {
  constructor (config = {}) {
    this.useCases = config.useCases

    if (!this.useCases) { throw new Error('Uses cases must be provided when instantiate a Controller') }

    this.handleError = config.errorHandler.handleCtxError

    // Bind function to this class.
    this.getPinsByBox = this.getPinsByBox.bind(this)
  }

  async getPinsByBox (ctx) {
    try {
      const boxId = ctx.request.params.id

      const result = await this.useCases.pin.getPinsByBox({ boxId })
      ctx.body = result
    } catch (error) {
      this.handleError(ctx, error)
    }
  }
}
