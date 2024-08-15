import { assert } from 'chai'
import sinon from 'sinon'

import LibUnderTest from '../../../src/lib/helia-ipfs-node.js'
import { HeliaNodeMock, HeliaServerMock } from '../mocks/helia-node-mock.js'
import DbModels from '../../../src/lib/db-models/index.js'
import { cleanDb, startDb, createTestFileModel } from '../../util/test-util.js'
describe('#helia-ipfs-node.js', () => {
  let uut
  let sandbox
  const testData = {}
  before(async () => {
    await startDb()
    await cleanDb()
    testData.file = await createTestFileModel()
  })

  beforeEach(() => {
    const config = { rpcTopic: 'unit test', dbModels: new DbModels(), wlogger: { error: () => { }, info: () => { } } }
    uut = new LibUnderTest(config)
    uut.HeliaNode = HeliaNodeMock
    uut.HeliaServer = HeliaServerMock
    sandbox = sinon.createSandbox()
  })

  afterEach(() => {
    sandbox.restore()
  })

  after(async () => {
  })
  describe('#constructor', () => {
    it('should throw error if dbModels are no passed in', async () => {
      try {
        uut = new LibUnderTest()
        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'dbModels must be passed in constructor when instatiate HeliaNode lib.')
      }
    })
  })
  describe('#start', () => {
    it('should start', async () => {
      await uut.start()
    })

    it('should catch error', async () => {
      try {
        uut.HeliaNode.prototype.start = () => { throw new Error('test error') }
        await uut.start()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'test error')
      }
    })
  })

  describe('#onSuccessRemotePin', () => {
    it('should update pin model', async () => {
      const inObj = {
        cid: testData.file.cid,
        host: 'peerId'
      }
      const result = await uut.onSuccessRemotePin(inObj)
      assert.equal(result._id.toString(), testData.file._id.toString())
      assert.isTrue(result.pinned)
      assert.isString(result.host[0])
      assert.equal(result.host[0], inObj.host)
    })

    it('should return false on error', async () => {
      const inObj = {
        cid: 'unknow cid',
        host: 'peerId'
      }
      const result = await uut.onSuccessRemotePin(inObj)
      assert.isFalse(result)
    })
    it('should return false if cid is not provided', async () => {
      const inObj = {
        host: 'peerId'
      }
      const result = await uut.onSuccessRemotePin(inObj)
      assert.isFalse(result)
    })
    it('should return false if host is not provided', async () => {
      const inObj = {
        cid: 'unknow cid'
      }
      const result = await uut.onSuccessRemotePin(inObj)
      assert.isFalse(result)
    })
  })
})
