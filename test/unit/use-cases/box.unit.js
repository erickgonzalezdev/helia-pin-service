import { assert } from 'chai'
import sinon from 'sinon'

import UseCase from '../../../src/use-cases/box.js'
import Libraries from '../../../src/lib/index.js'
import { cleanDb, startDb, cleanNode } from '../../util/test-util.js'

describe('#box-use-case', () => {
  let uut
  let sandbox
  const testData = {}

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
  describe('#createBox', () => {
    it('should throw an error if no input is given', async () => {
      try {
        await uut.createBox()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'label is required!')
      }
    })

    it('should throw an error if label is not provided', async () => {
      try {
        await uut.createBox({})

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'label is required!')
      }
    })

    it('should throw an error if description is not provided', async () => {
      try {
        const inObj = {
          label: 'box1',
        }

        await uut.createBox(inObj)

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'description is required')
      }
    })
    it('should throw an error if user owner is not provided', async () => {
      try {
        const inObj = {
          label: 'box1',
          description: 'box desc.'
        }

        await uut.createBox(inObj)

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'user is required')
      }
    })
    it('should catch and throw DB errors', async () => {
      try {
        // Force an error with the database.
        sandbox.stub(uut.db, 'Box').throws(new Error('test error'))

        const inObj = {
          label: 'box1',
          description: ' my box ',
          user: { _id: 'userid', save: () => { } }
        }

        await uut.createBox(inObj)

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'test error')
      }
    })

    it('should create an box', async () => {
      const inObj = {
        label: 'box1',
        description: ' my box ',
        user: { _id: 'userid', save: () => { } }
      }
      const box = await uut.createBox(inObj)

      testData.box = box
    })
  })

  describe('#getBoxes', () => {
    it('should catch and throw an error', async () => {
      try {
        // Force an error.
        sandbox.stub(uut.db.Box, 'find').throws(new Error('test error'))

        await uut.getBoxes()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'test error')
      }
    })
    it('should get all boxes', async () => {
      const res = await uut.getBoxes()
      assert.isArray(res)
    })
  })

  describe('#getBox', () => {
    it('should throw error if input is missing', async () => {
      try {
        await uut.getBox()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'id is required')
      }
    })
    it('should catch and throw an error', async () => {
      try {
        // Force an error.
        sandbox.stub(uut.db.Box, 'findById').throws(new Error('test error'))

        await uut.getBox({ id: 'myBoxId' })

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'test error')
      }
    })
    it('should get box', async () => {
      const res = await uut.getBox({ id: testData.box._id.toString() })
      testData.box = res
      assert.isObject(res)
    })
  })

  describe('#updateBox', () => {
    it('should throw an error if no input is given', async () => {
      try {
        await uut.updateBox()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'existingData is required')
      }
    })

    it('should throw an error if newData is not provided', async () => {
      try {
        const existingData = testData.box
        await uut.updateBox({ existingData })

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'newData data is required!')
      }
    })

    it('should update the existing box', async () => {
      const existingData = testData.box
      const newData = { description: 'test description' }

      const result = await uut.updateBox({ existingData, newData })

      assert.isObject(result)
      assert.property(result, 'label')
      assert.property(result, 'description')
      assert.equal(result.description, newData.description)
    })
  })

  describe('#deleteBox', () => {
    it('should throw error if no box provided', async () => {
      try {
        await uut.deleteBox()

        assert.fail('Unexpected code path.')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'box is required')
      }
    })

    it('should delete the box from the database', async () => {
      await uut.deleteBox(testData.box)

    })
  })

  describe('#addPinByUser', () => {
    it('should throw error if no pinId provided', async () => {
      try {
        await uut.addPinByUser()

        assert.fail('Unexpected code path.')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'pinId is required!')
      }
    })
    it('should throw error if no boxId provided', async () => {
      try {
        const input = {
          pinId: 'pinid',
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
          pinId: 'pinid',
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
          pinId: 'pinid',
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
          pinId: 'pinid',
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
        sandbox.stub(uut.db.Pin, 'findById').resolves(null)

        const input = {
          pinId: 'pinid',
          boxId: 'boxId',
          user: { save: () => { }, _id: 'myUserId' }
        }
        await uut.addPinByUser(input)

        assert.fail('Unexpected code path.')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'Pin not found!')
      }
    })
    it('should add pin to box', async () => {
      sandbox.stub(uut.db.Box, 'findById').resolves({ owner: 'myUserId', pinList: [], save: () => { } })
      sandbox.stub(uut.db.Pin, 'findById').resolves({ _id: 'a pin id' })

      const input = {
        pinId: 'pinid',
        boxId: 'boxId',
        user: { save: () => { }, _id: 'myUserId' }
      }
      const result = await uut.addPinByUser(input)
      assert.isObject(result)
      assert.property(result, 'owner')
      assert.property(result, 'pinList')

      assert.isArray(result.pinList)
      const pinId = result.pinList[0]
      assert.isString(pinId)
      assert.equal(pinId, 'a pin id')
    })
  })



  describe('#addPinBySignature', () => {
    it('should throw error if no pinId provided', async () => {
      try {
        await uut.addPinBySignature()

        assert.fail('Unexpected code path.')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'pinId is required!')
      }
    })
    it('should throw error if no box provided', async () => {
      try {
        const input = {
          pinId: 'pinid',
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
          pinId: 'pinid',
          box: { _id: 'my box id' , save:()=>{}}
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
          pinId: 'pinid',
          user: { save: () => { }, _id: 'userId' },
          box: { _id: 'my box id' , owner: 'an user id',save:()=>{}}
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
          pinId: 'pinid',
          user: { save: () => { }, _id: 'userId' },
          box: { _id: 'my box id' , owner: 'userId',save:()=>{}},
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
        sandbox.stub(uut.db.Pin, 'findById').resolves(null)

        const input = {
          pinId: 'pinid',
          user: { save: () => { }, _id: 'userId' },
          box: { _id: 'my box id' , owner: 'userId',save:()=>{}},
          boxId: 'my box id'
        }
        await uut.addPinBySignature(input)

        assert.fail('Unexpected code path.')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'Pin not found!')
      }
    })
    it('should add pin to box', async () => {
      sandbox.stub(uut.db.Pin, 'findById').resolves({ _id: 'pinid' })

      const input = {
        pinId: 'pinid',
        user: { save: () => { }, _id: 'userId' },
        box: { _id: 'my box id' ,pinList :[], owner: 'userId',save:()=>{}},
        boxId: 'my box id'
      }
      const result = await uut.addPinBySignature(input)
      assert.isObject(result)
      assert.property(result, 'owner')
      assert.property(result, 'pinList')

      assert.isArray(result.pinList)
      const pinId = result.pinList[0]
      assert.isString(pinId)
      assert.equal(pinId, 'pinid')
    })
  })

  describe('#boxSignature', () => {
    it('should throw error if no boxId provided', async () => {
      try {
        await uut.boxSignature()

        assert.fail('Unexpected code path.')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'boxId is required!')
      }
    })
    it('should throw error if no user provided', async () => {
      try {
        const input = {
          boxId: 'my box id',
        }
        await uut.boxSignature(input)

        assert.fail('Unexpected code path.')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'user is required!')
      }
    })
    it('should throw error if no label provided', async () => {
      try {
        const input = {
          boxId: 'my box id',
          user: { _id: 'my user id' , save:()=>{}}
        }
        await uut.boxSignature(input)

        assert.fail('Unexpected code path.')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'label is required')
      }
    })
    it('should throw error if box is not found.', async () => {
      try {
        sandbox.stub(uut.db.Box, 'findById').resolves(null)

        const input = {
          label: 'this is my key',
          user: { save: () => { }, _id: 'userId' },
          boxId: 'my box id'
        }
        await uut.boxSignature(input)

        assert.fail('Unexpected code path.')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'Box not found!')
      }
    })
    it('should throw error if box owner and user does not match.', async () => {
      try {
        sandbox.stub(uut.db.Box, 'findById').resolves({ _id: 'my box id' , owner: 'unknow user id'})

        const input = {
          label: 'this is my key',
          user: { save: () => { }, _id: 'userId' },
          boxId: 'my box id'
        }
        await uut.boxSignature(input)

        assert.fail('Unexpected code path.')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'Unauthorized')
      }
    })

    it('should generate signature', async () => {
      uut.config.passKey = 'key to sign'
      const boxMock = {_id: 'my box id' , owner: 'userId', signatures :[] , save: ()=>{}}
      sandbox.stub(uut.db.Box, 'findById').resolves(boxMock)

      const input = {
        label: 'this is my key',
        user: { save: () => { }, _id: 'userId' },
        boxId: 'my box id'
      }
      const result = await uut.boxSignature(input)

      // Testing function result
      assert.isObject(result)
      assert.property(result, 'label')
      assert.property(result, 'key')
      assert.equal(result.label, 'this is my key')
      assert.isString(result.key)
      assert.isArray(boxMock.signatures)
      

      // Testing updated signature list content.
      const addedSignature = boxMock.signatures[0]
      assert.isObject(addedSignature) // ensure updated signature list.
      assert.property(addedSignature, 'label')
      assert.property(addedSignature, 'key')
      assert.equal(addedSignature.label, 'this is my key')
      assert.isString(addedSignature.key)

    })
  })
})
