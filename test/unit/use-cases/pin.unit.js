import { assert } from 'chai'
import sinon from 'sinon'

import UseCase from '../../../src/use-cases/pin.js'
import Libraries from '../../../src/lib/index.js'
import { cleanDb, startDb, cleanNode } from '../../util/test-util.js'

describe('#pin-use-case', () => {
  let uut
  let sandbox

  before(async () => {
    uut = new UseCase({ libraries: new Libraries() })
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

  describe('#getPinsByBox', () => {
    it('should catch and throw an error if box is not found', async () => {
      try {
        // Force an error.
        sandbox.stub(uut.db.Box, 'findById').resolves(null)

        await uut.getPinsByBox({ boxId: 'id' })

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'Box not found!')
      }
    })
    it('should get all pins by box', async () => {
      sandbox.stub(uut.db.Box, 'findById').resolves({})
      sandbox.stub(uut.db.Pin, 'find').resolves([])

      const res = await uut.getPinsByBox({ boxId: 'id' })
      assert.isArray(res)
    })
  })
})
