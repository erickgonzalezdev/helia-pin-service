import { assert } from 'chai'
import sinon from 'sinon'

import UseCase from '../../../src/use-cases/pin.js'
import Libraries from '../../../src/lib/index.js'
import { cleanDb, startDb, cleanNode, createTestUser } from '../../util/test-util.js'
import config from '../../../config.js'
describe('#pin-use-case', () => {
  let uut
  let sandbox
  const testData = {}

  before(async () => {
    uut = new UseCase({ libraries: new Libraries(config) })
    await startDb()
    await cleanDb()
    await cleanNode()

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
    it('should throw error if account is not found!.', async () => {
      try {
        const input = {
          fileId: 'fileId',
          boxId: 'boxId',
          user: testData.user
        }
        sandbox.stub(uut.db.Account, 'findById').resolves(null)
        await uut.addPinByUser(input)

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'account is required!')
      }
    })

    it('should throw error if box is not found.', async () => {
      try {
        sandbox.stub(uut.db.Box, 'findById').resolves(null)

        const input = {
          fileId: 'fileId',
          boxId: 'boxId',
          user: testData.user
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
          user: testData.user
        }
        await uut.addPinByUser(input)

        assert.fail('Unexpected code path.')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'Unauthorized')
      }
    })
    it('should throw error if file is not found.', async () => {
      try {
        sandbox.stub(uut.db.Box, 'findById').resolves({ owner: testData.user._id })
        sandbox.stub(uut.db.Files, 'findById').resolves(null)

        const input = {
          fileId: 'fileId',
          boxId: 'boxId',
          user: testData.user
        }
        await uut.addPinByUser(input)

        assert.fail('Unexpected code path.')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'File not found!')
      }
    })
    it('should throw error for insufficient account space.', async () => {
      try {
        sandbox.stub(uut.db.Box, 'findById').resolves({ owner: testData.user._id, save: () => { } })
        sandbox.stub(uut.db.Files, 'findById').resolves({ _id: 'a file id', size: 10, save: () => { } })
        sandbox.stub(uut.db.Account, 'findById').resolves({ maxBytes: 9, currentBytes: 0 })

        const input = {
          fileId: 'fileId',
          boxId: 'boxId',
          user: testData.user
        }
        await uut.addPinByUser(input)

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'The account does not have enough space.')
      }
    })
    it('should add file to box', async () => {
      sandbox.stub(uut.db.Box, 'findById').resolves({ owner: testData.user._id, save: () => { } })
      sandbox.stub(uut.db.Files, 'findById').resolves({ _id: 'a file id', size: 0, save: () => { } })

      const input = {
        fileId: 'fileId',
        boxId: 'boxId',
        user: testData.user
      }
      const result = await uut.addPinByUser(input)
      assert.isObject(result)
      assert.property(result, 'boxOwner')
      assert.property(result, 'file')
      assert.property(result, 'createdAt')
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
          box: { _id: 'my box id', save: () => { } }
        }
        await uut.addPinBySignature(input)

        assert.fail('Unexpected code path.')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'user is required')
      }
    })
    it('should throw error if account is not found!.', async () => {
      try {
        const input = {
          fileId: 'fileId',
          user: testData.user,
          box: { _id: 'my box id', save: () => { } }
        }
        sandbox.stub(uut.db.Account, 'findById').resolves(null)
        await uut.addPinBySignature(input)

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'account is required!')
      }
    })
    it('should throw error if box owner and user does not match.', async () => {
      try {
        const input = {
          fileId: 'fileId',
          user: testData.user,
          box: { _id: 'my box id', owner: 'an user id', save: () => { } }
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
          user: testData.user,
          box: { _id: 'my box id', owner: testData.user._id, save: () => { } },
          boxId: 'random box id'
        }
        await uut.addPinBySignature(input)

        assert.fail('Unexpected code path.')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'The signature does not belong to provided box')
      }
    })

    it('should throw error if file is not found.', async () => {
      try {
        sandbox.stub(uut.db.Files, 'findById').resolves(null)

        const input = {
          fileId: 'fileId',
          user: testData.user,
          box: { _id: 'my box id', owner: testData.user._id, save: () => { } },
          boxId: 'my box id'
        }
        await uut.addPinBySignature(input)

        assert.fail('Unexpected code path.')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'File not found!')
      }
    })
    it('should throw error for insufficient account space.', async () => {
      try {
        sandbox.stub(uut.db.Box, 'findById').resolves({ owner: testData.user._id, save: () => { } })
        sandbox.stub(uut.db.Files, 'findById').resolves({ _id: 'a file id', size: 10, save: () => { } })
        sandbox.stub(uut.db.Account, 'findById').resolves({ maxBytes: 9, currentBytes: 0 })

        const input = {
          fileId: 'fileId',
          user: testData.user,
          box: { _id: 'my box id', pinList: [], owner: testData.user._id.toString(), save: () => { } },
          boxId: 'my box id'
        }
        await uut.addPinBySignature(input)

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'The account does not have enough space.')
      }
    })
    it('should add pin to box', async () => {
      sandbox.stub(uut.db.Files, 'findById').resolves({ _id: 'fileId', size: 0, save: () => { } })

      const input = {
        fileId: 'fileId',
        user: testData.user,
        box: { _id: 'my box id', pinList: [], owner: testData.user._id.toString(), save: () => { } },
        boxId: 'my box id'
      }
      const result = await uut.addPinBySignature(input)
      assert.isObject(result)
      assert.property(result, 'boxOwner')
      assert.property(result, 'file')
      assert.property(result, 'createdAt')
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
    it('should handle Unauthorized', async () => {
      try {
        // Force an error.
        sandbox.stub(uut.db.Box, 'findById').resolves({ owner: 'unauthorized acc' })

        await uut.getPinsByBox({ boxId: 'id', user: { _id: 'myacc' } })

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'Unauthorized')
      }
    })
    it('should get all pins by box', async () => {
      sandbox.stub(uut.db.Box, 'findById').resolves({ _id: '66bef59cc9a225f81e1bedac' })

      const res = await uut.getPinsByBox({ boxId: '66bef59cc9a225f81e1bedac' })
      assert.isArray(res)
    })
  })
})
