export default class PinUseCases {
  constructor (config = {}) {
    this.db = config.libraries.dbModels
    this.heliaNode = config.libraries.heliaNode
    this.wlogger = config.libraries.wlogger
    this.passport = config.libraries.passport

    // Bind function to this class.
    this.pinFile = this.pinFile.bind(this)
    this.getPins = this.getPins.bind(this)
    this.getPin = this.getPin.bind(this)
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
      // Pin file into ipfs node
      try {
        await this.heliaNode.node.pinCid(cidObject)
      } catch (error) {
        // ignore if is already pinned
        if (!error.message.match('Already')) throw error
      }

      let pin = await this.db.Pin.findOne({ cid })
      // create pin data into the db
      if (!pin) {
        pin = new this.db.Pin({ cid })
        pin.createdAt = new Date().getTime()
        pin.type = file.mimetype
        pin.name = file.originalFilename
        pin.size = file.size
        await pin.save()
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
}
