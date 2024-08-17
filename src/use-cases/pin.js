export default class PinUseCases {
  constructor (config = {}) {
    this.config = config
    this.db = config.libraries.dbModels
    this.wlogger = config.libraries.wlogger
    this.heliaNode = config.libraries.heliaNode

    // Bind function to this class.
    this.addPinByUser = this.addPinByUser.bind(this)
    this.addPinBySignature = this.addPinBySignature.bind(this)
    this.getPinsByBox = this.getPinsByBox.bind(this)
  }

  // add pin by user
  async addPinByUser (inObj = {}) {
    try {
      const { fileId, boxId, user, name, description } = inObj
      if (!fileId) throw new Error('fileId is required!')
      if (!boxId) throw new Error('boxId is required!')
      if (!user) throw new Error('user is required!')

      const box = await this.db.Box.findById(boxId)
      if (!box) throw new Error('Box not found!')

      if (box.owner.toString() !== user._id.toString()) {
        throw new Error('Unauthorized!')
      }

      const file = await this.db.Files.findById(fileId)
      if (!file) throw new Error('File not found!')

      const pin = new this.db.Pin({ boxOwner: boxId, file: fileId, name, description })
      pin.createdAt = new Date().getTime()

      await pin.save()

      // Pin file
      this.heliaNode.remotePin(file.cid)

      return pin
    } catch (error) {
      this.wlogger.error(`Error in use-cases/addPinByUser() $ ${error.message}`)
      throw error
    }
  }

  // add pin by external
  async addPinBySignature (inObj = {}) {
    try {
      const { fileId, box, user, boxId } = inObj
      if (!fileId) throw new Error('fileId is required!')
      if (!box) throw new Error('box is required!')
      if (!user) throw new Error('user is required!')

      if (box.owner.toString() !== user._id.toString()) {
        throw new Error('Unauthorized!')
      }

      // Ensure that the signature belongs to the provided boxid
      if (boxId && boxId !== box._id) {
        throw new Error('The signature does not belong to provided box.')
      }

      const file = await this.db.Files.findById(fileId)
      if (!file) throw new Error('File not found!')

      const pin = new this.db.Pin({ boxOwner: box._id.toString(), file: fileId })
      pin.createdAt = new Date().getTime()

      await pin.save()

      // Pin file
      this.heliaNode.remotePin(file.cid)

      return pin
    } catch (error) {
      this.wlogger.error(`Error in use-cases/addPinBySignature() $ ${error.message}`)
      throw error
    }
  }

  async getPinsByBox (inObj = {}) {
    try {
      const { boxId } = inObj

      const box = await this.db.Box.findById(boxId)
      if (!box) {
        throw new Error('Box not found!')
      }

      /*

        TODO:  validate box reader-permissions.
         if(box.owner !== user._id.toString()){
         throw new Error('Unauthorized')
        } */

      const pins = await this.db.Pin.find({ boxOwner: boxId }).populate('file', ['-host'])

      return pins
    } catch (error) {
      this.wlogger.error(`Error in use-cases/getFiles() $ ${error.message}`)
      throw error
    }
  }
}
