import { assert } from 'chai'
import sinon from 'sinon'

import LibUnderTest from '../../../src/lib/passport.js'

describe('#passport.js', () => {
  let uut
  let sandbox
  const testData = {}

  before(async () => {
    uut = new LibUnderTest()
  })

  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })

  afterEach(() => {
    sandbox.restore()
  })

  after(async () => {
  })
  describe('#authUser', () => {
    it('should throw an error if no input is given', async () => {
      try {
        await uut.authUser()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'Koa context (ctx) is required!')
      }
    })

    it('should throw an error if ctx is not provided', async () => {
      try {
        await uut.authUser()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'Koa context (ctx) is required!')
      }
    })
    it('should reject authentication', async () => {
      try {
        const userMock = { _id: 'userId' }
        sandbox.stub(uut.passport, 'authenticate').yields(new Error('auth error'), null)

        const ctx = {}
        await uut.authUser(ctx)

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'auth error')
      }
    })
    it('should auth user', async () => {
      const userMock = { _id: 'userId' }
      sandbox.stub(uut.passport, 'authenticate').yields(null, userMock)

      const ctx = {}
      const user = await uut.authUser(ctx)

      assert.isObject(user)
      assert.equal(user._id, userMock._id)
    })
  })
})
