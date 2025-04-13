const account1 = {
  type: 1,
  typeLabel: 'Trial',
  maxBytes: 10 ** 6 * 1000, // Max 1000 MB in total by default
  maxFileBytes: 10 ** 6 * 50, // Max 50 MB per file by default.
  maxBoxes: 3, // Max 5 Boxes by default
  maxPins: 50, // Max 50 pins by default
  currentBytes: 0,
  currentPins: 0,
  priceUSD: 0, // 1$
  expirationData: { months: 1 }
}

const account2 = {
  type: 2,
  typeLabel: 'Friendly',
  maxBytes: 10 ** 6 * 10000, // Max 10.000 MB in total by default
  maxFileBytes: 10 ** 6 * 2000, // Max 2000 MB per file by default.
  maxBoxes: 10, // Max Boxes
  maxPins: 1000, // Max pins
  currentBytes: 0,
  currentPins: 0,
  priceUSD: 2.99, // 3$
  expirationData: { months: 1 }
}

const account3 = {
  type: 3,
  typeLabel: 'Premium',
  maxBytes: 10 ** 6 * 50000, // Max 50.000 MB in total by default
  maxFileBytes: 10 ** 6 * 2000, // Max 2000 MB per file by default.
  maxBoxes: 50, // Max Boxes
  maxPins: 5000, // Max pins
  currentBytes: 0,
  currentPins: 0,
  priceUSD: 9.99, // 10$
  expirationData: { months: 1 }
}
const account4 = {
  type: 4,
  typeLabel: 'Ultra',
  maxBytes: 10 ** 6 * 120000, // Max 120.000 MB in total by default
  maxFileBytes: 10 ** 6 * 2000, // Max 2000 MB per file by default.
  maxBoxes: 100, // Max Boxes
  maxPins: 10000, // Max pins
  currentBytes: 0,
  currentPins: 0,
  priceUSD: 19.99, // 10$
  expirationData: { months: 1 }
}

const accounts = [account1, account2, account3, account4]
class AccountLib {
  constructor (config = {}) {
    if (!config.dbModels) {
      throw new Error('dbModels must be passed in constructor when instatiate AccountLib lib.')
    }
    this.config = config
    this.dbModels = this.config.dbModels
    this.wlogger = this.config.wlogger
    this.pricings = accounts

    this.getTypeData = this.getTypeData.bind(this)
    this.calculateAccExpiration = this.calculateAccExpiration.bind(this)
    this.getAccountsData = this.getAccountsData.bind(this)
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

  async getAccountsData () {
    return this.pricings
  }
}

export default AccountLib
