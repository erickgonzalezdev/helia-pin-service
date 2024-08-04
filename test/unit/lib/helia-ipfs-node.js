import { assert } from 'chai'
import sinon from 'sinon'

import LibUnderTest from '../../../src/lib/helia-ipfs-node.js'
import { HeliaNodeMock, HeliaServerMock } from '../mocks/helia-node-mock.js'

describe('#helia-ipfs-node.js', () => {
  let uut
  let sandbox

  before(async () => {
    const config = { wlogger: { error: () => {} } }
    uut = new LibUnderTest(config)
    uut.HeliaNode = HeliaNodeMock
    uut.HeliaServer = HeliaServerMock
  })

  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })

  afterEach(() => {
    sandbox.restore()
  })

  after(async () => {
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
})
