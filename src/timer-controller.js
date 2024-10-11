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
    this.handleTargetNodePeriod = 60000 * this.config.reviewNodesPeriod

    this.handleUnpinedFiles = this.handleUnpinedFiles.bind(this)
    this.handleTargetNode = this.handleTargetNode.bind(this)
    this.startTimers = this.startTimers.bind(this)
    // this.stopTimers = this.stopTimers.bind(this)
  }

  startTimers () {
    if (!this.handleUnpinedPeriod) throw new Error('reviewPinsPeriod must be passed in as enviroment var')
    if (!this.handleTargetNodePeriod) throw new Error('reviewNodesPeriod must be passed in as enviroment var')

    this.wlogger.info(`Starting handleUnpinedFiles interval of ${this.handleUnpinedPeriod / 60000} minutes`)
    this.handleUnpinedTimer = this.setInterval(this.handleUnpinedFiles, this.handleUnpinedPeriod)
    this.wlogger.info(`Starting handleUnpinedFiles interval of ${this.handleTargetNodePeriod / 60000} minutes`)
    this.handleTargetNodeTimer = this.setInterval(this.handleTargetNode, this.handleTargetNodePeriod)
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

  async handleTargetNode () {
    try {
      // Stop interval
      this.clearInterval(this.handleTargetNodeTimer)

      this.wlogger.info('Stopped handleTargetNodeTimer interval , waiting for handler to be done!.')
      this.useCases.pin.heliaNode.setTargetNode()

      // After finish process re-start the interval
      this.wlogger.info(`Starting handleTargetNodeTimer interval  for ${this.handleTargetNodePeriod / 60000} minutes`)
      this.handleTargetNodeTimer = this.setInterval(this.handleTargetNode, this.handleTargetNodePeriod)

      return true
    } catch (error) {
      // On error re-start the interval
      this.wlogger.info(`Starting handleTargetNode interval after error for ${this.handleTargetNodePeriod / 60000} minutes`, error.message)
      this.handleTargetNodeTimer = this.setInterval(this.handleTargetNode, this.handleTargetNodePeriod)
      return false
    }
  }
}
