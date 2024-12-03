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
    uut = new MiddlewareUnderTest({ libraries: { jwt: { verify: () => {} }, dbModels: { Users: UserModel.User } } })
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
    it('should return JWT type 1', async () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2YzgxZjAyZDBmOTVkZTQzYzA0NGU3OCIsInR5cGUiOiJ1c2VyQWNjZXNzIiwiaWF0IjoxNzI0MzkxMTcxfQ.Ew4nvA4cTXaLaayWT2EzRvaglz1U-t1EhREuDRrXa7c'
      ctxMock.request.header.authorization = `Bearer ${token}`

      const tokenType = await uut.getJWTType(ctxMock)
      assert.isString(tokenType)
    })
    it('should return JWT type 2', async () => {
      const token = 'Ew4nvA4cTXaLaayWT2EzRvaglz1U-t1EhREuDRrXa7c'
      ctxMock.request.header.authorization = `Bearer ${token}`

      const tokenType = await uut.getJWTType(ctxMock)
      assert.isString(tokenType)
    })

    it('should handle error', async () => {
      try {
        ctxMock.request.header.authorization = 'Bearer '

        await uut.getJWTType(ctxMock)
        assert.fail('unexpected code path')
      } catch (error) {
        assert.include(error.message, 'Token could not be retrieved from header')
      }
    })
  })
})
