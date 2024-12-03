import { assert } from 'chai'
import sinon from 'sinon'

import UseCase from '../../../src/use-cases/files.js'
import Libraries from '../../../src/lib/index.js'
import { cleanDb, startDb, createTestUser } from '../../util/test-util.js'
import { HeliaNodeMock, FileMock, PinRPCMock } from '../mocks/helia-node-mock.js'

describe('#file-use-case', () => {
  let uut
  let sandbox
  const testData = {}
  before(async () => {
    await startDb()
    await cleanDb()

    uut = new UseCase({ libraries: new Libraries() })
    // Mock node
    uut.heliaNode.node = new HeliaNodeMock()
    uut.heliaNode.targetNode = 'target node'
    uut.heliaNode.rpc = new PinRPCMock()
    uut.handleUnpinedDelay = 1

    testData.user = await createTestUser()
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
    it('should throw an error if no user is given', async () => {
      try {
        await uut.uploadFile({ file: FileMock })

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'Cannot read')
      }
    })

    it('should handle node error', async () => {
      try {
        sandbox.stub(uut.heliaNode.node, 'uploadFile').throws(new Error('test error'))
        await uut.uploadFile({ file: FileMock, user: testData.user })

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'test error')
      }
    })

    it('should handle upload file error', async () => {
      try {
        sandbox.stub(uut.heliaNode.node, 'uploadFile').throws(new Error('test error'))
        await uut.uploadFile({ file: FileMock, user: testData.user })

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'test error')
      }
    })
    it('should throw error if account is not found!.', async () => {
      try {
        sandbox.stub(uut.db.Account, 'findById').resolves(null)
        await uut.uploadFile({ file: FileMock, user: testData.user, size: 10 })

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'account is required!')
      }
    })
    it('should throw error for insufficient account space.', async () => {
      try {
        sandbox.stub(uut.db.Account, 'findById').resolves({ maxBytes: 9, currentBytes: 0 })

        const _fileMock = Object.assign({}, FileMock)
        _fileMock.size = 10
        await uut.uploadFile({ file: _fileMock, user: testData.user })

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'The account does not have enough space.')
      }
    })

    it('should upload file', async () => {
      sandbox.stub(uut.heliaNode.node, 'uploadFile').resolves('pinnedcid')
      const result = await uut.uploadFile({ file: FileMock, user: testData.user })

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
    it('should send pin request for unpinned files ', async () => {
      sandbox.stub(uut.db.Files, 'find').resolves([
        { cid: 'cid', pinned: false, _id: 'file id', save: () => {} },
        { cid: 'cid', pinned: false, _id: 'file id', targetNode: 'some node id', save: () => {} }
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
    it('should skip if error does not have a associated pin', async () => {
      sandbox.stub(uut.db.Files, 'find').resolves([
        { cid: 'cid', pinned: false, _id: 'file id', save: () => {} },
        { cid: 'cid2', pinned: false, _id: 'file id2', save: () => {} }
      ])
      sandbox.stub(uut.db.Pin, 'find').onCall(0).resolves([]).onCall(1).resolves([{}])
      const spy = sandbox.stub(uut.heliaNode, 'remotePin').resolves(true)
      const res = await uut.handleUnpinedFiles()
      assert.isTrue(res)
      // assert.isTrue(spy.notCalled)
      assert.isTrue(spy.calledOnce)
    })
  })
  describe('#unPinFiles', () => {
    it('should send unpin request for pinned files to needed it ', async () => {
      sandbox.stub(uut.db.Files, 'find').resolves([
        { cid: 'cid', pinned: false, _id: 'file id', save: () => {} },
        { cid: 'cid', pinned: false, _id: 'file id', save: () => {} }
      ])

      const res = await uut.unPinFiles()
      assert.isTrue(res)
    })

    it('should handle error', async () => {
      try {
        sandbox.stub(uut.db.Files, 'find').throws(new Error('test error'))
        await uut.unPinFiles()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'test error')
      }
    })
    it('should skip if error if file object has an associated pin', async () => {
      sandbox.stub(uut.db.Files, 'find').resolves([
        { cid: 'cid', pinned: false, _id: 'file id', targetNode: 'some node id', save: () => {} },
        { cid: 'cid2', pinned: false, _id: 'file id2', targetNode: 'some node id', save: () => {} }
      ])
      sandbox.stub(uut.db.Pin, 'find').onCall(0).resolves([]).onCall(1).resolves([{}])
      const spy = sandbox.stub(uut.heliaNode, 'remoteUnpin').resolves(true)
      const res = await uut.unPinFiles()
      assert.isTrue(res)
      // assert.isTrue(spy.notCalled)
      assert.isTrue(spy.calledOnce)
    })
  })
})
