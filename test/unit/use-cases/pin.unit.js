import { assert } from 'chai'
import sinon from 'sinon'

import UseCase from '../../../src/use-cases/pin.js'
import Libraries from '../../../src/lib/index.js'
import { cleanDb, startDb } from '../../util/test-util.js'

describe('#pin-use-case', () => {
  let uut
  let sandbox
  const testData = {}

  before(async () => {
    uut = new UseCase({ libraries: new Libraries() })
    // Mock node 
    uut.heliaNode.node = { uploadFile : ()=>{ return }}
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
        console.log(uut.heliaNode)
        sandbox.stub(uut.heliaNode.node, 'uploadFile').throws(new Error('test error'))
        await uut.pinFile({ file: {}})

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'test error')
      }
    })

    it('should pin file', async () => {
      sandbox.stub(uut.heliaNode.node, 'uploadFile').resolves('cid')
      const result = await uut.pinFile({ file: {}})

      assert.equal(result , 'cid')
    })
  })
})
