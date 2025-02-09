import { assert } from 'chai'
import sinon from 'sinon'

import UseCase from '../../../src/use-cases/account.js'
import Libraries from '../../../src/lib/index.js'
import { cleanDb, startDb, createTestUser } from '../../util/test-util.js'
import config from '../../../config.js'
describe('#account-use-case', () => {
  let uut
  let sandbox
  const testData = {}
  before(async () => {
    await startDb()
    await cleanDb()

    uut = new UseCase({ libraries: new Libraries(config) })

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
  describe('#createAccount', () => {
    it('should throw an error if no input is given', async () => {
      try {
        await uut.createAccount()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'userId must be a string')
      }
    })
    it('should throw an error if no userId is given', async () => {
      try {
        const input = { }
        await uut.createAccount(input)

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'userId must be a string')
      }
    })
    it('should throw an error if no type property is given', async () => {
      try {
        const input = {
          userId: testData.user._id.toString()
        }
        await uut.createAccount(input)

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'type must be a number')
      }
    })

    it('should throw an error if user is not found!', async () => {
      try {
        sandbox.stub(uut.db.Users, 'findById').resolves(null)
        const input = {
          userId: testData.user._id.toString(),
          type: 1,
          expirationData: { days: 1 }
        }
        await uut.createAccount(input)

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'user not found!')
      }
    })

    it('should create account', async () => {
      const input = {
        userId: testData.user._id.toString(),
        type: 1,
        expirationData: { days: 1 }
      }
      const result = await uut.createAccount(input)
      assert.isObject(result)
      testData.account = result
    })
  })

  describe('#refreshAccount', () => {
    it('should throw an error if no input is given', async () => {
      try {
        await uut.refreshAccount()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'id is required')
      }
    })
    it('should throw an error if no id is given', async () => {
      try {
        const input = { }
        await uut.refreshAccount(input)

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'id is required')
      }
    })

    it('should refresh account', async () => {
      const input = {
        id: testData.account._id.toString()
      }
      const result = await uut.refreshAccount(input)
      assert.isObject(result)
      assert.isFalse(result.expired)
    })

    it('should detect expired account', async () => {
      const input = {
        id: testData.account._id.toString()
      }

      const mockAcc = testData.account
      const mockDate = new Date()
      mockDate.setDate(mockDate.getDate() - 10)
      mockAcc.expiredAt = mockDate.getTime()
      sandbox.stub(uut.db.Account, 'findById').resolves(mockAcc)
      const result = await uut.refreshAccount(input)
      assert.isObject(result)
      assert.isTrue(result.expired)
    })
  })
})
