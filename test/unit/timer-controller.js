import { assert } from 'chai'
import sinon from 'sinon'

import TimerController from '../../src/timer-controller.js'
import Libraries from '../../src/lib/index.js'
import UseCases from '../../src/use-cases/index.js'
import { cleanDb, startDb } from '../util/test-util.js'

describe('#TimerController', () => {
  let uut
  let sandbox

  before(async () => {
    const useCases = new UseCases({ libraries: new Libraries() })
    // mock function
    useCases.files.handleUnpinedFiles = async () => { return true }

    uut = new TimerController({ useCases })

    await startDb()
    await cleanDb()
  })

  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })

  afterEach(() => {
    sandbox.restore()
  })

  after(async () => {
    await cleanDb()
  })
  describe('#constructor', () => {
    it('should throw error if useCases is not provided', async () => {
      try {
        uut = new TimerController()
        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'Instance of Use Cases library required when instantiating Timer Controller libraries.')
      }
    })
  })
  describe('#startTimers', () => {
    it('should start timers', async () => {
      assert.isUndefined(uut.handleUnpinedTimer)
      uut.startTimers()
      assert.exists(uut.handleUnpinedTimer)
      clearInterval(uut.handleUnpinedTimer)
    })
  })

  describe('#handleUnpinedFiles', () => {
    it('should handle timer', async () => {
      try {
        const clearISpy = sandbox.stub(uut, 'clearInterval').resolves(true)
        const setISpy = sandbox.stub(uut, 'setInterval').resolves(true)

        const result = await uut.handleUnpinedFiles()
        assert.isTrue(result)
        assert.isTrue(clearISpy.calledOnce) // should stop interval on start func
        assert.isTrue(setISpy.calledOnce) // should start interval after success
      } catch (error) {
        assert.fail('Unexpected code path')
      }
    })
    it('should return false on error', async () => {
      try {
        const clearISpy = sandbox.stub(uut, 'clearInterval').resolves(true)
        const setISpy = sandbox.stub(uut, 'setInterval').resolves(true)
        // Force an error.
        sandbox.stub(uut.useCases.files, 'handleUnpinedFiles').throws(new Error('test error'))

        const res = await uut.handleUnpinedFiles()
        assert.isFalse(res)
        assert.isTrue(clearISpy.calledOnce) // should stop interval on start func
        assert.isTrue(setISpy.calledOnce) // should start interval on error
      } catch (error) {
        assert.fail('Unexpected code path')
      }
    })
  })
})
