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

  describe('#setTargetNode', () => {
    it('should throw an error if rpc class is not defined', async () => {
      try {
        uut.rpc = null
        await uut.setTargetNode()
      } catch (error) {
        assert.include(error.message, 'node rpc is not initialized')
      }
    })

    it('should throw an error if subscription list is empty', async () => {
      try {
        uut.rpc = { getSubscriptionList: () => { return [] } }
        await uut.setTargetNode()
      } catch (error) {
        assert.include(error.message, 'node list is empty')
      }
    })
    it('should define node with low space usage', async () => {
      const subscriptionListMock = [
        { peerId: 'peer1', diskSize: 100 },
        { peerId: 'peer2', diskSize: 200 },
        { peerId: 'peer3', diskSize: 50 },
        { peerId: 'peer4', diskSize: 500 }
      ]
      uut.rpc = { getSubscriptionList: () => { return subscriptionListMock } }
      const result = uut.setTargetNode()
      assert.isString(result)
      assert.equal(result, 'peer3', 'Expected peer3 to be selected')
    })
  })

  describe('#remotePin', () => {
    it('should return false on error', async () => {
       const result = await uut.remotePin()
       assert.isFalse(result)
    })

    it('should request remote pin to default target node', async () => {
      uut.targetNode = 'default node peer id'
      uut.node = new HeliaNodeMock()
      uut.rpc = { requestRemotePin: () => { } } // mock rpc function
      const cid = 'cid to pin'
      const result = uut.remotePin(cid)
      assert.isObject(result)
      assert.equal(result.toPeerId, 'default node peer id')
    })
    it('should request remote pin to custom target node', async () => {
      uut.node = new HeliaNodeMock()
      uut.rpc = { requestRemotePin: () => { } } // mock rpc function
      const cid = 'cid to pin'
      const result = uut.remotePin(cid,'custom node peer id')
      assert.isObject(result)
      assert.equal(result.toPeerId, 'custom node peer id')
    })
  })
})
