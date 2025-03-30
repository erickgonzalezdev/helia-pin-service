import { assert } from 'chai'
import sinon from 'sinon'

import UseCase from '../../../src/use-cases/users.js'
import Libraries from '../../../src/lib/index.js'
import { cleanDb, startDb } from '../../util/test-util.js'
import config from '../../../config.js'
describe('#users-use-case', () => {
  let uut
  let sandbox
  const testData = {}

  before(async () => {
    uut = new UseCase({ libraries: new Libraries(config) })
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
  describe('#createUser', () => {
    it('should throw an error if no input is given', async () => {
      try {
        await uut.createUser()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'email is required!')
      }
    })

    it('should throw an error if email is not provided', async () => {
      try {
        await uut.createUser({})

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'email is required!')
      }
    })

    it('should throw an error if password is not provided', async () => {
      try {
        const usrObj = {
          email: 'email@email.com'
        }

        await uut.createUser(usrObj)

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'password is required')
      }
    })
    it('should throw an error if email has wrong format', async () => {
      try {
        const usrObj = {
          email: 'myemail',
          password: 'testpass'
        }

        await uut.createUser(usrObj)

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'is not a valid Email format!')
      }
    })

    it('should catch and throw DB errors', async () => {
      try {
        // Force an error with the database.
        sandbox.stub(uut.db, 'Users').throws(new Error('test error'))

        const usrObj = {
          password: 'anypass',
          email: 'email@email.com'
        }

        await uut.createUser(usrObj)

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'test error')
      }
    })

    it('should create an user', async () => {
      const usrObj = {
        password: 'anypass',
        email: 'email@email.com'
      }
      const user = await uut.createUser(usrObj)

      testData.user = user
    })
  })

  describe('#authUser', () => {
    it('should handle passport auth error', async () => {
      try {
        sandbox.stub(uut.passport, 'authUser').throws(new Error('Authentication error'))

        const koaContex = {}
        await uut.authUser(koaContex)

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'Authentication error')
      }
    })
  })

  describe('#getUsers', () => {
    it('should catch and throw an error', async () => {
      try {
        // Force an error.
        sandbox.stub(uut.db.Users, 'find').throws(new Error('test error'))

        await uut.getUsers()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'test error')
      }
    })
    it('should get all users', async () => {
      const res = await uut.getUsers()
      assert.isArray(res)
    })
  })

  describe('#getUser', () => {
    it('should throw error if input is missing', async () => {
      try {
        await uut.getUser()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'id is required')
      }
    })
    it('should catch and throw an error', async () => {
      try {
        // Force an error.
        sandbox.stub(uut.db.Users, 'findById').throws(new Error('test error'))

        await uut.getUser({ id: 'myUserId' })

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'test error')
      }
    })
    it('should get user', async () => {
      const res = await uut.getUser({ id: testData.user._id.toString() })
      testData.user = res
      assert.isObject(res)
    })
  })

  describe('#updateUser', () => {
    it('should throw an error if no input is given', async () => {
      try {
        await uut.updateUser()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'existingData is required')
      }
    })

    it('should throw an error if newData is not provided', async () => {
      try {
        const existingData = testData.user
        await uut.updateUser({ existingData })

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'newData data is required!')
      }
    })

    it('should update the existing user', async () => {
      const existingData = testData.user
      const newData = { username: 'test2' }

      const result = await uut.updateUser({ existingData, newData })

      assert.isObject(result)
      assert.property(result, 'username')
      assert.equal(result.username, newData.username)
    })
  })
  describe('#changePassword', () => {
    it('should throw an error if no input is given', async () => {
      try {
        await uut.changePassword()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'user is required')
      }
    })

    it('should throw an error if newPassword is not provided', async () => {
      try {
        const user = testData.user
        const data = {
          user
        }
        await uut.changePassword(data)

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'newPassword is required')
      }
    })

    it('should throw an error if oldPassword is not provided', async () => {
      try {
        const user = testData.user
        const data = {
          user,
          newPassword: 'testpass'
        }
        await uut.changePassword(data)

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'oldPassword is required')
      }
    })
    it('should throw an error if oldPassword does not match', async () => {
      try {
        const user = testData.user
        const data = {
          user,
          newPassword: 'testpass',
          oldPassword: '123456'
        }
        await uut.changePassword(data)

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'Invalid old password')
      }
    })

    it('should update the existing user password', async () => {
      const user = testData.user
      user.emailVerificationCode = 1234
      const data = {
        user,
        newPassword: 'testpass2',
        oldPassword: 'anypass'
      }
      const result = await uut.changePassword(data)

      assert.isTrue(result)
    })
  })
  describe('#verifyEmailCode', () => {
    it('should throw error if no user property if not provided', async () => {
      try {
        await uut.verifyEmailCode()

        assert.fail('Unexpected code path.')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'user is required')
      }
    })
    it('should not update emailVerified property on undefined code ', async () => {
      try {
        const userMock = { save: () => { }, emailVerified: false, emailVerificationCode: 1234 }
        await uut.verifyEmailCode({ user: userMock })

        assert.fail('Unexpected code path.')
      } catch (err) {
        assert.include(err.message, 'Invalid Code')
      }
    })
    it('should not update emailVerified property on invalid code', async () => {
      try {
        const userMock = { save: () => { }, emailVerified: false, emailVerificationCode: 1234 }
        const code = 1235
        await uut.verifyEmailCode({ user: userMock, code })

        assert.fail('Unexpected code path.')
      } catch (err) {
        assert.include(err.message, 'Invalid Code')
      }
    })
    it('should update emailVerified property on valid code', async () => {
      try {
        const userMock = { save: () => { }, emailVerified: false, emailVerificationCode: 1234 }
        const code = 1234
        const result = await uut.verifyEmailCode({ user: userMock, code })

        assert.isTrue(result.emailVerified)
        assert.isNull(result.emailVerificationCode)
      } catch (err) {
        assert.fail('Unexpected code path.')
      }
    })
  })
  describe('#sendEmailVerificationCode', () => {
    it('should throw error if no user property if not provided', async () => {
      try {
        await uut.sendEmailVerificationCode()

        assert.fail('Unexpected code path.')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'user is required')
      }
    })
    it('should not send code if it exist', async () => {
      try {
        sandbox.stub(uut.libraries.emailService, 'sendEmail').resolves(true)
        const userMock = { save: () => { }, emailSentAt: new Date() }
        const result = await uut.sendEmailVerificationCode({ user: userMock })

        assert.isObject(result)
        assert.property(result, 'result')
        assert.property(result, 'emailSentAt')
        assert.property(result, 'waitingTime')
        assert.property(result, 'message')
        assert.isFalse(result.result)
        assert.isString(result.message)
        assert.equal(result.message, 'Rate Limit')
      } catch (err) {
        assert.fail('Unexpected code path.')
      }
    })
    it('should send a new code', async () => {
      try {
        sandbox.stub(uut.libraries.emailService, 'sendEmail').resolves(true)

        const userMock = { save: () => { }, emailSentAt: null }
        const result = await uut.sendEmailVerificationCode({ user: userMock })

        assert.isObject(result)
        assert.property(result, 'result')
        assert.property(result, 'emailSentAt')
        assert.property(result, 'waitingTime')
        assert.property(result, 'message')
        assert.isString(result.message)
        assert.equal(result.message, 'Code Sent Successfully.')

        assert.isTrue(result.result)
      } catch (err) {
        assert.fail('Unexpected code path.')
      }
    })
  })
  describe('#verifyTelegram', () => {
    it('should throw error if  user property if not provided', async () => {
      try {
        await uut.verifyTelegram()

        assert.fail('Unexpected code path.')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'user is required')
      }
    })
    it('should throw error if chatId property if not provided', async () => {
      try {
        const userMock = { save: () => { }, telegramVerified: false }

        await uut.verifyTelegram({ user: userMock })

        assert.fail('Unexpected code path.')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'chatId is required')
      }
    })
    it('should not update telegramVerified property on undefined code ', async () => {
      try {
        const userMock = { save: () => { }, telegramVerified: false }
        await uut.verifyTelegram({ user: userMock, chatId: 1234 })

        assert.fail('Unexpected code path.')
      } catch (err) {
        assert.include(err.message, 'Invalid Code')
      }
    })
    it('should not update telegramVerified property on invalid code', async () => {
      try {
        uut.config.telegramVerificationCode = 12345678
        const userMock = { save: () => { }, telegramVerified: false }
        const code = 1235
        await uut.verifyTelegram({ user: userMock, code, chatId: 1234 })

        assert.fail('Unexpected code path.')
      } catch (err) {
        assert.include(err.message, 'Invalid Code')
      }
    })
    it('should handle already verified', async () => {
      try {
        uut.config.telegramVerificationCode = 12345
        const userMock = { save: () => { }, telegramVerified: true, telegramChatId: 1234 }
        const code = 12345
        await uut.verifyTelegram({ user: userMock, code, chatId: 1234 })

        assert.fail('Unexpected code path.')
      } catch (err) {
        assert.include(err.message, 'User already associated with this telegram id')
      }
    })
    it('should handle existing code', async () => {
      try {
        sandbox.stub(uut.db.Users, 'findOne').resolves({ _id: 'already user with the provided code' })
        uut.config.telegramVerificationCode = 12345
        const userMock = { save: () => { } }
        const code = 12345
        await uut.verifyTelegram({ user: userMock, code, chatId: 1234 })

        assert.fail('Unexpected code path.')
      } catch (err) {
        assert.include(err.message, 'Telegram id is currently associated with another user')
      }
    })
    it('should update telegramVerified property on valid code', async () => {
      try {
        uut.config.telegramVerificationCode = 12345678
        const userMock = { save: () => { }, telegramVerified: false }
        const code = 12345678
        const result = await uut.verifyTelegram({ user: userMock, code, chatId: 1234 })

        assert.isTrue(result.telegramVerified)
      } catch (err) {
        assert.fail('Unexpected code path.')
      }
    })
  })
  describe('#sendPasswordResetEmail', () => {
    it('should throw error if  email property if not provided', async () => {
      try {
        await uut.sendPasswordResetEmail()

        assert.fail('Unexpected code path.')
      } catch (err) {
        assert.include(err.message, 'email is required')
      }
    })
    it('should throw error if user not found', async () => {
      try {
        sandbox.stub(uut.db.Users, 'findOne').resolves(null)
        await uut.sendPasswordResetEmail({ email: 'test@test.com' })

        assert.fail('Unexpected code path.')
      } catch (err) {
        assert.include(err.message, 'User not found')
      }
    })
    it('should throw error if password reset token already sent', async () => {
      try {
        sandbox.stub(uut.db.Users, 'findOne').resolves({ resetPasswordTokenSentAt: Date.now() })
        await uut.sendPasswordResetEmail({ email: 'test@test.com' })

        assert.fail('Unexpected code path.')
      } catch (err) {
        assert.include(err.message, 'Please wait 1 hour before requesting another password reset')
      }
    })
    it('should send password reset email', async () => {
      try {
        sandbox.stub(uut.libraries.emailService, 'sendEmail').resolves(true)

        const result = await uut.sendPasswordResetEmail({ email: testData.user.email })

        assert.isString(result)
      } catch (err) {
        assert.fail('Unexpected code path.')
      }
    })
  })
  describe('#resetPassword', () => {
    it('should throw error if  user property if not provided', async () => {
      try {
        await uut.resetPassword()

        assert.fail('Unexpected code path.')
      } catch (err) {
        assert.include(err.message, 'user is required')
      }
    })
    it('should throw error if password reset token already used', async () => {
      try {
        testData.user.resetPasswordTokenUsed = true
        await uut.resetPassword({ user: testData.user })

        assert.fail('Unexpected code path.')
      } catch (err) {
        assert.include(err.message, 'Password reset token already used')
      }
    })
    it('should reset password', async () => {
      try {
        testData.user.resetPasswordTokenUsed = false
        sandbox.stub(uut.libraries.emailService, 'sendEmail').resolves(true)
        const result = await uut.resetPassword({ user: testData.user })
        assert.isString(result)
      } catch (err) {
        assert.fail('Unexpected code path.')
      }
    })
  })
})
