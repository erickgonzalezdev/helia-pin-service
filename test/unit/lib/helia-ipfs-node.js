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
    uut.node = new HeliaNodeMock()
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
    it('should update file model', async () => {
      const inObj = {
        cid: testData.file.cid,
        host: 'peerId'
      }

      const result = await uut.onSuccessRemotePin(inObj)
      assert.equal(result._id.toString(), testData.file._id.toString())
      assert.isTrue(result.pinned)
      assert.isNumber(result.pinnedAt)
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
  describe('#onSuccessRemoteProvide', () => {
    it('should update file model', async () => {
      const inObj = {
        cid: testData.file.cid,
        host: 'peerId'
      }

      const result = await uut.onSuccessRemoteProvide(inObj)
      assert.equal(result._id.toString(), testData.file._id.toString())
      assert.isTrue(result.provided)
      assert.isNumber(result.providedAt)
    })

    it('should return false on error', async () => {
      const inObj = {
        cid: 'unknow cid',
        host: 'peerId'
      }
      const result = await uut.onSuccessRemoteProvide(inObj)
      assert.isFalse(result)
    })
    it('should return false if cid is not provided', async () => {
      const inObj = {
        host: 'peerId'
      }
      const result = await uut.onSuccessRemoteProvide(inObj)
      assert.isFalse(result)
    })
    it('should return false if host is not provided', async () => {
      const inObj = {
        cid: 'unknow cid'
      }
      const result = await uut.onSuccessRemoteProvide(inObj)
      assert.isFalse(result)
    })
  })
  describe('#onSuccessRemoteUnpin', () => {
    it('should update file model', async () => {
      const inObj = {
        cid: testData.file.cid,
        host: 'peerId'
      }

      const result = await uut.onSuccessRemoteUnpin(inObj)
      assert.equal(result._id.toString(), testData.file._id.toString())
      assert.isFalse(result.pinned)
    })

    it('should return false on error', async () => {
      const inObj = {
        cid: 'unknow cid',
        host: 'peerId'
      }
      const result = await uut.onSuccessRemoteUnpin(inObj)
      assert.isFalse(result)
    })
    it('should return false if cid is not provided', async () => {
      const inObj = {
        host: 'peerId'
      }
      const result = await uut.onSuccessRemoteUnpin(inObj)
      assert.isFalse(result)
    })
    it('should return false if host is not provided', async () => {
      const inObj = {
        cid: 'unknow cid'
      }
      const result = await uut.onSuccessRemoteUnpin(inObj)
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
        { peerId: 'peer1', diskSize: 100, role: 'pinner' },
        { peerId: 'peer2', diskSize: 200, role: 'pinner' },
        { peerId: 'peer3', diskSize: 50, role: 'pinner' },
        { peerId: 'peer4', diskSize: 500, role: 'pinner' }
      ]
      uut.rpc = { getSubscriptionList: () => { return subscriptionListMock } }
      const result = uut.setTargetNode()
      assert.isString(result)
      assert.equal(result, 'peer3', 'Expected peer3 to be selected')
    })
    it('should define node with low space usage ignoring non-pinner nodes', async () => {
      const subscriptionListMock = [
        { peerId: 'peer1', diskSize: 100, role: 'pinner' },
        { peerId: 'peer2', diskSize: 200, role: 'pinner' },
        { peerId: 'peer3', diskSize: 50, role: 'delegator' },
        { peerId: 'peer4', diskSize: 500, role: 'delegator' }
      ]
      uut.rpc = { getSubscriptionList: () => { return subscriptionListMock } }
      const result = uut.setTargetNode()
      assert.isString(result)
      assert.equal(result, 'peer1', 'Expected peer3 to be selected')
    })
  })

  describe('#remotePin', () => {
    it('should return false on error', async () => {
      const result = await uut.remotePin()
      assert.isFalse(result)
    })

    it('should return false if cid is not provided', async () => {
      uut.rpc = { requestRemotePin: () => { } } // mock rpc function
      const result = uut.remotePin()
      assert.isFalse(result)
    })
    it('should return false if target node is not provided', async () => {
      uut.rpc = { requestRemotePin: () => { } } // mock rpc function
      const cid = 'cid to pin'
      const result = uut.remotePin(cid)
      assert.isFalse(result)
    })
    it('should request remote pin to target node', async () => {
      uut.rpc = { requestRemotePin: () => { } } // mock rpc function
      const cid = 'cid to pin'
      const result = uut.remotePin(cid, 'custom node peer id')
      assert.isObject(result)
      assert.equal(result.toPeerId, 'custom node peer id')
    })
  })
  describe('#remoteUnpin', () => {
    it('should return false on error', async () => {
      const result = await uut.remoteUnpin()
      assert.isFalse(result)
    })

    it('should return false if cid is not provided', async () => {
      uut.rpc = { requestRemoteUnpin: () => { } } // mock rpc function
      const result = uut.remoteUnpin()
      assert.isFalse(result)
    })
    it('should return false if target node is not provided', async () => {
      uut.rpc = { requestRemoteUnpin: () => { } } // mock rpc function
      const cid = 'cid to pin'
      const result = uut.remoteUnpin(cid)
      assert.isFalse(result)
    })
    it('should request remote pin to target node', async () => {
      uut.rpc = { requestRemoteUnpin: () => { } } // mock rpc function
      const cid = 'cid to pin'
      const result = uut.remoteUnpin(cid, 'custom node peer id')
      assert.isObject(result)
      assert.equal(result.toPeerId, 'custom node peer id')
    })
  })

  describe('#tryLocallyUnpin', () => {
    it('should return false on error', async () => {
      sandbox.stub(uut.node, 'unPinCid').throws(new Error())
      const result = await uut.tryLocallyUnpin('bafybeiczsscdsbs7ffqz55asqdf3smv6klcw3gofszvwlyarci47bgf354')
      assert.isFalse(result)
    })

    it('should return true on success', async () => {
      sandbox.stub(uut.node, 'unPinCid').resolves(true)
      const result = await uut.tryLocallyUnpin('bafybeiczsscdsbs7ffqz55asqdf3smv6klcw3gofszvwlyarci47bgf354')
      assert.isTrue(result)
    })
  })
})
