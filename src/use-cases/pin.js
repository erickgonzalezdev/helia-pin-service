export default class PinUseCases {
  constructor (config = {}) {
    this.config = config
    this.db = config.libraries.dbModels
    this.wlogger = config.libraries.wlogger

    // Bind function to this class.
    this.getPinsByBox = this.getPinsByBox.bind(this)
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

      const pins = await this.db.Pin.find({ owner: boxId })

      return pins
    } catch (error) {
      this.wlogger.error(`Error in use-cases/getFiles() $ ${error.message}`)
      throw error
    }
  }
}
