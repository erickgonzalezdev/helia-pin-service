import { assert } from 'chai'
import sinon from 'sinon'

import UserModel from '../../../src/lib/db-models/users.js'
import BoxModel from '../../../src/lib/db-models/box.js'

import MiddlewareUnderTest from '../../../src/middlewares/box-access-validator.js'

const KoaContextMock = {
  state: {},
  throw: (status, err) => { throw new Error(err) },
  request: { header: { authorization: null } }
}

let ctxMock
describe('#Box-Access-Validators.js', () => {
  let uut
  let sandbox

  before(async () => {
    uut = new MiddlewareUnderTest({ libraries: { dbModels: { Users: UserModel , Box: BoxModel } } })
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
  describe('#ensureBoxSignature', () => {
    it('should throw an error if ctx is not provided', async () => {
      try {
        await uut.ensureBoxSignature()
        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'Koa context (ctx) is required!')
      }
    })
    it('should throw an error if token is not found from header', async () => {
      try {
        sandbox.stub(uut, 'getToken').returns(null)

        await uut.ensureBoxSignature(ctxMock)

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
        await uut.ensureBoxSignature(ctxMock)

        assert.fail('Unexpected code path')
      } catch (error) {
        console.log(error)
        assert.include(error.message, 'Could not verify JWT')
      }
    })

    it('should throw an error if received token owner is not found', async () => {
      try {
        sandbox.stub(uut, 'getToken').returns('token')
        sandbox.stub(uut.jwt, 'verify').returns({ type : 'boxAccess'})
        sandbox.stub(uut.dbModels.Users, 'findById').resolves(null)
        sandbox.stub(uut.dbModels.Box, 'findById').resolves({})


        ctxMock.request.header.authorization = 'Bearer token'
        await uut.ensureBoxSignature(ctxMock)

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'Could not find user')
      }
    })
    it('should throw an error if received Box is not found', async () => {
      try {
        sandbox.stub(uut, 'getToken').returns('token')
        sandbox.stub(uut.jwt, 'verify').returns({ type : 'boxAccess'})
        sandbox.stub(uut.dbModels.Users, 'findById').resolves({})
        sandbox.stub(uut.dbModels.Box, 'findById').resolves(null)


        ctxMock.request.header.authorization = 'Bearer token'
        await uut.ensureBoxSignature(ctxMock)

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'Could not find box')
      }
    })

    it('should throw an error received token type is invalid', async () => {
      try {
        sandbox.stub(uut, 'getToken').returns('token')
        sandbox.stub(uut.jwt, 'verify').returns({ })
        sandbox.stub(uut.dbModels.Users, 'findById').resolves(null)

        ctxMock.request.header.authorization = 'Bearer token'
        await uut.ensureBoxSignature(ctxMock)

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'Could not verify JWT')
      }
    })

    it('should return true', async () => {
      sandbox.stub(uut, 'getToken').returns('token')
      sandbox.stub(uut.jwt, 'verify').returns({ type : 'boxAccess'})
      sandbox.stub(uut.dbModels.Users, 'findById').resolves({ _id: 'myUserId' })
      sandbox.stub(uut.dbModels.Box, 'findById').resolves({ _id: 'muBoxId' })

      ctxMock.request.header.authorization = 'Bearer token'
      const result = await uut.ensureBoxSignature(ctxMock)

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
