import jwt from 'jsonwebtoken'

export default class BoxValidator {
  constructor (config = {}) {
    this.config = config
    this.libraries = this.config.libraries
    // if (!this.libraries) { throw new Error('Libraries instance should be passed in UserValidator middleware Constructor.') }

    this.dbModels = this.config.libraries.dbModels
    // if (!this.dbModels) { throw new Error('DbModels instance should be passed in UserValidator middleware Constructor.') }

    this.jwt = jwt

    this.ensureBoxSignature = this.ensureBoxSignature.bind(this)
    this.getToken = this.getToken.bind(this)
  }

  async ensureBoxSignature (ctx) {
    try {
      if (!ctx) throw new Error('Koa context (ctx) is required!')
      const token = this.getToken(ctx)
      if (!token) {
        throw new Error('Token could not be retrieved from header')
      }

      const signatureRes = await this.dbModels.BoxSignature.findOne({ signature: token })

      if (!signatureRes) {
        throw new Error('Could not verify JWT')
      }
      let decoded = null
      try {
        decoded = this.jwt.verify(signatureRes.jwt, this.config.passKey)
      } catch (err) {
        throw new Error('Could not verify JWT')
      }
      if (decoded.type !== 'boxAccess') {
        throw new Error('Could not verify JWT')
      }

      ctx.state.user = await this.dbModels.Users.findById(decoded.userId, '-password')
      ctx.state.box = await this.dbModels.Box.findById(decoded.boxId)

      if (!ctx.state.user) {
        throw new Error('Could not find user')
      }

      if (!ctx.state.box) {
        throw new Error('Could not find box')
      }

      return true
    } catch (error) {
      if (!ctx) throw error
      ctx.status = 401
      ctx.throw(401, error.message)
    }
  }

  getToken (ctx) {
    if (!ctx) return null
    const header = ctx.request.header.authorization
    if (!header) {
      return null
    }
    const parts = header.split(' ')
    if (parts.length !== 2) {
      return null
    }
    const scheme = parts[0]
    const token = parts[1]
    if (/^Bearer$/i.test(scheme)) {
      return token
    }
    return null
  }
}
