import sinon from 'sinon'
import { assert } from 'chai'
import axios from 'axios'
import config from '../../config.js'
import { cleanDb, startApp, cleanNode, createTestUser } from '../util/test-util.js'
import FormData from 'form-data'

const LOCALHOST = `http://localhost:${config.port}`

let app
describe('e2e-pin', () => {
  let sandbox
  const testData = {}
  before(async () => {
    app = await startApp()
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

  describe('POST /pin', () => {
    it('should reject if the authorization header is missing', async () => {
      try {
        const options = {
          headers: {
            Accept: 'application/json'
          }
        }
        const form = new FormData()
        await axios.post(`${LOCALHOST}/pin`, form, options)

        assert.fail('Invalid code path.')
      } catch (err) {
        assert.equal(err.response.status, 401)
      }
    })
    it('should rejectif the authorization header is missing the scheme', async () => {
      try {
        const options = {
          headers: {
            Accept: 'application/json',
            Authorization: '1'
          }
        }
        const form = new FormData()
        await axios.post(`${LOCALHOST}/pin`, form, options)
        assert.fail('Invalid code path.')
      } catch (err) {
        assert.equal(err.response.status, 401)
      }
    })
    it('should reject if the authorization header has invalid scheme', async () => {
      const { token } = testData.user
      try {
        const options = {
          headers: {
            Accept: 'application/json',
            Authorization: `Unknow ${token}`
          }
        }
        const form = new FormData()
        await axios.post(`${LOCALHOST}/pin`, form, options)

        assert.fail('Invalid code path.')
      } catch (err) {
        assert.equal(err.response.status, 401)
      }
    })
    it('should reject if token is invalid', async () => {
      try {
        const options = {
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer 1'
          }
        }
        const form = new FormData()
        await axios.post(`${LOCALHOST}/pin`, form, options)

        assert.fail('Invalid code path.')
      } catch (err) {
        assert.equal(err.response.status, 401)
      }
    })
    it('should handle request error', async () => {
      try {
        // Create a form and append the file to it.
        const form = new FormData()
        const axiosConfig = {
          headers: form.getHeaders()
        }
        axiosConfig.headers.Authorization = `Bearer ${testData.user.token}`

        // Send the file to the ipfs-file-stage server.
        await axios.post(`${LOCALHOST}/pin`, form, axiosConfig)

        assert.fail('Unexpected code path.')
      } catch (error) {
        assert.isString(error.response.data)
      }
    })
    it('should pin file', async () => {
      try {
        // Create a form and append the file to it.
        const form = new FormData()
        const axiosConfig = {
          headers: form.getHeaders()
        }
        axiosConfig.headers.Authorization = `Bearer ${testData.user.token}`
        form.append('file', Buffer.from('Unit under test'), 'test.txt')

        // Send the file to the ipfs-file-stage server.
        const result = await axios.post(`${LOCALHOST}/pin`, form, axiosConfig)
        testData.pin = result.data
        assert(result.status === 200)
      } catch (error) {
        assert.fail('Unexpected code path.')
      }
    })
  })

  describe('GET /pin', () => {
    it('should reject if the authorization header is missing', async () => {
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/pin`,
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
    it('should rejectif the authorization header is missing the scheme', async () => {
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/pin`,
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
    it('should reject if the authorization header has invalid scheme', async () => {
      const { token } = testData.user
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/pin`,
          headers: {
            Accept: 'application/json',
            Authorization: `Unknow ${token}`
          }
        }
        await axios(options)

        assert.fail('Invalid code path.')
      } catch (err) {
        assert.equal(err.response.status, 401)
      }
    })
    it('should reject if token is invalid', async () => {
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/pin`,
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
    it('should handle request error', async () => {
      try {
        sandbox.stub(app.controller.useCases.pin, 'getPins').throws(new Error('test error'))

        const options = {
          method: 'GET',
          url: `${LOCALHOST}/pin`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.user.token}`
          }
        }
        await axios(options)

        assert.fail('Unexpected code path.')
      } catch (error) {
        assert.isString(error.response.data)
      }
    })
    it('should get pins', async () => {
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/pin`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.user.token}`
          }
        }
        const result = await axios(options)

        assert(result.status === 200)
      } catch (error) {
        assert.fail('Unexpected code path.')
      }
    })
  })

  describe('GET /pin/:id', () => {
    it('should reject if the authorization header is missing', async () => {
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/pin/${testData.pin._id}`,
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
    it('should rejectif the authorization header is missing the scheme', async () => {
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/pin/${testData.pin._id}`,
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
    it('should reject if the authorization header has invalid scheme', async () => {
      const { token } = testData.user
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/pin/${testData.pin._id}`,
          headers: {
            Accept: 'application/json',
            Authorization: `Unknow ${token}`
          }
        }
        await axios(options)

        assert.fail('Invalid code path.')
      } catch (err) {
        assert.equal(err.response.status, 401)
      }
    })
    it('should reject if token is invalid', async () => {
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/pin/${testData.pin._id}`,
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
    it('should handle request error', async () => {
      try {
        sandbox.stub(app.controller.useCases.pin, 'getPin').throws(new Error('test error'))

        const options = {
          method: 'GET',
          url: `${LOCALHOST}/pin/${testData.pin._id}`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.user.token}`
          }
        }
        await axios(options)

        assert.fail('Unexpected code path.')
      } catch (error) {
        assert.isString(error.response.data)
      }
    })
    it('should get pins', async () => {
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/pin/${testData.pin._id}`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.user.token}`
          }
        }
        const result = await axios(options)

        assert(result.status === 200)
      } catch (error) {
        assert.fail('Unexpected code path.')
      }
    })
  })
})
