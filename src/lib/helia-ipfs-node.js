import { HeliaNode as Node, Server, PinRPC } from 'helia-ipfs-node/src/lib.js'
import { CID } from 'multiformats/cid'

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
    this.targetNode = null
    this.CID = CID

    // Bind function
    this.start = this.start.bind(this)
    this.onSuccessRemotePin = this.onSuccessRemotePin.bind(this)
    this.onSuccessRemoteUnpin = this.onSuccessRemoteUnpin.bind(this)
    this.remotePin = this.remotePin.bind(this)
    this.remoteUnpin = this.remoteUnpin.bind(this)
    this.setTargetNode = this.setTargetNode.bind(this)
    this.tryLocallyPin = this.tryLocallyPin.bind(this)
    this.tryLocallyUnpin = this.tryLocallyUnpin.bind(this)
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
        onSuccessRemotePin: this.onSuccessRemotePin,
        onSuccessRemoteUnpin: this.onSuccessRemoteUnpin
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

      const file = await this.dbModels.Files.findOne({ cid })
      if (!file) throw new Error('file not found!')

      file.pinned = true
      file.pinnedAt = new Date().getTime()
      file.host.push(host)
      await file.save()

      this.wlogger.info(`${cid} file updated after pin.!`)
      // Unpin locally due to it is currently pinned-remotely from an external node.
      this.tryLocallyUnpin(cid)
      return file
    } catch (error) {
      this.wlogger.error('Error on onSuccessRemotePin() ', error)
      // skip error
      return false
    }
  }

  async onSuccessRemoteUnpin (data = {}) {
    try {
      const { cid, host } = data
      if (!cid || typeof cid !== 'string') throw new Error('cid must be a string!')
      if (!host || typeof host !== 'string') throw new Error('host must be a string!')

      this.wlogger.info('success remote un-pin ', data)

      const file = await this.dbModels.Files.findOne({ cid })
      if (!file) throw new Error('file not found!')

      file.pinned = false
      await file.save()

      return file
    } catch (error) {
      this.wlogger.error('Error on onSuccessRemoteUnpin() ', error)
      // skip error
      return false
    }
  }

  // pin file remotely
  remotePin (cid, target) {
    try {
      if (!cid) throw new Error('cid must be a string!')
      if (!target) throw new Error('target must be a string!')
      const rpcObj = {
        toPeerId: target,
        fromPeerId: this.node.peerId.toString(),
        cid
      }

      this.rpc.requestRemotePin(rpcObj)
      return rpcObj
    } catch (error) {
      this.wlogger.error('Error on remotePin() ', error.message)
      return false
    }
  }

  // unpin file remotely
  remoteUnpin (cid, target) {
    try {
      if (!cid) throw new Error('cid must be a string!')
      if (!target) throw new Error('target must be a string!')
      const rpcObj = {
        toPeerId: target,
        fromPeerId: this.node.peerId.toString(),
        cid
      }

      this.rpc.requestRemoteUnpin(rpcObj)
      return rpcObj
    } catch (error) {
      this.wlogger.error('Error on remoteUnpin() ', error.message)
      return false
    }
  }

  // Pin strategy , looking for low space usage in a node  and select as node pin target.
  setTargetNode () {
    try {
      if (!this.rpc) {
        throw new Error('node rpc is not initialized')
      }

      const nodeList = this.rpc.getSubscriptionList()

      if (!nodeList.length) {
        throw new Error('node list is empty')
      }

      let targetNode = nodeList[0]

      for (let i = 1; i < nodeList.length; i++) {
        const node = nodeList[i]
        if (node && node.diskSize < targetNode.diskSize) {
          targetNode = node
        }
      }
      this.wlogger.info(`Selected node ${targetNode.peerId}`)
      this.targetNode = targetNode.peerId
      return targetNode.peerId
    } catch (error) {
      this.wlogger.error('Error on applyPlinStrategy() ', error)
      throw error
    }
  }

  async tryLocallyUnpin (cid) {
    try {
      await this.node.unPinCid(this.CID.parse(cid))

      return true
    } catch (error) {
      // skip error
      return false
    }
  }

  async tryLocallyPin (cid) {
    try {
      await this.node.pinCid(this.CID.parse(cid))

      return true
    } catch (error) {
      // skip error
      return false
    }
  }
}

export default HeliaNode
