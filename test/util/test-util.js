import mongoose from 'mongoose'
import config from '../../config.js'
import fs from 'fs'
import Libraries from '../../src/lib/index.js'
import UseCases from '../../src/use-cases/index.js'
import SERVER from '../../server.js'


const libraries =  new Libraries()
const useCases = new UseCases({ libraries })
let APP


export const createTestUser = async (inObj = { username : 'test' , password: '1234'})=>{
  try {
    const result = await useCases.users.createUser(inObj)
    return result
  } catch (error) {
    console.log(` Error in test/util.js/createTestUser()`, error)
    throw error
  }
}


// Remove all collections from the DB.
export const startApp = async () => {
  if (process.env.ENVIROMENT !== 'test') { throw new Error('Trying to start app without the `test` enviroment') }
  if (APP) return APP
  APP = new SERVER()
  APP.config.storePath = './helia-data-test' // helia data path
  await APP.start()

  return APP
}

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

// Remove all collections from the DB.
export const cleanNode = async (nodePath = './helia-data-test') => {
  if (process.env.ENVIROMENT !== 'test') { throw new Error('Trying to remove node without the `test` enviroment') }
  if (!fs.existsSync(nodePath)) {
    console.log(`test-util/cleanNode info : ${nodePath} not found!`)
    return
  }
  fs.rmdirSync(nodePath, { recursive: true })
}








