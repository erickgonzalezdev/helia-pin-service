export default class NodesController {
  constructor (config = {}) {
    this.useCases = config.useCases

    if (!this.useCases) { throw new Error('Uses cases must be provided when instantiate a Controller') }

    this.handleError = config.errorHandler.handleCtxError

    // Bind function to this class.
    this.getRemoteNodes = this.getRemoteNodes.bind(this)
  }

  async getRemoteNodes (ctx) {
    try {
      const result = await this.useCases.nodes.getRemoteNodes()
      ctx.body = result
    } catch (error) {
      this.handleError(ctx, error)
    }
  }
}
