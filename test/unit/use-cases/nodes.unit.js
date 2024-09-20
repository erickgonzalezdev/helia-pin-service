import { assert } from 'chai'
import sinon from 'sinon'

import UseCase from '../../../src/use-cases/nodes.js'
import Libraries from '../../../src/lib/index.js'
import { cleanDb, startDb, cleanNode } from '../../util/test-util.js'

describe('#nodes-use-case', () => {
  let uut
  let sandbox

  before(async () => {
    uut = new UseCase({ libraries: new Libraries() })
    uut.heliaNode.rpc = { getSubscriptionList: () => { return [] } } // Mock rpc class
    await startDb()
    await cleanDb()
    await cleanNode()
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

  describe('#getRemoteNodes', () => {
    it('should handle error.', async () => {
      try {
        sandbox.stub(uut.heliaNode.rpc, 'getSubscriptionList').throws(new Error('test error'))

        await uut.getRemoteNodes()

        assert.fail('Unexpected code path.')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'test error')
      }
    })
    it('should get remote nodes', async () => {
      sandbox.stub(uut.heliaNode.rpc, 'getSubscriptionList').resolves([])

      const result = await uut.getRemoteNodes()
      assert.isArray(result)
    })
  })
})
