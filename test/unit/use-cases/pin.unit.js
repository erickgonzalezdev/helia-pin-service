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
  describe('#addPinByUser', () => {
    it('should throw error if no fileId provided', async () => {
      try {
        await uut.addPinByUser()

        assert.fail('Unexpected code path.')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'fileId is required!')
      }
    })
    it('should throw error if no boxId provided', async () => {
      try {
        const input = {
          fileId: 'fileId'
        }
        await uut.addPinByUser(input)

        assert.fail('Unexpected code path.')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'boxId is required!')
      }
    })
    it('should throw error if no user provided', async () => {
      try {
        const input = {
          fileId: 'fileId',
          boxId: 'boxId'
        }
        await uut.addPinByUser(input)

        assert.fail('Unexpected code path.')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'user is required')
      }
    })

    it('should throw error if box is not found.', async () => {
      try {
        sandbox.stub(uut.db.Box, 'findById').resolves(null)

        const input = {
          fileId: 'fileId',
          boxId: 'boxId',
          user: { save: () => { }, _id: 'userId' }
        }
        await uut.addPinByUser(input)

        assert.fail('Unexpected code path.')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'Box not found!')
      }
    })
    it('should throw error if box owner and user does not match.', async () => {
      try {
        sandbox.stub(uut.db.Box, 'findById').resolves({ owner: 'another user id' })

        const input = {
          fileId: 'fileId',
          boxId: 'boxId',
          user: { save: () => { }, _id: 'userId' }
        }
        await uut.addPinByUser(input)

        assert.fail('Unexpected code path.')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'Unauthorized')
      }
    })
    it('should throw error if pin is not found.', async () => {
      try {
        sandbox.stub(uut.db.Box, 'findById').resolves({ owner: 'myUserId' })
        sandbox.stub(uut.db.Files, 'findById').resolves(null)

        const input = {
          fileId: 'fileId',
          boxId: 'boxId',
          user: { save: () => { }, _id: 'myUserId' }
        }
        await uut.addPinByUser(input)

        assert.fail('Unexpected code path.')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'File not found!')
      }
    })
    it('should add file to box', async () => {
      sandbox.stub(uut.db.Box, 'findById').resolves({ owner: 'myUserId', pinList: [], save: () => { } })
      sandbox.stub(uut.db.Files, 'findById').resolves({ _id: 'a file id' })

      const input = {
        fileId: 'fileId',
        boxId: 'boxId',
        user: { save: () => { }, _id: 'myUserId' }
      }
      const result = await uut.addPinByUser(input)
      assert.isObject(result)
      assert.property(result, 'owner')
      assert.property(result, 'pinList')

      assert.isArray(result.pinList)
      const fileId = result.pinList[0]
      assert.isString(fileId)
      assert.equal(fileId, 'a file id')
    })
  })

  describe('#addPinBySignature', () => {
    it('should throw error if no fileId provided', async () => {
      try {
        await uut.addPinBySignature()

        assert.fail('Unexpected code path.')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'fileId is required!')
      }
    })
    it('should throw error if no box provided', async () => {
      try {
        const input = {
          fileId: 'fileId'
        }
        await uut.addPinBySignature(input)

        assert.fail('Unexpected code path.')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'box is required!')
      }
    })
    it('should throw error if no user provided', async () => {
      try {
        const input = {
          fileId: 'fileId',
          box: { _id: 'my box id', save: () => {} }
        }
        await uut.addPinBySignature(input)

        assert.fail('Unexpected code path.')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'user is required')
      }
    })
    it('should throw error if box owner and user does not match.', async () => {
      try {
        const input = {
          fileId: 'fileId',
          user: { save: () => { }, _id: 'userId' },
          box: { _id: 'my box id', owner: 'an user id', save: () => {} }
        }
        await uut.addPinBySignature(input)

        assert.fail('Unexpected code path.')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'Unauthorized')
      }
    })
    it('should throw error if  box signature and provided boxId does not match.', async () => {
      try {
        const input = {
          fileId: 'fileId',
          user: { save: () => { }, _id: 'userId' },
          box: { _id: 'my box id', owner: 'userId', save: () => {} },
          boxId: 'random box id'
        }
        await uut.addPinBySignature(input)

        assert.fail('Unexpected code path.')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'The signature does not belong to provided box')
      }
    })

    it('should throw error if pin is not found.', async () => {
      try {
        sandbox.stub(uut.db.Files, 'findById').resolves(null)

        const input = {
          fileId: 'fileId',
          user: { save: () => { }, _id: 'userId' },
          box: { _id: 'my box id', owner: 'userId', save: () => {} },
          boxId: 'my box id'
        }
        await uut.addPinBySignature(input)

        assert.fail('Unexpected code path.')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'File not found!')
      }
    })
    it('should add pin to box', async () => {
      sandbox.stub(uut.db.Files, 'findById').resolves({ _id: 'fileId' })

      const input = {
        fileId: 'fileId',
        user: { save: () => { }, _id: 'userId' },
        box: { _id: 'my box id', pinList: [], owner: 'userId', save: () => {} },
        boxId: 'my box id'
      }
      const result = await uut.addPinBySignature(input)
      assert.isObject(result)
      assert.property(result, 'owner')
      assert.property(result, 'pinList')

      assert.isArray(result.pinList)
      const fileId = result.pinList[0]
      assert.isString(fileId)
      assert.equal(fileId, 'fileId')
    })
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
