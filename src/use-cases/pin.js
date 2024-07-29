export default class PinUseCases {
  constructor (config = {}) {
    this.db = config.libraries.dbModels
    this.heliaNode = config.libraries.heliaNode
    this.wlogger = config.libraries.wlogger
    this.passport = config.libraries.passport

    // Bind function to this class.
    this.pinFile = this.pinFile.bind(this)

  }

  async pinFile (inObj = {}) {
    try {
      const { file } = inObj
      if (!file) {
        throw new Error('file is required!')
      }
      const cid =  await this.heliaNode.node.uploadFile(file.filepath)
      return cid.toString()
    } catch (error) {
      this.wlogger.error(`Error in use-cases/pinFile() ${error.message}`)
      throw error
    }
  }
}