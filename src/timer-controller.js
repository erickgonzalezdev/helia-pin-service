export default class TimerController {
  constructor (config = {}) {
    this.config = config
    // Dependency Injection.
    this.useCases = config.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating Timer Controller libraries.'
      )
    }

    this.setInterval = setInterval
    this.clearInterval = clearInterval
    this.wlogger = this.useCases.files.wlogger
    // State
    this.handleUnpinedPeriod = 60000 * this.config.reviewPinsPeriod
    this.unpinFilesPeriod = 60000 * this.config.reviewPinsPeriod * 1.5
    this.handleTargetNodePeriod = 60000 * this.config.reviewNodesPeriod
    this.gcPeriod = 60000 * this.config.gcPeriod
    this.cleanAccPeriod = 60000 * 2

    this.handleUnpinedFiles = this.handleUnpinedFiles.bind(this)
    this.handleTargetNode = this.handleTargetNode.bind(this)
    this.startTimers = this.startTimers.bind(this)
    this.unPinFiles = this.unPinFiles.bind(this)
    this.garbageCollection = this.garbageCollection.bind(this)
    this.cleanExpiredAcc = this.cleanExpiredAcc.bind(this)
    // this.stopTimers = this.stopTimers.bind(this)
  }

  startTimers () {
    if (!this.handleUnpinedPeriod) throw new Error('reviewPinsPeriod must be passed in as enviroment var')
    if (!this.handleTargetNodePeriod) throw new Error('reviewNodesPeriod must be passed in as enviroment var')

    this.wlogger.info(`Starting handleUnpinedFiles interval of ${this.handleUnpinedPeriod / 60000} minutes`)
    this.handleUnpinedTimer = this.setInterval(this.handleUnpinedFiles, this.handleUnpinedPeriod)

    this.wlogger.info(`Starting handleTargetNode interval of ${this.handleTargetNodePeriod / 60000} minutes`)
    this.handleTargetNodeTimer = this.setInterval(this.handleTargetNode, this.handleTargetNodePeriod)

    this.wlogger.info(`Starting unPinFiles interval  for ${this.unpinFilesPeriod / 60000} minutes`)
    this.unPinFilesTimer = this.setInterval(this.unPinFiles, this.unpinFilesPeriod)

    this.wlogger.info(`Starting garbageCollection interval  for ${this.gcPeriod / 60000} minutes`)
    this.gcTimer = this.setInterval(this.garbageCollection, this.gcPeriod)

    this.wlogger.info(`Starting cleanExpiredAcc interval  for ${this.cleanAccPeriod / 60000} minutes`)
    this.accCleanerTimer = this.setInterval(this.cleanExpiredAcc, this.cleanAccPeriod)

    this.cleanExpiredAcc()
    return true
  }

  /*
  // Stop time-intervals
  stopTimers () {
    clearInterval(this.handleUnpinedTimer)
  }
 */
  // Review al unpinned files , and re attemp pin it
  async handleUnpinedFiles () {
    try {
      // Stop interval
      this.clearInterval(this.handleUnpinedTimer)

      this.wlogger.info('Stopped handleUnpinedFiles interval , waiting for handler to be done!.')
      await this.useCases.files.handleUnpinedFiles()

      // After finish process re-start the interval
      this.wlogger.info(`Starting handleUnpinedFiles interval  for ${this.handleUnpinedPeriod / 60000} minutes`)
      this.handleUnpinedTimer = this.setInterval(this.handleUnpinedFiles, this.handleUnpinedPeriod)

      return true
    } catch (error) {
      // On error re-start the interval
      this.wlogger.info(`Starting handleUnpinedFiles interval after error for ${this.handleUnpinedPeriod / 60000} minutes`, error.message)
      this.handleUnpinedTimer = this.setInterval(this.handleUnpinedFiles, this.handleUnpinedPeriod)
      return false
    }
  }

  // Define  remote node to pin file.
  async handleTargetNode () {
    try {
      // Stop interval
      this.clearInterval(this.handleTargetNodeTimer)

      this.wlogger.info('Stopped handleTargetNode interval , waiting for handler to be done!.')
      this.useCases.pin.heliaNode.setTargetNode()

      // After finish process re-start the interval
      this.wlogger.info(`Starting handleTargetNode interval  for ${this.handleTargetNodePeriod / 60000} minutes`)
      this.handleTargetNodeTimer = this.setInterval(this.handleTargetNode, this.handleTargetNodePeriod)

      return true
    } catch (error) {
      // On error re-start the interval
      this.wlogger.info(`Starting handleTargetNode interval after error for ${this.handleTargetNodePeriod / 60000} minutes`, error.message)
      this.handleTargetNodeTimer = this.setInterval(this.handleTargetNode, this.handleTargetNodePeriod)
      return false
    }
  }

  // Review all files without pin collections, in order to unpin it remotely
  async unPinFiles () {
    try {
      // Stop interval
      this.clearInterval(this.unPinFilesTimer)

      this.wlogger.info('Stopped unPinFiles interval , waiting for handler to be done!.')
      await this.useCases.files.unPinFiles()

      // After finish process re-start the interval
      this.wlogger.info(`Starting unPinFiles interval  for ${this.unpinFilesPeriod / 60000} minutes`)
      this.unPinFilesTimer = this.setInterval(this.unPinFiles, this.unpinFilesPeriod)

      return true
    } catch (error) {
      // On error re-start the interval
      this.wlogger.info(`Starting unPinFiles interval after error for ${this.unpinFilesPeriod / 60000} minutes`, error.message)
      this.unPinFilesTimer = this.setInterval(this.unPinFiles, this.unpinFilesPeriod)
      return false
    }
  }

  // Run garbage collections.
  async garbageCollection () {
    try {
      // Stop interval
      this.clearInterval(this.gcTimer)

      this.wlogger.info('Stopped garbageCollection interval , waiting for handler to be done!.')
      const beforeDisk = await this.useCases.libraries.heliaNode.node.getDiskSize()
      this.wlogger.info(`Disk before run GC ${beforeDisk} MB`)
      await this.useCases.libraries.heliaNode.node.helia.gc()
      const afterDisk = await this.useCases.libraries.heliaNode.node.getDiskSize()
      this.wlogger.info(`Disk after run GC ${afterDisk} MB`)
      // After finish process re-start the interval

      this.wlogger.info(`Starting garbageCollection interval  for ${this.gcPeriod / 60000} minutes`)
      this.gcTimer = this.setInterval(this.garbageCollection, this.gcPeriod)

      return true
    } catch (error) {
      // On error re-start the interval

      this.wlogger.info(`Starting garbageCollection interval  for ${this.gcPeriod / 60000} minutes`)
      this.gcTimer = this.setInterval(this.garbageCollection, this.gcPeriod)
      return false
    }
  }

  // Interval for review all actives accounts and delete all pins and boxes if the accounts is already expired.
  async cleanExpiredAcc () {
    try {
      // Stop interval
      this.clearInterval(this.accCleanerTimer)

      await this.useCases.accounts.cleanExpiredAcc()

      this.wlogger.info(`Starting cleanExpiredAcc interval  for ${this.cleanAccPeriod / 60000} minutes`)
      this.accCleanerTimer = this.setInterval(this.cleanExpiredAcc, this.cleanAccPeriod)
      return true
    } catch (error) {
      this.wlogger.info(`Starting cleanExpiredAcc interval  for ${this.cleanAccPeriod / 60000} minutes`)
      this.accCleanerTimer = this.setInterval(this.cleanExpiredAcc, this.cleanAccPeriod)
      return false
    }
  }
}
