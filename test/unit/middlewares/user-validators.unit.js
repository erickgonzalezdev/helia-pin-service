import { assert } from 'chai'
import sinon from 'sinon'

import UserModel from '../../../src/lib/db-models/users.js'
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
    uut = new MiddlewareUnderTest({ libraries: { dbModels: { Users: UserModel } } })
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
        sandbox.stub(uut.jwt, 'verify').returns(true)
        sandbox.stub(uut.dbModels.Users, 'findById').resolves(null)

        ctxMock.request.header.authorization = 'Bearer token'
        await uut.ensureUser(ctxMock)

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'Could not find user')
      }
    })

    it('should return true', async () => {
      sandbox.stub(uut, 'getToken').returns('token')
      sandbox.stub(uut.jwt, 'verify').returns(true)
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
})
