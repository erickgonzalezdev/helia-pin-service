import { assert } from 'chai'
import sinon from 'sinon'

import LibUnderTest from '../../../src/lib/account.js'
import DbModels from '../../../src/lib/db-models/index.js'

describe('#account.js', () => {
  let uut
  let sandbox
  // const testData = {}

  before(async () => {
    const wlogger = { error: () => {}, info: () => {} }
    uut = new LibUnderTest({ dbModels: new DbModels(), wlogger })
  })

  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })

  afterEach(() => {
    sandbox.restore()
  })

  after(async () => {
  })
  describe('#constructor', () => {
    it('should throw an error if dbModels is not provided', async () => {
      try {
        const _uut = new LibUnderTest()
        console.log(_uut) // Eslint
        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'dbModels must be passed in constructor when instatiate AccountLib lib.')
      }
    })
  })
  describe('#getTypeData', () => {
    it('should throw an error if no input is given', async () => {
      try {
        await uut.getTypeData()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'type must be a number')
      }
    })
    it('should throw an error if type data not found', async () => {
      try {
        await uut.getTypeData(100)

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'Account data for provided type not found!')
      }
    })

    it('should get type data', async () => {
      const result = await uut.getTypeData(1)

      assert.isObject(result)
      assert.equal(result.type, 1)
    })
  })

  describe('#calculateAccExpiration', () => {
    it('should throw an error if no input is given', async () => {
      try {
        await uut.calculateAccExpiration(null)

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'input object is required')
      }
    })
    it('should get time stamp for 1 month expiration', async () => {
      const now = new Date()
      const result = await uut.calculateAccExpiration({ months: 1 })
      const expiredAt = new Date(result)

      expiredAt.setMonth(expiredAt.getMonth() - 1)

      assert.equal(expiredAt.getMonth(), now.getMonth())
      assert.equal(expiredAt.getDate(), now.getDate())
      assert.equal(expiredAt.getHours(), now.getHours())
    })
    it('should get time stamp for 1 day expiration', async () => {
      const now = new Date()
      const result = await uut.calculateAccExpiration({ days: 1 })
      const expiredAt = new Date(result)

      expiredAt.setDate(expiredAt.getDate() - 1)

      assert.equal(expiredAt.getMonth(), now.getMonth())
      assert.equal(expiredAt.getDate(), now.getDate())
      assert.equal(expiredAt.getHours(), now.getHours())
    })
    it('should get time stamp for 1 hour expiration', async () => {
      const now = new Date()
      const result = await uut.calculateAccExpiration({ hours: 5 })
      const expiredAt = new Date(result)

      expiredAt.setHours(expiredAt.getHours() - 5)

      assert.equal(expiredAt.getMonth(), now.getMonth())
      assert.equal(expiredAt.getDate(), now.getDate())
      assert.equal(expiredAt.getHours(), now.getHours())
    })
    it('should get time stamp for months , days and hours expiration', async () => {
      const now = new Date()
      const result = await uut.calculateAccExpiration({ months: 3, days: 8, hours: 4 })
      const expiredAt = new Date(result)

      expiredAt.setMonth(expiredAt.getMonth() - 3)
      expiredAt.setDate(expiredAt.getDate() - 8)
      expiredAt.setHours(expiredAt.getHours() - 4)

      assert.equal(expiredAt.getMonth(), now.getMonth())
      assert.equal(expiredAt.getDate(), now.getDate())
      assert.equal(expiredAt.getHours(), now.getHours())
    })
  })
})
