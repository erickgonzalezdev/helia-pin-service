import mongoose from 'mongoose'
import config from '../config.js'
import Libraries from '../src/lib/index.js'
import UseCases from '../src/use-cases/index.js'
config.paymentUrl = 'https://dev-payment.pinbox.io'
const libraries = new Libraries(config)
const useCases = new UseCases({ libraries })

// Authorization
// User id to update account
const email = process.env.EMAIL
const type = process.env.TYPE

const createAcc = async () => {
  mongoose.Promise = global.Promise
  // this.mongoose.set('useCreateIndex', true) // Stop deprecation warning.
  await mongoose.connect(`mongodb://localhost:27017/${config.database}`)
  console.log(`Db connected to ${config.database}`)
  console.log('email', email)

  // Get all payloads from mongo db
  if (!email) {
    console.log('No user email provided')
    return
  }
  const user = await libraries.dbModels.Users.findOne({ email })
  if (!user) {
    console.log('User not found')
    return
  }
  if (!type) {
    console.log('error')
    return
  }

  const account = await useCases.accounts.createAccount({
    userId: user._id,
    type: Number(type),
    paymentId: '0000000000'
  })

  console.log(`Account: ${JSON.stringify(account, null, 2)}`)
  mongoose.connection.close()
}

createAcc()
