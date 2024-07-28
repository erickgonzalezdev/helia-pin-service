import sinon from 'sinon'
import { assert } from 'chai'
import axios from 'axios'
import config from '../../config.js'
import SERVER from '../../server.js'
import { cleanDb } from '../util/test-util.js'

const testData = {}
const LOCALHOST = `http://localhost:${config.port}`

describe('e2e-users', () => {
  let sandbox
  let app
  before(async () => {
    app = new SERVER()
    await app.start()
    await cleanDb()
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
        const options = {
          method: 'post',
          url: `${LOCALHOST}/users`,
          data: {
            username: 'testname',
            password: 'test'
          }
        }
        const result = await axios(options)

        testData.user = result.data.user

        assert(result.status === 200)
        assert(result.data.user.username === 'testname')
        assert(result.data.user.password === undefined)
      } catch (error) {
        throw error
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
            username: 'testname'
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
            username: 'unknow',
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
            username: 'testname',
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
            username: 'testname',
            password: 'test'
          }
        }
        const result = await axios(options)
        testData.token = result.data.token
        assert(result.status === 200)
        assert(result.data.user.username === 'testname')
        assert(result.data.user.password === undefined)
      } catch (error) {
        throw error
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

        assert(user.username === 'testname')
        assert(user.password === undefined)
      } catch (error) {
        throw error
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
        assert(result.data.username === 'testname')
        assert(result.data.password === undefined)
      } catch (error) {
        throw error
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
        // console.log(error)
        throw error
      }
    })
  })
})
