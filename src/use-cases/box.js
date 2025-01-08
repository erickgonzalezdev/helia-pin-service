export default class BoxUseCases {
  constructor (config = {}) {
    this.config = config
    this.db = config.libraries.dbModels
    this.jwt = config.libraries.jwt
    this.wlogger = config.libraries.wlogger

    // this.passport = config.libraries.passport

    // Bind function to this class.
    this.createBox = this.createBox.bind(this)
    this.getBox = this.getBox.bind(this)
    this.getBoxes = this.getBoxes.bind(this)
    this.updateBox = this.updateBox.bind(this)
    this.deleteBox = this.deleteBox.bind(this)
    this.createSignature = this.createSignature.bind(this)
    this.getBoxSignatures = this.getBoxSignatures.bind(this)
    this.getBoxesByUser = this.getBoxesByUser.bind(this)
  }

  async createBox (inObj = {}) {
    try {
      const { label, user } = inObj
      if (!label || typeof label !== 'string') {
        throw new Error('label is required!')
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

  async getBoxesByUser (inObj = {}) {
    try {
      const { user } = inObj
      const box = await this.db.Box.find({ owner: user._id })
      return box
    } catch (error) {
      this.wlogger.error(`Error in use-cases/getBoxByUser() $ ${error.message}`)
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

  async createSignature (inObj = {}) {
    try {
      const { boxId, user, label, description } = inObj
      if (!boxId) throw new Error('boxId is required!')
      if (!user) throw new Error('user is required!')
      if (!label || typeof label !== 'string') throw new Error('label is required!')

      const box = await this.db.Box.findById(boxId)
      if (!box) { throw new Error('Box not found!') }

      if (box.owner !== user._id.toString()) {
        throw new Error('Unauthorized!')
      }

      const boxSignature = new this.db.BoxSignature({ label, description, signatureOwner: boxId })

      const jwt = this.jwt.sign({ userId: user._id.toString(), boxId: box._id.toString(), type: 'boxAccess' }, this.config.passKey)
      const splitedJWT = jwt.split('.')
      const signature = splitedJWT[2]
      boxSignature.jwt = jwt
      boxSignature.signature = signature
      boxSignature.createdAt = new Date().getTime()
      await boxSignature.save()

      return { label, description, signature, signatureOwner: boxId, _id: boxSignature._id }
    } catch (error) {
      this.wlogger.error(`Error in use-cases/createSignature() $ ${error.message}`)
      throw error
    }
  }

  async getBoxSignatures (inObj = {}) {
    try {
      const { user, boxId } = inObj

      if (!boxId) throw new Error('boxId is required!')
      if (!user) { throw new Error('user is required!') }

      const box = await this.db.Box.findById(boxId)

      if (!box) { throw new Error('box not found!') }

      if (box.owner !== user._id.toString()) {
        throw new Error('Unauthorized!')
      }

      const signatures = this.db.BoxSignature.find({ signatureOwner: box._id.toString() }, ['-jwt', '-signatureOwner'])

      return signatures
    } catch (error) {
      this.wlogger.error(`Error in use-cases/getBoxSignatures() ${error.message}`)
      throw error
    }
  }
}
