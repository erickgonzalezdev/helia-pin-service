export default class BoxUseCases {
  constructor(config = {}) {
    this.db = config.libraries.dbModels
    this.wlogger = config.libraries.wlogger
    // this.passport = config.libraries.passport

    // Bind function to this class.
    this.createBox = this.createBox.bind(this)
    this.getBox = this.getBox.bind(this)
    this.getBoxes = this.getBoxes.bind(this)
    this.updateBox = this.updateBox.bind(this)
    this.deleteBox = this.deleteBox.bind(this)
  }

  async createBox(inObj = {}) {
    try {
      const { label, description } = inObj
      if (!label || typeof label !== 'string') {
        throw new Error('label is required!')
      }

      if (!description || typeof description !== 'string') {
        throw new Error('description is required!')
      }

      const box = new this.db.Box(inObj)
      box.createdAt = new Date().getTime()

      await box.save()

      return box
    } catch (error) {
      this.wlogger.error(`Error in use-cases/createBox() $ ${error.message}`)
      throw error
    }
  }


  async getBox(inObj = {}) {
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

  async getBoxes() {
    try {
      const box = await this.db.Box.find({})
      return box
    } catch (error) {
      this.wlogger.error(`Error in use-cases/getBoxes() $ ${error.message}`)
      throw error
    }
  }

  async updateBox(inObj = {}) {
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

  async deleteBox(box) {
    try {
      if(!box ) throw new Error('box is required!')
      await box.deleteOne()
      return true
    } catch (error) {
      this.wlogger.error(`Error in use-cases/deleteBox() $ ${error.message}`)
      throw error
    }
  }
}
