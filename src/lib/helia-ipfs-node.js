import { HeliaNode as Node, Server } from 'helia-ipfs-node/src/index.js'

class HeliaNode {
  constructor (config = {}) {
    this.config = config
    this.HeliaNode = Node
    this.HeliaServer = Server
    this.node = null
    this.gateway = null
    this.wlogger = this.config.wlogger

    // Bind function
    this.start = this.start.bind(this)
  }

  async start () {
    try {
      this.node = new this.HeliaNode(this.config)
      await this.node.start()
      console.log('node started!')

      // Start Gateway.
      this.gateway = new this.HeliaServer({ node: this.node, port: this.config.gatewayPort })
      await this.gateway.start()
    } catch (error) {
      this.wlogger.error(`Error in helia-node-ipfs/start() $ ${error.message}`)
      throw error
    }
  }
}

export default HeliaNode
