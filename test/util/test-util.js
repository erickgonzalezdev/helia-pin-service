import mongoose from 'mongoose'
import config from '../../config.js'

// Remove all collections from the DB.
export const cleanDb = async () => {
  if (process.env.ENVIROMENT !== 'test') { throw new Error('Trying to remove database without the `test` enviroment') }
  mongoose.connection.db.dropDatabase()
}

// StartDB
export const startDb = async () => {
  // Connect to the Mongo Database.
  mongoose.Promise = global.Promise
  // this.mongoose.set('useCreateIndex', true) // Stop deprecation warning.
  await mongoose.connect(`mongodb://localhost:27017/${config.database}`)
  console.log(`Db connected to ${config.database}`)
}
