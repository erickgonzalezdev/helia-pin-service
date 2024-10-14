export default class FileUseCases {
  constructor (config = {}) {
    this.config = config
    this.db = config.libraries.dbModels
    this.heliaNode = config.libraries.heliaNode
    this.wlogger = config.libraries.wlogger
    this.passport = config.libraries.passport

    this.handleUnpinedDelay = 1000 // 1seg

    // Bind function to this class.
    this.uploadFile = this.uploadFile.bind(this)
    this.getFiles = this.getFiles.bind(this)
    this.getFile = this.getFile.bind(this)
    this.handleUnpinedFiles = this.handleUnpinedFiles.bind(this)
    this.sleep = this.sleep.bind(this)
  }

  async uploadFile (inObj = {}) {
    try {
      const { file } = inObj
      if (!file) {
        throw new Error('file is required!')
      }

      // Upload file to the ipfs node
      const cidObject = await this.heliaNode.node.uploadFile(file.filepath)
      const cid = cidObject.toString()

      let fileObj = await this.db.Files.findOne({ cid })

      // create file data into the db
      if (!fileObj) {
        fileObj = new this.db.Files({ cid })
        fileObj.createdAt = new Date().getTime()
        fileObj.type = file.mimetype
        fileObj.name = file.originalFilename
        fileObj.size = file.size
        fileObj.pinned = false
        await fileObj.save()
      }

      return fileObj
    } catch (error) {
      this.wlogger.error(`Error in use-cases/uploadFile() ${error.message}`)
      throw error
    }
  }

  async getFiles () {
    try {
      const files = await this.db.Files.find({})
      return files
    } catch (error) {
      this.wlogger.error(`Error in use-cases/getFiles() $ ${error.message}`)
      throw error
    }
  }

  async getFile (inObj = {}) {
    try {
      const { id } = inObj

      if (!id || typeof id !== 'string') {
        throw new Error('id is required')
      }
      const file = await this.db.Files.findById(id)
      return file
    } catch (error) {
      this.wlogger.error(`Error in use-cases/getFile() $ ${error.message}`)
      throw error
    }
  }

  async handleUnpinedFiles () {
    try {
      const unpinedCID = await this.db.Files.find({ pinned: false })
      console.log(`Unpined files : ${unpinedCID.length}`)

      for (let i = 0; i < unpinedCID.length; i++) {
        const fileObj = unpinedCID[i]
        // if a file has not associated Pin Obj, then skip it.
        const hasPin = await this.db.Pin.find({ file: fileObj._id })
        if (!hasPin.length) {
          console.log(`this file : ${fileObj.cid}  does not contain a pin object. Skip remote pin`)
          continue
        }
        this.wlogger.info('handling unpined cid ', fileObj.cid)
        this.heliaNode.remotePin(fileObj.cid, fileObj.targetNode)
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
