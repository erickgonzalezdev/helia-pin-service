export default class BoxUseCases {
  constructor (config = {}) {
    this.config = config
    this.db = config.libraries.dbModels
    this.jwt = config.libraries.jwt
    this.wlogger = config.libraries.wlogger
    this.heliaNode = config.libraries.heliaNode

    // this.passport = config.libraries.passport

    // Bind function to this class.
    this.createBox = this.createBox.bind(this)
    this.getBox = this.getBox.bind(this)
    this.getBoxes = this.getBoxes.bind(this)
    this.updateBox = this.updateBox.bind(this)
    this.deleteBox = this.deleteBox.bind(this)
    this.addPinByUser = this.addPinByUser.bind(this)
    this.addPinBySignature = this.addPinBySignature.bind(this)
    this.boxSignature = this.boxSignature.bind(this)
  }

  async createBox (inObj = {}) {
    try {
      const { label, description, user } = inObj
      if (!label || typeof label !== 'string') {
        throw new Error('label is required!')
      }

      if (!description || typeof description !== 'string') {
        throw new Error('description is required!')
      }
      if (!user) {
        throw new Error('user is required!')
      }

      const box = new this.db.Box(inObj)
      box.createdAt = new Date().getTime()
      box.owner = user._id

      await box.save()

      return box
    } catch (error) {
      this.wlogger.error(`Error in use-cases/createBox() $ ${error.message}`)
      throw error
    }
  }

  async getBox (inObj = {}) {
    try {
      const { id } = inObj

      if (!id || typeof id !== 'string') {
        throw new Error('id is required')
      }
      const box = await this.db.Box.findById(id)
      return box
    } catch (error) {
      this.wlogger.error(`Error in use-cases/getBox() $ ${error.message}`)
      throw error
    }
  }

  async getBoxes () {
    try {
      const box = await this.db.Box.find({})
      return box
    } catch (error) {
      this.wlogger.error(`Error in use-cases/getBoxes() $ ${error.message}`)
      throw error
    }
  }

  async updateBox (inObj = {}) {
    try {
      const { existingData, newData } = inObj

      if (!existingData || typeof existingData !== 'object') {
        throw new Error('existingData is required!')
      }

      if (!newData || typeof newData !== 'object') {
        throw new Error('newData data is required!')
      }

      Object.assign(existingData, newData)

      // Save the changes to the database.
      await existingData.save()
      return existingData
    } catch (error) {
      this.wlogger.error(`Error in use-cases/updateBox() $ ${error.message}`)
      throw error
    }
  }

  async deleteBox (box) {
    try {
      if (!box) throw new Error('box is required!')
      await box.deleteOne()
      return true
    } catch (error) {
      this.wlogger.error(`Error in use-cases/deleteBox() $ ${error.message}`)
      throw error
    }
  }

  // add pin by user
  async addPinByUser (inObj = {}) {
    try {
      const { fileId, boxId, user } = inObj
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

      box.pinList.push(file._id.toString())

      // Pin file
      this.heliaNode.remotePin(file.cid)

      await box.save()

      return box
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

      box.pinList.push(file._id.toString())

      // Pin file
      this.heliaNode.remotePin(file.cid)

      await box.save()

      return box
    } catch (error) {
      this.wlogger.error(`Error in use-cases/addPinBySignature() $ ${error.message}`)
      throw error
    }
  }

  async boxSignature (inObj = {}) {
    try {
      const { boxId, user, label } = inObj
      if (!boxId) throw new Error('boxId is required!')
      if (!user) throw new Error('user is required!')
      if (!label || typeof label !== 'string') throw new Error('label is required!')

      const box = await this.db.Box.findById(boxId)
      if (!box) { throw new Error('Box not found!') }

      if (box.owner !== user._id.toString()) {
        throw new Error('Unauthorized!')
      }

      const key = this.jwt.sign({ userId: user._id.toString(), boxId: box._id.toString(), type: 'boxAccess' }, this.config.passKey)
      box.signatures.push({ label, key })
      await box.save()

      return { label, key }
    } catch (error) {
      this.wlogger.error(`Error in use-cases/boxSignature() $ ${error.message}`)
      throw error
    }
  }
}
