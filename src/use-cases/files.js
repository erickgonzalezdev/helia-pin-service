import { fileTypeFromBuffer } from 'file-type'
export default class FileUseCases {
  constructor (config = {}) {
    this.config = config
    this.db = config.libraries.dbModels
    this.heliaNode = config.libraries.heliaNode
    this.wlogger = config.libraries.wlogger
    this.fileTypeFromBuffer = fileTypeFromBuffer

    this.handleUnpinedDelay = 1000 // 1seg

    // Bind function to this class.
    this.uploadFile = this.uploadFile.bind(this)
    this.getFiles = this.getFiles.bind(this)
    this.getFile = this.getFile.bind(this)
    this.handleUnpinedFiles = this.handleUnpinedFiles.bind(this)
    this.unPinFiles = this.unPinFiles.bind(this)
    this.handleUnprovidedFiles = this.handleUnprovidedFiles.bind(this)
    this.importCID = this.importCID.bind(this)
  }

  async uploadFile (inObj = {}) {
    try {
      const { file, user } = inObj
      if (!file) {
        throw new Error('file is required!')
      }
      const account = await this.db.Account.findById(user.account)

      if (!account) {
        throw new Error('account is required!')
      }

      if (account.currentBytes + file.size > account.maxBytes) {
        throw new Error('The account does not have enough space.')
      }
      // Upload file to the ipfs node
      const cidObject = await this.heliaNode.node.uploadFile(file.filepath)
      const cid = cidObject.toString()

      // pin file on local node
      await this.heliaNode.tryLocallyPin(cid)

      let fileObj = await this.db.Files.findOne({ cid })

      // create file data into the db
      if (!fileObj) {
        const length = 10 ** 6 * 50 // max 50 mb
        const content = await this.heliaNode.node.getContent(cid, { offset: 0, length })
        const type = await this.fileTypeFromBuffer(content)
        console.log('type', type)
        const mimeType = type?.mime || file.mimetype
        console.log('mimeType', mimeType)
        fileObj = new this.db.Files({ cid })
        fileObj.createdAt = new Date().getTime()
        fileObj.type = mimeType
        fileObj.name = file.originalFilename
        fileObj.size = file.size
        fileObj.pinned = false
        await fileObj.save()
      }
      // Unarchive file if exits and its currently archived
      /**
       * UnArchived files can be added to the pin strategy.
       */
      fileObj.archived = false
      fileObj.archivedDate = null

      return fileObj
    } catch (error) {
      this.wlogger.error(`Error in use-cases/uploadFile() ${error.message}`)
      throw error
    }
  }

  async importCID (inObj = {}) {
    try {
      const { cid, user } = inObj
      if (!cid) {
        throw new Error('cid is required!')
      }
      const account = await this.db.Account.findById(user.account)

      if (!account) {
        throw new Error('account is required!')
      }

      // Abort signal timeout
      const signal = AbortSignal.timeout(60000 * 2)
      const cidStats = await this.heliaNode.node.getStat(cid, { signal })

      console.log(cidStats)

      if (cidStats.type === 'directory') {
        throw new Error('Directory not supported')
      }
      const file = {
        size: Number(cidStats.fileSize),
        originalFilename: cid,
        mimetype: 'application/octet-stream',
        filepath: cid
      }

      if (account.currentBytes + file.size > account.maxBytes) {
        throw new Error('The account does not have enough space.')
      }

      // Upload file to the ipfs node
      await this.heliaNode.node.lazyDownload(cid)

      // pin file on local node
      await this.heliaNode.tryLocallyPin(cid)

      let fileObj = await this.db.Files.findOne({ cid })

      // create file data into the db
      if (!fileObj) {
        const length = 10 ** 6 * 50 // max 50 mb
        const content = await this.heliaNode.node.getContent(cid, { offset: 0, length })
        const type = await this.fileTypeFromBuffer(content)
        const mimeType = type?.mime || 'application/octet-stream'
        fileObj = new this.db.Files({ cid })
        fileObj.createdAt = new Date().getTime()
        fileObj.type = mimeType
        fileObj.name = file.originalFilename
        fileObj.size = file.size
        fileObj.pinned = false
        await fileObj.save()
      }

      fileObj.archived = false
      fileObj.archivedDate = null

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
      const unpinedCID = await this.db.Files.find({ pinned: false, archived: false })
      this.wlogger.info(`Unpined files : ${unpinedCID.length}`)

      for (let i = 0; i < unpinedCID.length; i++) {
        const fileObj = unpinedCID[i]
        // if a file has not associated Pin Obj, then skip it.
        const hasPin = await this.db.Pin.find({ file: fileObj._id })
        if (!hasPin.length) {
          this.wlogger.info(`this file : ${fileObj.cid}  does not contain a pin collection. Skip remote pin`)
          // unpin file from local node
          await this.heliaNode.tryLocallyUnpin(fileObj.cid)
          this.wlogger.info('pinned locally!')
          // Archive this file to prevent to get try to pin again
          fileObj.archived = true
          fileObj.archivedDate = new Date().getTime()

          await fileObj.save()
          continue
        }
        this.wlogger.info('handling unpined cid ', fileObj.cid)
        if (!fileObj.targetNode && this.heliaNode.targetNode) {
          fileObj.targetNode = this.heliaNode.targetNode
          await fileObj.save()
        }
        this.heliaNode.remotePin(fileObj.cid, fileObj.targetNode)
        // await this.sleep(this.handleUnpinedDelay)
      }
      return true
    } catch (error) {
      this.wlogger.error(`Error in use-cases/handleUnpinedFiles() $ ${error.message}`)
      throw error
    }
  }

  async handleUnprovidedFiles () {
    try {
      const unprovidedFiles = await this.db.Files.find({ pinned: true, archived: false, provided: false })
      /*       // Files that are not provided and  the last provided time is older than 22 hours
      const unprovidedFiles = unprovidedFilesRes.filter(file => {
        if (!file.provided) {
          return true
        }
        const hours = 22
        const now = new Date().getTime()
        const providedAt = new Date(file.providedAt).getTime()
        const diff = now - providedAt
        if (diff > 1000 * 60 * 60 * hours) {
          return true
        }
        return false
      }) */
      this.wlogger.info(`UnProvided files : ${unprovidedFiles.length}`)
      for (let i = 0; i < unprovidedFiles.length; i++) {
        const fileObj = unprovidedFiles[i]
        // fileObj.provided = false
        // fileObj.providedAt = null
        // await fileObj.save()
        this.wlogger.info('handling unprovided cid ', fileObj.cid)
        const nodeToSendRequest = fileObj.targetNode
        if (!nodeToSendRequest) {
          this.wlogger.info(`Host not found to provide request for  cid : ${fileObj.cid} . Skipping`)
          continue
        }
        this.heliaNode.remoteProvide(fileObj.cid, nodeToSendRequest)
        // await this.sleep(this.handleUnpinedDelay)
      }
      return true
    } catch (error) {
      this.wlogger.error(`Error in use-cases/handleUnprovidedFiles() $ ${error.message}`)
      throw error
    }
  }

  async unPinFiles () {
    try {
      const pinnedCID = await this.db.Files.find({ pinned: true, pinCount: 0 })
      this.wlogger.info(`Pinned files needed unpin: ${pinnedCID.length}`)

      for (let i = 0; i < pinnedCID.length; i++) {
        const fileObj = pinnedCID[i]
        // if a file has not associated Pin Obj, then skip it.
        const hasPin = await this.db.Pin.find({ file: fileObj._id })
        if (hasPin.length) {
          this.wlogger.info(`this file : ${fileObj.cid}  contain a pin object. Skip remote unpin`)
          continue
        }
        this.wlogger.info('Unpining cid ', fileObj.cid)
        this.heliaNode.remoteUnpin(fileObj.cid, fileObj.targetNode)
        await this.sleep(this.handleUnpinedDelay)
      }
      return true
    } catch (error) {
      this.wlogger.info(error)
      this.wlogger.error(`Error in use-cases/unPinFiles() $ ${error.message}`)
      throw error
    }
  }

  // TODO :  move to /util
  sleep (delay) {
    return new Promise((resolve) => setTimeout(resolve, delay))
  }
}
