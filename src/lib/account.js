const account1 = {
  type: 1,
  maxBytes: 10 ** 6 * 500, // Max 500 MB in total by default
  maxFileBytes: 10 ** 6 * 50, // Max 50 MB per file by default.
  maxBoxes: 5, // Max 5 Boxes by default
  maxPins: 100, // Max 100 pins by default
  currentBytes: 0,
  currentPins: 0
}

const account2 = {
  type: 2,
  maxBytes: 10 ** 6 * 10000, // Max 10.000 MB in total by default
  maxFileBytes: 10 ** 6 * 2000, // Max 2000 MB per file by default.
  maxBoxes: null, // Max 5 Boxes by default
  maxPins: null, // Max 100 pins by default
  currentBytes: 0,
  currentPins: 0
}

const account3 = {
  type: 3,
  maxBytes: 10 ** 6 * 50000, // Max 50.000 MB in total by default
  maxFileBytes: 10 ** 6 * 2000, // Max 2000 MB per file by default.
  maxBoxes: null, // Max 5 Boxes by default
  maxPins: null, // Max 100 pins by default
  currentBytes: 0,
  currentPins: 0
}

const accounts = [account1, account2, account3]
class AccountLib {
  constructor (config = {}) {
    console.log('config', config.wlogger)
    if (!config.dbModels) {
      throw new Error('dbModels must be passed in constructor when instatiate AccountLib lib.')
    }
    this.config = config
    this.dbModels = this.config.dbModels
    this.wlogger = this.config.wlogger

    this.getTypeData = this.getTypeData.bind(this)
    this.calculateAccExpiration = this.calculateAccExpiration.bind(this)
  }

  async getTypeData (accType) {
    try {
      if (!accType || typeof accType !== 'number') {
        throw new Error('type must be a number')
      }

      const data = accounts[accType - 1]

      if (!data) {
        throw new Error('Account data for provided type not found!')
      }

      return data
    } catch (error) {
      this.wlogger.error(`Error in account/getTypeData() $ ${error.message}`)
      throw error
    }
  }

  async calculateAccExpiration (time = { months: 0, days: 0, hours: 0, minutes: 0 }) {
    try {
      if (!time) {
        throw new Error('input object is required')
      }
      const monthsToAdd = time.months || 0
      const daysToAdd = time.days || 0
      const hoursToAdd = time.hours || 0
      const minutesToAdd = time.minutes || 0

      const now = new Date()
      now.setMinutes(now.getMinutes() + minutesToAdd)
      now.setHours(now.getHours() + hoursToAdd)
      now.setDate(now.getDate() + daysToAdd)
      now.setMonth(now.getMonth() + monthsToAdd)
      const timeStamp = now.getTime()

      console.log('timeStamp', timeStamp)
      console.log('ISO', new Date(timeStamp).toISOString())

      return timeStamp
    } catch (error) {
      this.wlogger.error(`Error in account/getTypeData() $ ${error.message}`)
      throw error
    }
  }
}

export default AccountLib
