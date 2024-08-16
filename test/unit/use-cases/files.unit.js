import { assert } from 'chai'
import sinon from 'sinon'

import UseCase from '../../../src/use-cases/files.js'
import Libraries from '../../../src/lib/index.js'
import { cleanDb, startDb } from '../../util/test-util.js'
import { HeliaNodeMock, FileMock, PinRPCMock } from '../mocks/helia-node-mock.js'

describe('#file-use-case', () => {
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
  describe('#uploadFile', () => {
    it('should throw an error if no input is given', async () => {
      try {
        await uut.uploadFile()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'file is required')
      }
    })

    it('should handle node error', async () => {
      try {
        sandbox.stub(uut.heliaNode.node, 'uploadFile').throws(new Error('test error'))
        await uut.uploadFile({ file: FileMock })

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'test error')
      }
    })

    it('should handle upload file error', async () => {
      try {
        sandbox.stub(uut.heliaNode.node, 'uploadFile').throws(new Error('test error'))
        await uut.uploadFile({ file: FileMock })

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'test error')
      }
    })

    it('should upload file', async () => {
      sandbox.stub(uut.heliaNode.node, 'uploadFile').resolves('pinnedcid')
      const result = await uut.uploadFile({ file: FileMock })

      assert.isObject(result)
      assert.property(result, 'cid')
      assert.property(result, '_id')
      assert.equal(result.cid, 'pinnedcid')
      testData.file = result
    })
  })

  describe('#getFiles', () => {
    it('should handle error', async () => {
      try {
        sandbox.stub(uut.db.Files, 'find').throws(new Error('test error'))
        await uut.getFiles()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'test error')
      }
    })

    it('should get pins', async () => {
      const result = await uut.getFiles()

      assert.isArray(result)
    })
  })

  describe('#getFile', () => {
    it('should throw error if input is missing', async () => {
      try {
        await uut.getFile()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'id is required')
      }
    })
    it('should catch and throw an error', async () => {
      try {
        // Force an error.
        sandbox.stub(uut.db.Files, 'findById').throws(new Error('test error'))

        await uut.getFile({ id: 'myid' })

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'test error')
      }
    })
    it('should get pin', async () => {
      const res = await uut.getFile({ id: testData.file._id.toString() })
      testData.box = res
      assert.isObject(res)
    })
  })

  describe('#handleUnpinedFiles', () => {
    it('should send pin request for unpinned files', async () => {
      sandbox.stub(uut.db.Files, 'find').resolves([
        { cid: 'cid', pinned: false }
      ])

      const res = await uut.handleUnpinedFiles()
      assert.isTrue(res)
    })
    it('should handle error', async () => {
      try {
        sandbox.stub(uut.db.Files, 'find').throws(new Error('test error'))
        await uut.handleUnpinedFiles()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'test error')
      }
    })
  })
})
