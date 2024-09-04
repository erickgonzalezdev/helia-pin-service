export default class NodesUseCases {
  constructor (config = {}) {
    this.heliaNode = config.libraries.heliaNode
    this.wlogger = config.libraries.wlogger

    // Bind function to this class.
    this.getRemoteNodes = this.getRemoteNodes.bind(this)
  }

  async getRemoteNodes () {
    try {
      const result = this.heliaNode.rpc.getSubscriptionList()
      return result
    } catch (error) {
      this.wlogger.error(`Error in use-cases/getRemoteNodes() $ ${error.message}`)
      throw error
    }
  }
}
