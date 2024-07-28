// npm libraries
import Koa from 'koa'
import cors from 'kcors'
import bodyParser from 'koa-bodyparser'
import session from 'koa-generic-session'
import passport from 'koa-passport'

// import serve from 'koa-static'
// import mount from 'koa-mount'
import config from './config.js'
import mongoose from 'mongoose'

import Controller from './src/controller.js'

import passportStrategy from './src/utils/passport.js'

import serve from 'koa-static'
import mount from 'koa-mount'

class Server {
  constructor () {
    this.mongoose = mongoose
    this.config = config
    this.port = this.config.port || 8085
    this.start = this.start.bind(this)
  }

  async start () {
    // Connect to the Mongo Database.
    this.mongoose.Promise = global.Promise
    // this.mongoose.set('useCreateIndex', true) // Stop deprecation warning.
    await this.mongoose.connect(`mongodb://localhost:27017/${this.config.database}`)
    console.log(`Db connected to ${this.config.database}`)
    const app = new Koa()
    app.keys = [this.config.koaSessionKey]
    app.use(bodyParser())
    app.use(session({}, app))
    passportStrategy(passport)
    app.use(passport.initialize())
    app.use(passport.session())
    app.use(cors({ origin: '*' }))

    // Used to generate the docs.
    app.use(mount('/', serve(`${process.cwd()}/docs`)))

    this.controller = new Controller(config)
    await this.controller.start(app)
    app.listen(this.port)

    this.controller.libraries.wlogger.info(`Server started on port : ${this.port}`)
    console.log(`Server started on port : ${this.port}`)
  }
}

export default Server
