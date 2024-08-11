export default class PinUseCases {
  constructor (config = {}) {
    this.config = config
    this.db = config.libraries.dbModels
    this.heliaNode = config.libraries.heliaNode
    this.wlogger = config.libraries.wlogger
    this.passport = config.libraries.passport

    this.handleUnpinedDelay = 1000 // 1seg

    // Bind function to this class.
    this.pinFile = this.pinFile.bind(this)
    this.getPins = this.getPins.bind(this)
    this.getPin = this.getPin.bind(this)
    this.handleUnpinedFiles = this.handleUnpinedFiles.bind(this)
    this.sleep = this.sleep.bind(this)
  }

  async pinFile (inObj = {}) {
    try {
      const { file } = inObj
      if (!file) {
        throw new Error('file is required!')
      }

      // Upload file to the ipfs node
      const cidObject = await this.heliaNode.node.uploadFile(file.filepath)
      const cid = cidObject.toString()

      let pin = await this.db.Pin.findOne({ cid })

      // create pin data into the db
      if (!pin) {
        pin = new this.db.Pin({ cid })
        pin.createdAt = new Date().getTime()
        pin.type = file.mimetype
        pin.name = file.originalFilename
        pin.size = file.size
        pin.pinned = false
        await pin.save()
      }

      // ignore pinned files
      if (pin && !pin.pinned) {
        // Pin file into ipfs node
        try {
          const rpcObj = {
            toPeerId: this.config.pinHostPeerId,
            fromPeerId: this.heliaNode.node.peerId.toString(),
            cid
          }
          this.heliaNode.rpc.requestRemotePin(rpcObj)
        } catch (error) {
          this.wlogger.error('Error on pin file RPC ', error)
          // ignore if is already pinned
          if (!error.message.match('Already')) throw error
        }
      }

      return pin
    } catch (error) {
      this.wlogger.error(`Error in use-cases/pinFile() ${error.message}`)
      throw error
    }
  }

  async getPins () {
    try {
      const pins = await this.db.Pin.find({})
      return pins
    } catch (error) {
      this.wlogger.error(`Error in use-cases/getPins() $ ${error.message}`)
      throw error
    }
  }

  async getPin (inObj = {}) {
    try {
      const { id } = inObj

      if (!id || typeof id !== 'string') {
        throw new Error('id is required')
      }
      const pin = await this.db.Pin.findById(id)
      return pin
    } catch (error) {
      this.wlogger.error(`Error in use-cases/getPin() $ ${error.message}`)
      throw error
    }
  }

  async handleUnpinedFiles () {
    try {
      const unpinedCID = await this.db.Pin.find({ pinned: false })
      console.log(`Unpined files : ${unpinedCID.length}`)

      for (let i = 0; i < unpinedCID.length; i++) {
        const pinObj = unpinedCID[i]
        const rpcObj = {
          toPeerId: this.config.pinHostPeerId,
          fromPeerId: this.heliaNode.node.peerId.toString(),
          cid: pinObj.cid
        }
        this.wlogger.info('handling unpined cid ', rpcObj)
        this.heliaNode.rpc.requestRemotePin(rpcObj)
        await this.sleep(this.handleUnpinedDelay)
      }
      return true
    } catch (error) {
      this.wlogger.error(`Error in use-cases/handleUnpinedFiles() $ ${error.message}`)
      throw error
    }
  }

  // TODO :  move to /util
  sleep (delay) {
    return new Promise((resolve) => setTimeout(resolve, delay))
  }
}
