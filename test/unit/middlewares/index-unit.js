import { assert } from 'chai'
import sinon from 'sinon'

import UserModel from '../../../src/lib/db-models/users.js'
import MiddlewareUnderTest from '../../../src/middlewares/index.js'

const KoaContextMock = {
  state: {},
  throw: (status, err) => { throw new Error(err) },
  request: { header: { authorization: null } }
}

let ctxMock
describe('#Middelwares/index.js', () => {
  let uut
  let sandbox

  before(async () => {
    uut = new MiddlewareUnderTest({ libraries: { jwt: { verify: () => {} }, dbModels: { Users: UserModel } } })
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
  describe('#getJWTType', () => {
    it('should return JWT type', async () => {
      sandbox.stub(uut.jwt, 'verify').returns({ type: 'userAccess' })
      ctxMock.request.header.authorization = 'Bearer token'

      const tokenType = await uut.getJWTType(ctxMock)
      assert.isString(tokenType)
    })
    it('throw an error if JWT cant be decoded', async () => {
      try {
        sandbox.stub(uut.jwt, 'verify').throws(new Error('Could not verify JWT'))
        ctxMock.request.header.authorization = 'Bearer token'

        await uut.getJWTType(ctxMock)
        assert.fail('unexpected code path')
      } catch (error) {
        assert.include(error.message, 'Could not verify JWT')
      }
    })
    it('throw an error if token type is invalid', async () => {
      try {
        sandbox.stub(uut.jwt, 'verify').returns({ type: 'unknow' })
        ctxMock.request.header.authorization = 'Bearer token'

        await uut.getJWTType(ctxMock)
        assert.fail('unexpected code path')
      } catch (error) {
        assert.include(error.message, 'Could not verify JWT')
      }
    })
  })
})
