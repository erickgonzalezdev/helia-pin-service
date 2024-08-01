import { assert } from 'chai'
import sinon from 'sinon'

import UseCase from '../../../src/use-cases/box.js'
import Libraries from '../../../src/lib/index.js'
import { cleanDb, startDb } from '../../util/test-util.js'

describe('#box-use-case', () => {
  let uut
  let sandbox
  const testData = {}

  before(async () => {
    uut = new UseCase({ libraries: new Libraries() })
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

    it('should catch and throw DB errors', async () => {
      try {
        // Force an error with the database.
        sandbox.stub(uut.db, 'Box').throws(new Error('test error'))

        const inObj = {
          label: 'box1',
          description :' my box '
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
        description :' my box '
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
})
