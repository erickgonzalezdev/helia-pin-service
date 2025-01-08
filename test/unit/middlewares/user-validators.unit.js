import { assert } from 'chai'
import sinon from 'sinon'

import DbModels from '../../../src/lib/db-models/index.js'

import MiddlewareUnderTest from '../../../src/middlewares/user-validators.js'

const KoaContextMock = {
  state: {},
  throw: (status, err) => { throw new Error(err) },
  request: { header: { authorization: null } }
}

let ctxMock
describe('#User-Validators.js', () => {
  let uut
  let sandbox

  before(async () => {
    uut = new MiddlewareUnderTest({
      libraries: {
        dbModels: new DbModels()
      }
    })
  })

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    ctxMock = Object.assign({}, KoaContextMock)
  })

  afterEach(() => {
    sandbox.restore()
  })

  after(async () => {
  })
  describe('#ensureUser', () => {
    it('should throw an error if ctx is not provided', async () => {
      try {
        await uut.ensureUser()
        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'Koa context (ctx) is required!')
      }
    })
    it('should throw an error if token is not found from header', async () => {
      try {
        sandbox.stub(uut, 'getToken').returns(null)

        await uut.ensureUser(ctxMock)

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'Token could not be retrieved from header')
      }
    })
    it('should throw an error received token could not be verify', async () => {
      try {
        sandbox.stub(uut, 'getToken').returns('token')
        sandbox.stub(uut.jwt, 'verify').throws(new Error('Could not verify JWT'))

        ctxMock.request.header.authorization = 'Bearer token'
        await uut.ensureUser(ctxMock)

        assert.fail('Unexpected code path')
      } catch (error) {
        console.log(error)
        assert.include(error.message, 'Could not verify JWT')
      }
    })

    it('should throw an error received token owner is not found', async () => {
      try {
        sandbox.stub(uut, 'getToken').returns('token')
        sandbox.stub(uut.jwt, 'verify').returns({ type: 'userAccess' })
        sandbox.stub(uut.dbModels.Users, 'findById').resolves(null)

        ctxMock.request.header.authorization = 'Bearer token'
        await uut.ensureUser(ctxMock)

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'Could not find user')
      }
    })

    it('should throw an error received token type is invalid', async () => {
      try {
        sandbox.stub(uut, 'getToken').returns('token')
        sandbox.stub(uut.jwt, 'verify').returns({ })
        sandbox.stub(uut.dbModels.Users, 'findById').resolves(null)

        ctxMock.request.header.authorization = 'Bearer token'
        await uut.ensureUser(ctxMock)

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'Could not verify JWT')
      }
    })

    it('should return true', async () => {
      sandbox.stub(uut, 'getToken').returns('token')
      sandbox.stub(uut.jwt, 'verify').returns({ type: 'userAccess' })
      sandbox.stub(uut.dbModels.Users, 'findById').resolves({ _id: 'myUserId' })

      ctxMock.request.header.authorization = 'Bearer token'
      const result = await uut.ensureUser(ctxMock)

      assert.isTrue(result)
    })
  })

  describe('#getToken', () => {
    it('should return null if ctx is not provided', async () => {
      const token = await uut.getToken()

      assert.isNull(token)
    })
    it('should return null if request authorization is not found', async () => {
      ctxMock.request.header.authorization = null
      const token = await uut.getToken(ctxMock)

      assert.isNull(token)
    })
    it('should return null for invalid request authorization', async () => {
      ctxMock.request.header.authorization = 'token'
      const token = await uut.getToken(ctxMock)

      assert.isNull(token)
    })
    it('should return null for invalid request authorization squeme', async () => {
      ctxMock.request.header.authorization = 'unknow token'
      const token = await uut.getToken(ctxMock)

      assert.isNull(token)
    })
    it('should return token for valid squeme', async () => {
      ctxMock.request.header.authorization = 'Bearer token'
      const token = await uut.getToken(ctxMock)

      assert.isString(token)
    })
  })

  describe('#ensureAccount', () => {
    it('should throw an error if ctx is not provided', async () => {
      try {
        await uut.ensureAccount()
        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'Koa context (ctx) is required!')
      }
    })
    it('should throw an error if user context is not found', async () => {
      try {
        ctxMock.state = {}
        await uut.ensureAccount(ctxMock)

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'Could not find user')
      }
    })
    it('should throw an error if account is not found', async () => {
      try {
        ctxMock.state = { user: {} }
        await uut.ensureAccount(ctxMock)

        assert.fail('Unexpected code path')
      } catch (error) {
        console.log(error)
        assert.include(error.message, 'Could not find user account type')
      }
    })

    it('should throw an error if account is expired', async () => {
      try {
        ctxMock.state = { user: { account: 'account db id' } }

        const now = new Date()
        now.setMinutes(now.getMinutes() - 1)

        sandbox.stub(uut.dbModels.Account, 'findById').resolves({ expiredAt: now.getTime() })

        await uut.ensureAccount(ctxMock)

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'Account expired!.')
      }
    })

    it('should return true after success', async () => {
      ctxMock.state = { user: { account: 'account db id' } }

      const now = new Date()
      now.setMinutes(now.getMinutes() + 1)

      sandbox.stub(uut.dbModels.Account, 'findById').resolves({ expiredAt: now.getTime() })

      const result = await uut.ensureAccount(ctxMock)
      assert.isTrue(result)
    })
  })

  describe('#validatePinsLimit', () => {
    it('should throw an error if ctx is not provided', async () => {
      try {
        await uut.validatePinsLimit()
        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'Koa context (ctx) is required!')
      }
    })
    it('should throw an error if user context is not found', async () => {
      try {
        ctxMock.state = {}
        await uut.validatePinsLimit(ctxMock)

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'Could not find user')
      }
    })
    it('should throw an error if account is not found', async () => {
      try {
        ctxMock.state = { user: {} }
        await uut.validatePinsLimit(ctxMock)

        assert.fail('Unexpected code path')
      } catch (error) {
        console.log(error)
        assert.include(error.message, 'Could not find user account type')
      }
    })

    it('should throw an error if account reached number of pins', async () => {
      try {
        ctxMock.state = { user: { account: 'account db id' } }

        const now = new Date()
        now.setMinutes(now.getMinutes() - 1)

        sandbox.stub(uut.dbModels.Account, 'findById').resolves({ maxPins: 10 })
        sandbox.stub(uut.dbModels.Pin, 'find').resolves(new Array(10))

        await uut.validatePinsLimit(ctxMock)

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'Account reached max number of Pins!')
      }
    })

    it('should return true after success', async () => {
      ctxMock.state = { user: { account: 'account db id' } }

      const now = new Date()
      now.setMinutes(now.getMinutes() + 1)

      sandbox.stub(uut.dbModels.Account, 'findById').resolves({ maxPins: 10 })
      sandbox.stub(uut.dbModels.Pin, 'find').resolves(new Array(9))

      const result = await uut.validatePinsLimit(ctxMock)
      assert.isTrue(result)
    })
  })

  describe('#validateBoxesLimit', () => {
    it('should throw an error if ctx is not provided', async () => {
      try {
        await uut.validateBoxesLimit()
        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'Koa context (ctx) is required!')
      }
    })
    it('should throw an error if user context is not found', async () => {
      try {
        ctxMock.state = {}
        await uut.validateBoxesLimit(ctxMock)

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'Could not find user')
      }
    })
    it('should throw an error if account is not found', async () => {
      try {
        ctxMock.state = { user: {} }
        await uut.validateBoxesLimit(ctxMock)

        assert.fail('Unexpected code path')
      } catch (error) {
        console.log(error)
        assert.include(error.message, 'Could not find user account type')
      }
    })

    it('should throw an error if account reached number of boxes', async () => {
      try {
        ctxMock.state = { user: { account: 'account db id' } }

        const now = new Date()
        now.setMinutes(now.getMinutes() - 1)

        sandbox.stub(uut.dbModels.Account, 'findById').resolves({ maxBoxes: 10 })
        sandbox.stub(uut.dbModels.Box, 'find').resolves(new Array(10))

        await uut.validateBoxesLimit(ctxMock)

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'Account reached max number of Boxes!')
      }
    })

    it('should return true after success', async () => {
      ctxMock.state = { user: { account: 'account db id' } }

      const now = new Date()
      now.setMinutes(now.getMinutes() + 1)

      sandbox.stub(uut.dbModels.Account, 'findById').resolves({ maxBoxes: 10 })
      sandbox.stub(uut.dbModels.Box, 'find').resolves(new Array(9))

      const result = await uut.validateBoxesLimit(ctxMock)
      assert.isTrue(result)
    })
  })
})
