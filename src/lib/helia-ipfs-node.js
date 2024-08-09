import { HeliaNode as Node, Server, PinRPC } from 'helia-ipfs-node/src/index.js'

class HeliaNode {
  constructor (config = {}) {
    if (!config.dbModels) {
      throw new Error('dbModels must be passed in constructor when instatiate HeliaNode lib.')
    }
    this.config = config
    this.dbModels = this.config.dbModels
    this.HeliaNode = Node
    this.HeliaServer = Server
    this.PinRPC = PinRPC
    this.node = null
    this.gateway = null
    this.rpc = null
    this.wlogger = this.config.wlogger

    // Bind function
    this.start = this.start.bind(this)
    this.onSuccessRemotePin = this.onSuccessRemotePin.bind(this)
  }

  async start () {
    try {
      this.node = new this.HeliaNode(this.config)
      await this.node.start()
      this.wlogger.info('node started!')

      // Start Gateway.
      this.gateway = new this.HeliaServer({ node: this.node, port: this.config.gatewayPort })
      await this.gateway.start()

      this.rpc = new this.PinRPC({
        node: this.node,
        topic: this.config.rpcTopic,
        onSuccessRemotePin: this.onSuccessRemotePin
      })
      await this.rpc.start()
    } catch (error) {
      this.wlogger.error(`Error in helia-node-ipfs/start() $ ${error.message}`)
      throw error
    }
  }

  async onSuccessRemotePin (data = {}) {
    try {
      const { cid, host } = data
      if (!cid || typeof cid !== 'string') throw new Error('cid must be a string!')
      if (!host || typeof host !== 'string') throw new Error('host must be a string!')

      this.wlogger.info('success remote pin ', data)

      const pin = await this.dbModels.Pin.findOne({ cid })
      if (!pin) throw new Error('pin not found!')

      pin.pinned = true
      pin.host.push(host)
      await pin.save()

      return pin
    } catch (error) {
      this.wlogger.error('Error on onSuccessRemotePin() ', error)
      // skip error
      return false
    }
  }
}

export default HeliaNode
