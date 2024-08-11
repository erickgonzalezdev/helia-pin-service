import { assert } from 'chai'
import sinon from 'sinon'

import UseCase from '../../../src/use-cases/pin.js'
import Libraries from '../../../src/lib/index.js'
import { cleanDb, startDb } from '../../util/test-util.js'
import { HeliaNodeMock, FileMock, PinRPCMock } from '../mocks/helia-node-mock.js'

describe('#pin-use-case', () => {
  let uut
  let sandbox
  const testData = {}
  before(async () => {
    uut = new UseCase({ libraries: new Libraries() })
    // Mock node
    uut.heliaNode.node = new HeliaNodeMock()
    uut.heliaNode.rpc = new PinRPCMock()
    uut.handleUnpinedDelay = 1
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
  describe('#pinFile', () => {
    it('should throw an error if no input is given', async () => {
      try {
        await uut.pinFile()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'file is required')
      }
    })

    it('should handle node error', async () => {
      try {
        sandbox.stub(uut.heliaNode.node, 'uploadFile').throws(new Error('test error'))
        await uut.pinFile({ file: FileMock })

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'test error')
      }
    })

    it('should handle pin file error', async () => {
      try {
        sandbox.stub(uut.heliaNode.rpc, 'requestRemotePin').throws(new Error('test error'))
        await uut.pinFile({ file: FileMock })

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'test error')
      }
    })

    it('should pin file', async () => {
      sandbox.stub(uut.heliaNode.node, 'uploadFile').resolves('pinnedcid')
      const result = await uut.pinFile({ file: FileMock })

      assert.isObject(result)
      assert.property(result, 'cid')
      assert.property(result, '_id')
      assert.equal(result.cid, 'pinnedcid')
      testData.pin = result
    })
  })

  describe('#getPins', () => {
    it('should handle error', async () => {
      try {
        sandbox.stub(uut.db.Pin, 'find').throws(new Error('test error'))
        await uut.getPins()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'test error')
      }
    })

    it('should get pins', async () => {
      // sandbox.stub(uut.db.Pin, 'find').resolves([])
      const result = await uut.getPins()

      assert.isArray(result)
    })
  })

  describe('#getPin', () => {
    it('should throw error if input is missing', async () => {
      try {
        await uut.getPin()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'id is required')
      }
    })
    it('should catch and throw an error', async () => {
      try {
        // Force an error.
        sandbox.stub(uut.db.Pin, 'findById').throws(new Error('test error'))

        await uut.getPin({ id: 'myid' })

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'test error')
      }
    })
    it('should get pin', async () => {
      const res = await uut.getPin({ id: testData.pin._id.toString() })
      testData.box = res
      assert.isObject(res)
    })
  })

  describe('#handleUnpinedFiles', () => {
    it('should send pin request for unpinned files', async () => {
      sandbox.stub(uut.db.Pin, 'find').resolves([
        { cid: 'cid', pinned: false }
      ])

      const res = await uut.handleUnpinedFiles()
      assert.isTrue(res)
    })
    it('should handle error', async () => {
      try {
        sandbox.stub(uut.db.Pin, 'find').throws(new Error('test error'))
        await uut.handleUnpinedFiles()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'test error')
      }
    })
  })
})
