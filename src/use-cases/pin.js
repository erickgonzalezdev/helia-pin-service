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
    this.deletePin = this.deletePin.bind(this)
  }

  // add pin by user
  async addPinByUser (inObj = {}) {
    try {
      const { fileId, boxId, user, name, description } = inObj
      if (!fileId) throw new Error('fileId is required!')
      if (!boxId) throw new Error('boxId is required!')
      if (!user) throw new Error('user is required!')

      const account = await this.db.Account.findById(user.account)
      if (!account) {
        throw new Error('account is required!')
      }

      const box = await this.db.Box.findById(boxId)
      if (!box) throw new Error('Box not found!')

      if (box.owner.toString() !== user._id.toString()) {
        throw new Error('Unauthorized!')
      }

      const file = await this.db.Files.findById(fileId)
      if (!file) throw new Error('File not found!')

      if (account.currentBytes + file.size > account.maxBytes) {
        throw new Error('The account does not have enough space.')
      }

      const pin = new this.db.Pin({ userOwner: box.owner.toString(), boxOwner: boxId, file: fileId, name, description })
      pin.createdAt = new Date().getTime()

      // Pin file
      this.heliaNode.remotePin(file.cid, this.heliaNode.targetNode)

      file.targetNode = this.heliaNode.targetNode
      await pin.save()

      file.pinCount = file.pinCount + 1

      await file.save()

      // Update account

      account.currentBytes += file.size
      await account.save()

      return pin
    } catch (error) {
      this.wlogger.error(`Error in use-cases/addPinByUser() $ ${error.message}`)
      throw error
    }
  }

  // add pin by external
  async addPinBySignature (inObj = {}) {
    try {
      const { fileId, box, user, boxId, name, description } = inObj
      if (!fileId) throw new Error('fileId is required!')
      if (!box) throw new Error('box is required!')
      if (!user) throw new Error('user is required!')

      const account = await this.db.Account.findById(user.account)
      if (!account) {
        throw new Error('account is required!')
      }

      if (box.owner.toString() !== user._id.toString()) {
        throw new Error('Unauthorized!')
      }

      // Ensure that the signature belongs to the provided boxid
      if (boxId && boxId !== box._id.toString()) {
        throw new Error('The signature does not belong to provided box.')
      }

      const file = await this.db.Files.findById(fileId)
      if (!file) throw new Error('File not found!')

      if (account.currentBytes + file.size > account.maxBytes) {
        throw new Error('The account does not have enough space.')
      }

      const pin = new this.db.Pin({ userOwner: box.owner.toString(), boxOwner: box._id.toString(), file: fileId, name, description })
      pin.createdAt = new Date().getTime()

      // Pin file
      this.heliaNode.remotePin(file.cid, this.heliaNode.targetNode)

      file.targetNode = this.heliaNode.targetNode
      await pin.save()

      file.pinCount = file.pinCount + 1

      await file.save()

      // Update account

      account.currentBytes += file.size
      await account.save()

      return pin
    } catch (error) {
      this.wlogger.error(`Error in use-cases/addPinBySignature() $ ${error.message}`)
      throw error
    }
  }

  async getPinsByBox (inObj = {}) {
    try {
      const { boxId, user } = inObj

      const box = await this.db.Box.findById(boxId)
      if (!box) {
        throw new Error('Box not found!')
      }

      // TODO:  validate box reader-permissions.
      if (user && box.owner !== user._id.toString()) {
        throw new Error('Unauthorized')
      }

      const pins = await this.db.Pin.find({ boxOwner: boxId }).populate('file', ['-host'])

      return pins
    } catch (error) {
      this.wlogger.error(`Error in use-cases/getFiles() $ ${error.message}`)
      throw error
    }
  }

  // add pin by user
  async deletePin (inObj = {}) {
    try {
      /*

        TODO:  validate box writer-permissions.
        } */
      const { pinId, user } = inObj
      const pinObj = await this.db.Pin.findById(pinId)
      const boxOwner = await this.db.Box.findById(pinObj.boxOwner)

      const file = await this.db.Files.findById(pinObj.file)

      // Ensure pin owner
      if (boxOwner.owner !== user._id.toString()) {
        throw new Error('Unauthorized')
      }

      const account = await this.db.Account.findById(user.account)

      if (!account) { throw new Error('Account Data not found!') }

      await this.db.Pin.deleteOne({ _id: pinId })

      file.pinCount = file.pinCount - 1

      await file.save()

      // Update account

      account.currentBytes -= file.size
      await account.save()

      return true
    } catch (error) {
      this.wlogger.error(`Error in use-cases/deletePin() $ ${error.message}`)
      throw error
    }
  }
}
