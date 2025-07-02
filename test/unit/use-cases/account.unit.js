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
        const input = {}
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
        const input = {}
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
      sandbox.stub(uut.db.Pin, 'find').returns({ populate: () => { return [{ file: { size: 1000 } }, { file: null }] } })
      sandbox.stub(uut.db.Box, 'find').resolves([{}])

      const result = await uut.refreshAccount(input)
      assert.isObject(result)
      assert.isFalse(result.expired)
      assert.equal(result.currentBytes, 1000)
      assert.equal(result.currentBox, 1)
      assert.equal(result.currentPins, 2)
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
  describe('#getFreeAccount', () => {
    it('should throw an error if user is not verified!', async () => {
      try {
        const userMock = { _id: 'userID', emailVerified: false, telegramVerified: false, save: () => { } }

        await uut.getFreeAccount(userMock)

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'Account Verification is required!.')
      }
    })

    it('should get free account', async () => {
      try {
        const userMock = { _id: 'userID', emailVerified: true, telegramVerified: true, save: () => { } }

        const result = await uut.getFreeAccount(userMock)
        assert.isObject(result)
        assert.property(result, 'expiredAt')
      } catch (error) {
        assert.fail('Unexpected code path')
      }
    })
    it('should get free account if email is verified but telegram is not verified', async () => {
      try {
        const userMock = { _id: 'userID', emailVerified: true, telegramVerified: false, save: () => { } }

        const result = await uut.getFreeAccount(userMock)
        assert.isObject(result)
        assert.property(result, 'expiredAt')
      } catch (error) {
        assert.fail('Unexpected code path')
      }
    })
    it('should get free account if telegram is verified but email is not verified', async () => {
      try {
        const userMock = { _id: 'userID', emailVerified: false, telegramVerified: true, save: () => { } }

        const result = await uut.getFreeAccount(userMock)
        assert.isObject(result)
        assert.property(result, 'expiredAt')
      } catch (error) {
        assert.fail('Unexpected code path')
      }
    })
  })

  describe('#cleanExpiredAcc', () => {
    it('should clean expired acc', async () => {
      try {
        // Expired Timestamp mock
        const mockTS = new Date()
        mockTS.setHours(mockTS.getHours() - 1)
        // Acount Mock
        const accountMock = { _id: 'acc id', expiredAt: mockTS.getTime() }
        // Users array Mock
        const usersMock = [{ _id: 'id', account: accountMock }]

        sandbox.stub(uut.db.Users, 'find').returns({ populate: () => { return usersMock } })
        sandbox.stub(uut.db.Pin, 'deleteMany').resolves(true)
        sandbox.stub(uut.db.Box, 'deleteMany').resolves(true)
        sandbox.stub(uut, 'refreshAccount').resolves(true)

        const res = await uut.cleanExpiredAcc()

        assert.isArray(res)
      } catch (error) {
        assert.fail('Unexpected code path')
      }
    })
    it('should skip unexpired acc', async () => {
      try {
        // Expired Timestamp mock
        const mockTS = new Date()
        mockTS.setHours(mockTS.getHours() + 1)
        // Account Mock
        const accountMock = { _id: 'acc id', expiredAt: mockTS.getTime() }
        // Users array Mock
        const usersMock = [{ _id: 'id', account: accountMock }]

        sandbox.stub(uut.db.Users, 'find').returns({ populate: () => { return usersMock } })
        const spyOne = sandbox.stub(uut.db.Pin, 'deleteMany').resolves(true)
        const spyTwo = sandbox.stub(uut.db.Box, 'deleteMany').resolves(true)

        const res = await uut.cleanExpiredAcc()

        assert.isArray(res)
        assert.isTrue(spyOne.notCalled, 'expedted not delete pins')
        assert.isTrue(spyTwo.notCalled, 'expedted not delete boxes')
      } catch (error) {
        assert.fail('Unexpected code path')
      }
    })

    it('should handle users without acc', async () => {
      try {
        // Expired Timestamp mock
        const mockTS = new Date()
        mockTS.setHours(mockTS.getHours() - 1)
        // Account mock
        const accountMock = { _id: 'acc id', expiredAt: mockTS.getTime() }
        // Users array Mock
        const usersMock = [{ _id: 'id', account: accountMock }, { _id: 'id' }]

        sandbox.stub(uut.db.Users, 'find').returns({ populate: () => { return usersMock } })
        const spyOne = sandbox.stub(uut.db.Pin, 'deleteMany').resolves(true)
        const spyTwo = sandbox.stub(uut.db.Box, 'deleteMany').resolves(true)
        sandbox.stub(uut, 'refreshAccount').resolves(true)

        const res = await uut.cleanExpiredAcc()

        assert.isArray(res)
        assert.isTrue(spyOne.calledOnce, 'expedted called once')
        assert.isTrue(spyTwo.calledOnce, 'expedted calledOnce')
      } catch (error) {
        assert.fail('Unexpected code path')
      }
    })

    it('should handle error', async () => {
      try {
        sandbox.stub(uut.db.Users, 'find').throws(new Error('test error'))

        await uut.cleanExpiredAcc()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'test error')
      }
    })
  })

  describe('#notifyExpiredDate', () => {
    it('should notify expired date', async () => {
      try {
        // Expired Timestamp mock
        const mockTS = new Date()
        mockTS.setDate(mockTS.getDate() + 2)
        // Acount Mock
        const accountMock = { _id: 'acc id', expiredAt: mockTS.getTime(), save: () => { } }
        // Users array Mock
        const usersMock = [{ _id: 'id', account: accountMock }]

        sandbox.stub(uut.db.Users, 'find').returns({ populate: () => { return usersMock } })
        sandbox.stub(uut.libraries.emailService, 'sendEmail').resolves(true)
        const res = await uut.notifyExpiredDate()

        assert.isTrue(res)
      } catch (error) {
        assert.fail('Unexpected code path')
      }
    })
    it('should skip if account is not expired in 3 days or less', async () => {
      try {
        // Expired Timestamp mock
        const mockTS = new Date()
        mockTS.setDate(mockTS.getDate() + 4)
        // Account Mock
        const accountMock = { _id: 'acc id', expiredAt: mockTS.getTime() }
        // Users array Mock
        const usersMock = [{ _id: 'id', account: accountMock }]

        sandbox.stub(uut.db.Users, 'find').returns({ populate: () => { return usersMock } })
        const spy = sandbox.stub(uut.libraries.emailService, 'sendEmail').resolves(true)

        const res = await uut.notifyExpiredDate()

        assert.isTrue(res)
        assert.isTrue(spy.notCalled, 'expedted not send email')
      } catch (error) {
        assert.fail('Unexpected code path')
      }
    })

    it('should handle users without acc', async () => {
      try {
        // Expired Timestamp mock
        const mockTS = new Date()
        mockTS.setDate(mockTS.getDate() + 2)
        // Account mock
        // Users array Mock
        const usersMock = [{ _id: 'id', account: null }]

        sandbox.stub(uut.db.Users, 'find').returns({ populate: () => { return usersMock } })
        const spy = sandbox.stub(uut.libraries.emailService, 'sendEmail').resolves(true)

        const res = await uut.notifyExpiredDate()

        assert.isTrue(res)
        assert.isTrue(spy.notCalled, 'expedted not send email')
      } catch (error) {
        assert.fail('Unexpected code path')
      }
    })
    it('should handle expired account', async () => {
      try {
        // Expired Timestamp mock
        const mockTS = new Date()
        mockTS.setDate(mockTS.getDate() - 2)
        // Account mock
        // Users array Mock
        const usersMock = [{ _id: 'id', account: { expired: true, renewNotified: false } }]

        sandbox.stub(uut.db.Users, 'find').returns({ populate: () => { return usersMock } })
        const spy = sandbox.stub(uut.libraries.emailService, 'sendEmail').resolves(true)

        const res = await uut.notifyExpiredDate()

        assert.isTrue(res)
        assert.isTrue(spy.notCalled, 'expedted not send email')
      } catch (error) {
        assert.fail('Unexpected code path')
      }
    })
    it('should handle already notified', async () => {
      try {
        // Expired Timestamp mock
        const mockTS = new Date()
        mockTS.setDate(mockTS.getDate() + 2)
        // Account mock
        // Users array Mock
        const usersMock = [{ _id: 'id', account: { expired: false, renewNotified: true } }]

        sandbox.stub(uut.db.Users, 'find').returns({ populate: () => { return usersMock } })
        const spy = sandbox.stub(uut.libraries.emailService, 'sendEmail').resolves(true)

        const res = await uut.notifyExpiredDate()

        assert.isTrue(res)
        assert.isTrue(spy.notCalled, 'expedted not send email')
      } catch (error) {
        assert.fail('Unexpected code path')
      }
    })

    it('should handle error', async () => {
      try {
        sandbox.stub(uut.db.Users, 'find').throws(new Error('test error'))

        await uut.notifyExpiredDate()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'test error')
      }
    })
  })
})
