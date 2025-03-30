import sinon from 'sinon'
import { assert } from 'chai'
import axios from 'axios'
import config from '../../config.js'
import { cleanDb, cleanNode, startApp } from '../util/test-util.js'

const testData = {}
const LOCALHOST = `http://localhost:${config.port}`

let app // global var

describe('e2e-users', () => {
  let sandbox
  before(async () => {
    app = await startApp()
    await cleanDb()
    await cleanNode()
  })
  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })
  afterEach(() => {
    sandbox.restore()
  })

  describe('POST /users', () => {
    it('should handle request error', async () => {
      try {
        const options = {
          method: 'post',
          url: `${LOCALHOST}/users`

        }
        const result = await axios(options)

        testData.user = result.data.user

        assert.fail('Unexpected code path.')
      } catch (error) {
        assert(error.response.status === 422)
        assert.isString(error.response.data)
      }
    })
    it('should create user', async () => {
      try {
        sandbox.stub(app.controller.useCases.users, 'sendEmailVerificationCode').resolves(true)

        const options = {
          method: 'post',
          url: `${LOCALHOST}/users`,
          data: {
            email: 'email@email.com',
            password: 'test'
          }
        }
        const result = await axios(options)

        testData.user = result.data.user

        assert(result.status === 200)
        assert(result.data.user.email === 'email@email.com')
        assert(result.data.user.password === undefined)
      } catch (error) {
        assert.fail('Unexpected code path.')
      }
    })
  })
  describe('POST /users/auth', () => {
    it('should handle request error', async () => {
      try {
        const options = {
          method: 'POST',
          url: `${LOCALHOST}/users/auth`,
          data: {
            email: 'email@email.com'
          }
        }
        const result = await axios(options)

        testData.user = result.data.user

        assert.fail('Unexpected code path.')
      } catch (error) {
        assert(error.response.status === 401)
        assert.isString(error.response.data)
      }
    })
    it('should handle unknow user', async () => {
      try {
        const options = {
          method: 'POST',
          url: `${LOCALHOST}/users/auth`,
          data: {
            email: 'emailunknow@email.com',
            password: 'unknow'
          }
        }
        const result = await axios(options)

        testData.user = result.data.user

        assert.fail('Unexpected code path.')
      } catch (error) {
        assert(error.response.status === 401)
        assert.isString(error.response.data)
      }
    })
    it('should handle invalid password', async () => {
      try {
        const options = {
          method: 'POST',
          url: `${LOCALHOST}/users/auth`,
          data: {
            email: 'email@email.com',
            password: 'unknow'
          }
        }
        const result = await axios(options)

        testData.user = result.data.user

        assert.fail('Unexpected code path.')
      } catch (error) {
        assert(error.response.status === 401)
        assert.isString(error.response.data)
      }
    })
    it('should auth user', async () => {
      try {
        const options = {
          method: 'POST',
          url: `${LOCALHOST}/users/auth`,
          data: {
            email: 'email@email.com',
            password: 'test'
          }
        }
        const result = await axios(options)
        testData.token = result.data.token
        assert(result.status === 200)
        assert(result.data.user.email === 'email@email.com')
        assert(result.data.user.password === undefined)
      } catch (error) {
        assert.fail('Unexpected code path.')
      }
    })
  })

  describe('GET /users/', () => {
    it('should handle request error', async () => {
      try {
        sandbox.stub(app.controller.useCases.users, 'getUsers').throws(new Error('test error'))

        const options = {
          method: 'GET',
          url: `${LOCALHOST}/users`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.token}`
          }
        }
        const result = await axios(options)

        testData.user = result.data.user

        assert.fail('Unexpected code path.')
      } catch (error) {
        assert(error.response.status === 422)
        assert.isString(error.response.data)
      }
    })
    it('should not fetch users if the authorization header is missing', async () => {
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/users`,
          headers: {
            Accept: 'application/json'
          }
        }
        await axios(options)

        assert.fail('Invalid code path.')
      } catch (err) {
        assert.equal(err.response.status, 401)
      }
    })
    it('should not fetch users if the authorization header is missing the scheme', async () => {
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/users`,
          headers: {
            Accept: 'application/json',
            Authorization: '1'
          }
        }
        await axios(options)

        assert.fail('Invalid code path.')
      } catch (err) {
        assert.equal(err.response.status, 401)
      }
    })
    it('should not fetch users if the authorization header has invalid scheme', async () => {
      const { token } = testData
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/users`,
          headers: {
            Accept: 'application/json',
            Authorization: `Unknown ${token}`
          }
        }
        await axios(options)

        assert.fail('Invalid code path.')
      } catch (err) {
        assert.equal(err.response.status, 401)
      }
    })
    it('should not fetch users if token is invalid', async () => {
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/users`,
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer 1'
          }
        }
        await axios(options)

        assert.fail('Invalid code path.')
      } catch (err) {
        assert.equal(err.response.status, 401)
      }
    })
    it('should get all users', async () => {
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/users`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.token}`
          }
        }
        const result = await axios(options)
        assert(result.status === 200)
        assert.isArray(result.data)
        const user = result.data[0]

        assert(user.email === 'email@email.com')
        assert(user.password === undefined)
      } catch (error) {
        assert.fail('Unexpected code path.')
      }
    })
  })

  describe('GET /users/:id', () => {
    it('should handle request error', async () => {
      try {
        sandbox.stub(app.controller.useCases.users, 'getUser').throws(new Error('test error'))

        const options = {
          method: 'GET',
          url: `${LOCALHOST}/users/${testData.user._id}`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.token}`
          }
        }
        const result = await axios(options)

        testData.user = result.data.user

        assert.fail('Unexpected code path.')
      } catch (error) {
        assert(error.response.status === 422)
        assert.isString(error.response.data)
      }
    })
    it('should not fetch users if the authorization header is missing', async () => {
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/users/${testData.user._id}`,
          headers: {
            Accept: 'application/json'
          }
        }
        await axios(options)

        assert.fail('Invalid code path.')
      } catch (err) {
        assert.equal(err.response.status, 401)
      }
    })
    it('should not fetch users if the authorization header is missing the scheme', async () => {
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/users/${testData.user._id}`,
          headers: {
            Accept: 'application/json',
            Authorization: '1'
          }
        }
        await axios(options)

        assert.fail('Invalid code path.')
      } catch (err) {
        assert.equal(err.response.status, 401)
      }
    })
    it('should not fetch users if the authorization header has invalid scheme', async () => {
      const { token } = testData
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/users/${testData.user._id}`,
          headers: {
            Accept: 'application/json',
            Authorization: `Unknown ${token}`
          }
        }
        await axios(options)

        assert.fail('Invalid code path.')
      } catch (err) {
        assert.equal(err.response.status, 401)
      }
    })
    it('should not fetch users if token is invalid', async () => {
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/users/${testData.user._id}`,
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer 1'
          }
        }
        await axios(options)

        assert.fail('Invalid code path.')
      } catch (err) {
        assert.equal(err.response.status, 401)
      }
    })
    it('should user by id', async () => {
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/users/${testData.user._id}`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.token}`
          }
        }

        const result = await axios(options)

        assert(result.status === 200)
        assert.isObject(result.data)
        assert(result.data.email === 'email@email.com')
        assert(result.data.password === undefined)
      } catch (error) {
        assert.fail('Unexpected code path.')
      }
    })
  })

  describe('PUT /users/:id', () => {
    it('should handle request error', async () => {
      try {
        sandbox.stub(app.controller.useCases.users, 'updateUser').throws(new Error('test error'))

        const options = {
          method: 'PUT',
          url: `${LOCALHOST}/users/${testData.user._id}`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.token}`

          },
          data: 'error data'
        }
        await axios(options)

        assert.fail('Invalid code path.')
      } catch (error) {
        assert.equal(error.response.status, 422)
        assert.isString(error.response.data)
      }
    })
    it('should not fetch users if the authorization header is missing', async () => {
      try {
        const options = {
          method: 'PUT',
          url: `${LOCALHOST}/users/${testData.user._id}`,
          headers: {
            Accept: 'application/json'
          },
          data: {
            username: 'newname'
          }
        }
        await axios(options)

        assert.fail('Invalid code path.')
      } catch (error) {
        assert.equal(error.response.status, 401)
      }
    })
    it('should not fetch users if the authorization header is missing the scheme', async () => {
      try {
        const options = {
          method: 'PUT',
          url: `${LOCALHOST}/users/${testData.user._id}`,
          headers: {
            Accept: 'application/json',
            Authorization: `${testData.token}`
          },
          data: {
            username: 'newname'
          }
        }
        await axios(options)

        assert.fail('Invalid code path.')
      } catch (err) {
        assert.equal(err.response.status, 401)
      }
    })
    it('should not fetch users if the authorization header has invalid scheme', async () => {
      try {
        const options = {
          method: 'PUT',
          url: `${LOCALHOST}/users/${testData.user._id}`,
          headers: {
            Accept: 'application/json',
            Authorization: `Unknown ${testData.token}`
          },
          data: {
            username: 'newname'
          }
        }
        await axios(options)

        assert.fail('Invalid code path.')
      } catch (err) {
        assert.equal(err.response.status, 401)
      }
    })
    it('should not fetch users if token is invalid', async () => {
      try {
        const options = {
          method: 'PUT',
          url: `${LOCALHOST}/users/${testData.user._id}`,
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer invalidtoken'
          },
          data: {
            username: 'newname'
          }
        }
        await axios(options)

        assert.fail('Invalid code path.')
      } catch (err) {
        assert.equal(err.response.status, 401)
      }
    })
    it('should update user', async () => {
      try {
        const options = {
          method: 'PUT',
          url: `${LOCALHOST}/users/${testData.user._id}`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.token}`
          },
          data: {
            username: 'newname'
          }
        }
        const result = await axios(options)

        assert(result.status === 200)
        assert.isObject(result.data)
        assert.property(result.data, 'username')
        assert(result.data.password === undefined)
        assert.equal(result.data.username, options.data.username)
      } catch (error) {
        assert.fail('Unexpected code path.')
      }
    })
  })

  describe('PUT /users/password', () => {
    it('should handle request error', async () => {
      try {
        sandbox.stub(app.controller.useCases.users, 'changePassword').throws(new Error('test error'))

        const options = {
          method: 'PUT',
          url: `${LOCALHOST}/users/password`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.token}`

          },
          data: {
            password: 'newpassword',
            code: 1234
          }
        }
        await axios(options)

        assert.fail('Invalid code path.')
      } catch (error) {
        assert.equal(error.response.status, 422)
        assert.isString(error.response.data)
      }
    })
    it('should not update users password if the authorization header is missing', async () => {
      try {
        const options = {
          method: 'PUT',
          url: `${LOCALHOST}/users/password`,
          headers: {
            Accept: 'application/json'
          },
          data: {
            password: 'newpassword',
            code: 1234
          }
        }
        await axios(options)

        assert.fail('Invalid code path.')
      } catch (error) {
        assert.equal(error.response.status, 401)
      }
    })
    it('should not update users password  if the authorization header is missing the scheme', async () => {
      try {
        const options = {
          method: 'PUT',
          url: `${LOCALHOST}/users/password`,
          headers: {
            Accept: 'application/json',
            Authorization: `${testData.token}`
          },
          data: {
            password: 'newpassword',
            code: 1234
          }
        }
        await axios(options)

        assert.fail('Invalid code path.')
      } catch (err) {
        assert.equal(err.response.status, 401)
      }
    })
    it('should not update users password  if the authorization header has invalid scheme', async () => {
      try {
        const options = {
          method: 'PUT',
          url: `${LOCALHOST}/users/password`,
          headers: {
            Accept: 'application/json',
            Authorization: `Unknown ${testData.token}`
          },
          data: {
            password: 'newpassword',
            code: 1234
          }
        }
        await axios(options)

        assert.fail('Invalid code path.')
      } catch (err) {
        assert.equal(err.response.status, 401)
      }
    })
    it('should not update users password if token is invalid', async () => {
      try {
        const options = {
          method: 'PUT',
          url: `${LOCALHOST}/users/password`,
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer invalidtoken'
          },
          data: {
            password: 'newpassword',
            code: 1234
          }
        }
        await axios(options)

        assert.fail('Invalid code path.')
      } catch (err) {
        assert.equal(err.response.status, 401)
      }
    })
    it('should update user password', async () => {
      try {
        sandbox.stub(app.controller.useCases.users, 'changePassword').resolves(true)
        const options = {
          method: 'PUT',
          url: `${LOCALHOST}/users/password`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.token}`
          },
          data: {
            newPassword: 'newpass123',
            oldPassword: 'test'
          }
        }
        const result = await axios(options)
        assert(result.status === 200)
      } catch (error) {
        assert.fail('Unexpected code path.')
      }
    })
  })

  describe('GET /users/email/code', () => {
    it('should handle request error', async () => {
      try {
        sandbox.stub(app.controller.useCases.users, 'sendEmailVerificationCode').throws(new Error('test error'))

        const options = {
          method: 'GET',
          url: `${LOCALHOST}/users/email/code`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.token}`
          }
        }
        const result = await axios(options)

        testData.user = result.data.user

        assert.fail('Unexpected code path.')
      } catch (error) {
        assert(error.response.status === 422)
        assert.isString(error.response.data)
      }
    })
    it('should not fetch users if the authorization header is missing', async () => {
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/users/email/code`,
          headers: {
            Accept: 'application/json'
          }
        }
        await axios(options)

        assert.fail('Invalid code path.')
      } catch (err) {
        assert.equal(err.response.status, 401)
      }
    })
    it('should not fetch users if the authorization header is missing the scheme', async () => {
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/users/email/code`,
          headers: {
            Accept: 'application/json',
            Authorization: '1'
          }
        }
        await axios(options)

        assert.fail('Invalid code path.')
      } catch (err) {
        assert.equal(err.response.status, 401)
      }
    })
    it('should not fetch users if the authorization header has invalid scheme', async () => {
      const { token } = testData
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/users/email/code`,
          headers: {
            Accept: 'application/json',
            Authorization: `Unknown ${token}`
          }
        }
        await axios(options)

        assert.fail('Invalid code path.')
      } catch (err) {
        assert.equal(err.response.status, 401)
      }
    })
    it('should not fetch users if token is invalid', async () => {
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/users/email/code`,
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer 1'
          }
        }
        await axios(options)

        assert.fail('Invalid code path.')
      } catch (err) {
        assert.equal(err.response.status, 401)
      }
    })
    it('should send email code verification', async () => {
      try {
        sandbox.stub(app.controller.useCases.users, 'sendEmailVerificationCode').resolves(true)

        const options = {
          method: 'GET',
          url: `${LOCALHOST}/users/email/code`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.token}`
          }
        }

        const result = await axios(options)

        assert(result.status === 200)
      } catch (error) {
        assert.fail('Unexpected code path.')
      }
    })
  })
  describe('POST /users/email/verify', () => {
    it('should handle request error', async () => {
      try {
        sandbox.stub(app.controller.useCases.users, 'verifyEmailCode').throws(new Error('test error'))

        const options = {
          method: 'POST',
          url: `${LOCALHOST}/users/email/verify`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.token}`

          },
          data: {
            code: 123456
          }
        }
        await axios(options)

        assert.fail('Invalid code path.')
      } catch (error) {
        assert.equal(error.response.status, 422)
        assert.isString(error.response.data)
      }
    })
    it('should not fetch users if the authorization header is missing', async () => {
      try {
        const options = {
          method: 'POST',
          url: `${LOCALHOST}/users/email/verify`,
          headers: {
            Accept: 'application/json'

          },
          data: {
            code: 123456
          }
        }
        await axios(options)

        assert.fail('Invalid code path.')
      } catch (error) {
        assert.equal(error.response.status, 401)
      }
    })
    it('should not fetch users if the authorization header is missing the scheme', async () => {
      try {
        const options = {
          method: 'POST',
          url: `${LOCALHOST}/users/email/verify`,
          headers: {
            Accept: 'application/json',
            Authorization: `${testData.token}`

          },
          data: {
            code: 123456
          }
        }

        await axios(options)

        assert.fail('Invalid code path.')
      } catch (err) {
        assert.equal(err.response.status, 401)
      }
    })
    it('should not fetch users if the authorization header has invalid scheme', async () => {
      try {
        const options = {
          method: 'POST',
          url: `${LOCALHOST}/users/email/verify`,
          headers: {
            Accept: 'application/json',
            Authorization: `Unknown ${testData.token}`

          },
          data: {
            code: 123456
          }
        }

        await axios(options)

        assert.fail('Invalid code path.')
      } catch (err) {
        assert.equal(err.response.status, 401)
      }
    })
    it('should not fetch users if token is invalid', async () => {
      try {
        const options = {
          method: 'POST',
          url: `${LOCALHOST}/users/email/verify`,
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer invalidtoken'

          },
          data: {
            code: 123456
          }
        }

        await axios(options)

        assert.fail('Invalid code path.')
      } catch (err) {
        assert.equal(err.response.status, 401)
      }
    })
    it('should verify code', async () => {
      try {
        sandbox.stub(app.controller.useCases.users, 'verifyEmailCode').resolves(true)

        const options = {
          method: 'POST',
          url: `${LOCALHOST}/users/email/verify`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.token}`

          },
          data: {
            code: 123456
          }
        }

        const result = await axios(options)

        assert(result.status === 200)
      } catch (error) {
        assert.fail('Unexpected code path.')
      }
    })
  })

  describe('POST /users/telegram/verify', () => {
    it('should handle request error', async () => {
      try {
        sandbox.stub(app.controller.useCases.users, 'verifyTelegram').throws(new Error('test error'))

        const options = {
          method: 'POST',
          url: `${LOCALHOST}/users/telegram/verify`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.token}`

          },
          data: {
            code: 123456
          }
        }
        await axios(options)

        assert.fail('Invalid code path.')
      } catch (error) {
        assert.equal(error.response.status, 422)
        assert.isString(error.response.data)
      }
    })
    it('should not fetch users if the authorization header is missing', async () => {
      try {
        const options = {
          method: 'POST',
          url: `${LOCALHOST}/users/telegram/verify`,
          headers: {
            Accept: 'application/json'

          },
          data: {
            code: 123456
          }
        }
        await axios(options)

        assert.fail('Invalid code path.')
      } catch (error) {
        assert.equal(error.response.status, 401)
      }
    })
    it('should not fetch users if the authorization header is missing the scheme', async () => {
      try {
        const options = {
          method: 'POST',
          url: `${LOCALHOST}/users/telegram/verify`,
          headers: {
            Accept: 'application/json',
            Authorization: `${testData.token}`

          },
          data: {
            code: 123456
          }
        }

        await axios(options)

        assert.fail('Invalid code path.')
      } catch (err) {
        assert.equal(err.response.status, 401)
      }
    })
    it('should not fetch users if the authorization header has invalid scheme', async () => {
      try {
        const options = {
          method: 'POST',
          url: `${LOCALHOST}/users/telegram/verify`,
          headers: {
            Accept: 'application/json',
            Authorization: `Unknown ${testData.token}`

          },
          data: {
            code: 123456
          }
        }

        await axios(options)

        assert.fail('Invalid code path.')
      } catch (err) {
        assert.equal(err.response.status, 401)
      }
    })
    it('should not fetch users if token is invalid', async () => {
      try {
        const options = {
          method: 'POST',
          url: `${LOCALHOST}/users/telegram/verify`,
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer invalidtoken'

          },
          data: {
            code: 123456
          }
        }

        await axios(options)

        assert.fail('Invalid code path.')
      } catch (err) {
        assert.equal(err.response.status, 401)
      }
    })
    it('should verify code', async () => {
      try {
        sandbox.stub(app.controller.useCases.users, 'verifyTelegram').resolves(true)

        const options = {
          method: 'POST',
          url: `${LOCALHOST}/users/telegram/verify`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.token}`

          },
          data: {
            code: 123456
          }
        }

        const result = await axios(options)

        assert(result.status === 200)
      } catch (error) {
        assert.fail('Unexpected code path.')
      }
    })
  })

  describe('POST /users/password/reset', () => {
    it('should handle request error', async () => {
      try {
        sandbox.stub(app.controller.useCases.users, 'sendPasswordResetEmail').throws(new Error('test error'))

        const options = {
          method: 'POST',
          url: `${LOCALHOST}/users/password/reset`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.token}`
          }
        }
        await axios(options)

        assert.fail('Invalid code path.')
      } catch (error) {
        assert.equal(error.response.status, 422)
        assert.isString(error.response.data)
      }
    })
    it('should reset password', async () => {
      try {
        sandbox.stub(app.controller.useCases.users.libraries.emailService, 'sendEmail').resolves(true)

        const options = {
          method: 'POST',
          url: `${LOCALHOST}/users/password/reset`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.token}`
          },
          data: {
            email: testData.user.email
          }
        }
        const result = await axios(options)
        testData.resetPasswordToken = result.data.token
        assert(result.status === 200)
      } catch (error) {
        assert.fail('Unexpected code path.')
      }
    })
  })
  describe('Get /users/password/reset', () => {
    it('should handle request error', async () => {
      try {
        sandbox.stub(app.controller.useCases.users, 'resetPassword').throws(new Error('test error'))

        const options = {
          method: 'GET',
          url: `${LOCALHOST}/users/password/reset`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.resetPasswordToken}`
          }
        }
        await axios(options)

        assert.fail('Invalid code path.')
      } catch (error) {
        assert.equal(error.response.status, 422)
        assert.isString(error.response.data)
      }
    })
    it('should reset password', async () => {
      try {
        sandbox.stub(app.controller.useCases.users, 'resetPassword').resolves(true)

        const options = {
          method: 'GET',
          url: `${LOCALHOST}/users/password/reset`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.resetPasswordToken}`
          }
        }
        const result = await axios(options)

        assert(result.status === 200)
      } catch (error) {
        // console.log('error', error)
        assert.fail('Unexpected code path.')
      }
    })
  })
})
