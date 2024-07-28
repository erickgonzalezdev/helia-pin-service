import { assert } from 'chai'
import sinon from 'sinon'

import LibUnderTest from '../../../src/utils/error.js'

const fakeCtx = {
  throw: (status, err) => {
    const e = new Error(err)
    e.status = status
    throw e
  }
}
describe('#util-error.js', () => {
  let uut
  let sandbox

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
  describe('#handleCtxError', () => {
    it('should handle an error with status and message', async () => {
      try {
        const e = new Error('not found!')
        e.status = 400
        await uut.handleCtxError(fakeCtx, e)

        assert.fail('Unexpected code path')
      } catch (error) {
        console.log(error)
        assert.equal(error.status, 400)
        assert.include(error.message, 'not found!')
      }
    })
    it('should set default message if the error does not include it', async () => {
      try {
        const e = new Error()
        e.status = 401
        await uut.handleCtxError(fakeCtx, e)

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.equal(error.status, 401)
        assert.include(error.message, 'Unknow Error')
      }
    })

    it('should throw 422 status by default if the error does not include it', async () => {
      try {
        const e = new Error('an error')
        e.status = null
        await uut.handleCtxError(fakeCtx, e)

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.equal(error.status, 422)
        assert.include(error.message, 'an error')
      }
    })
    it('should handle unknow error , and throw a default error', async () => {
      try {
        const e = new Error()
        e.status = null
        await uut.handleCtxError(fakeCtx, e)

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.equal(error.status, 422)
        assert.include(error.message, 'Unknow Error')
      }
    })
  })
})
