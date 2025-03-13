import { assert } from 'chai'
import sinon from 'sinon'

import TimerController from '../../src/timer-controller.js'
import Libraries from '../../src/lib/index.js'
import UseCases from '../../src/use-cases/index.js'
import { HeliaNodeMock, PinRPCMock } from './mocks/helia-node-mock.js'
import { cleanDb, startDb } from '../util/test-util.js'
import config from '../../config.js'
describe('#TimerController', () => {
  let uut
  let sandbox

  before(async () => {
    const libraries = new Libraries(config)
    libraries.heliaNode.node = new HeliaNodeMock()
    libraries.heliaNode.rpc = new PinRPCMock()

    const useCases = new UseCases({ libraries })

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
      assert.isUndefined(uut.handleTargetNodeTimer)
      uut.handleUnpinedPeriod = 10000
      uut.handleTargetNodePeriod = 10000
      uut.startTimers()
      assert.exists(uut.handleUnpinedTimer)
      clearInterval(uut.handleUnpinedTimer)
      assert.exists(uut.handleTargetNodeTimer)
      clearInterval(uut.handleTargetNodeTimer)
      assert.exists(uut.unPinFilesTimer)
      clearInterval(uut.unPinFilesTimer)
    })
    it('should throw error if unpined period is not defined', async () => {
      try {
        uut.handleUnpinedPeriod = null
        uut.startTimers()
        assert.fail('unexpected code path')
      } catch (error) {
        assert.include(error.message, 'reviewPinsPeriod must be passed in as enviroment var')
      }
    })
    it('should throw error if target node period is not defined', async () => {
      try {
        uut.handleUnpinedPeriod = 10000
        uut.handleTargetNodePeriod = null
        uut.startTimers()
        assert.fail('unexpected code path')
      } catch (error) {
        assert.include(error.message, 'reviewNodesPeriod must be passed in as enviroment var')
      }
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

  describe('#handleTargetNode', () => {
    it('should handle timer', async () => {
      try {
        const clearISpy = sandbox.stub(uut, 'clearInterval').resolves(true)
        const setISpy = sandbox.stub(uut, 'setInterval').resolves(true)
        sandbox.stub(uut.useCases.pin.heliaNode, 'setTargetNode').resolves(true)
        const result = await uut.handleTargetNode()
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
        sandbox.stub(uut.useCases.pin.heliaNode, 'setTargetNode').throws(new Error('test error'))

        const res = await uut.handleTargetNode()
        assert.isFalse(res)
        assert.isTrue(clearISpy.calledOnce) // should stop interval on start func
        assert.isTrue(setISpy.calledOnce) // should start interval on error
      } catch (error) {
        assert.fail('Unexpected code path')
      }
    })
  })

  describe('#unPinFiles', () => {
    it('should handle timer', async () => {
      try {
        const clearISpy = sandbox.stub(uut, 'clearInterval').resolves(true)
        const setISpy = sandbox.stub(uut, 'setInterval').resolves(true)

        const result = await uut.unPinFiles()
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
        sandbox.stub(uut.useCases.files, 'unPinFiles').throws(new Error('test error'))

        const res = await uut.unPinFiles()
        assert.isFalse(res)
        assert.isTrue(clearISpy.calledOnce) // should stop interval on start func
        assert.isTrue(setISpy.calledOnce) // should start interval on error
      } catch (error) {
        assert.fail('Unexpected code path')
      }
    })
  })

  describe('#cleanExpiredAcc', () => {
    it('should handle timer', async () => {
      try {
        const clearISpy = sandbox.stub(uut, 'clearInterval').resolves(true)
        const setISpy = sandbox.stub(uut, 'setInterval').resolves(true)

        // Stub use case
        sandbox.stub(uut.useCases.accounts, 'cleanExpiredAcc').resolves(true)

        const result = await uut.cleanExpiredAcc()
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
        sandbox.stub(uut.useCases.accounts, 'cleanExpiredAcc').throws(new Error('test error'))

        const res = await uut.cleanExpiredAcc()
        assert.isFalse(res)
        assert.isTrue(clearISpy.calledOnce) // should stop interval on start func
        assert.isTrue(setISpy.calledOnce) // should start interval on error
      } catch (error) {
        assert.fail('Unexpected code path')
      }
    })
  })
})
