import sinon from 'sinon'
import { assert } from 'chai'
import axios from 'axios'
import config from '../../config.js'
import { cleanDb, startApp, cleanNode, createTestUser, createTestBoxModel } from '../util/test-util.js'
import FormData from 'form-data'

const LOCALHOST = `http://localhost:${config.port}`

let app
describe('e2e-file', () => {
  let sandbox
  const testData = {}
  before(async () => {
    config.passKey = 'testKey'
    app = await startApp(config)
    await cleanDb()
    await cleanNode()
    testData.user = await createTestUser()
    testData.box = await createTestBoxModel()
  })
  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })
  afterEach(() => {
    sandbox.restore()
  })

  describe('POST /files', () => {
    it('should reject if the authorization header is missing', async () => {
      try {
        const options = {
          headers: {
            Accept: 'application/json'
          }
        }
        const form = new FormData()
        await axios.post(`${LOCALHOST}/files`, form, options)

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
        await axios.post(`${LOCALHOST}/files`, form, options)
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
        await axios.post(`${LOCALHOST}/files`, form, options)

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
        await axios.post(`${LOCALHOST}/files`, form, options)

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
        await axios.post(`${LOCALHOST}/files`, form, axiosConfig)

        assert.fail('Unexpected code path.')
      } catch (error) {
        assert.isString(error.response.data)
      }
    })
    it('should upload file', async () => {
      try {
        // Create a form and append the file to it.
        const form = new FormData()
        const axiosConfig = {
          headers: form.getHeaders()
        }
        axiosConfig.headers.Authorization = `Bearer ${testData.user.token}`
        form.append('file', Buffer.from('Unit under test'), 'test.txt')

        // Send the file to the ipfs-file-stage server.
        const result = await axios.post(`${LOCALHOST}/files`, form, axiosConfig)
        testData.file = result.data
        assert(result.status === 200)
      } catch (error) {
        assert.fail('Unexpected code path.')
      }
    })
    it('should upload file with a boxkey', async () => {
      try {
        // Create a form and append the file to it.
        const form = new FormData()
        const axiosConfig = {
          headers: form.getHeaders()
        }
        axiosConfig.headers.Authorization = `Bearer ${testData.box.signatures[0].key}`
        form.append('file', Buffer.from('Unit under test'), 'test.txt')

        // Send the file to the ipfs-file-stage server.
        const result = await axios.post(`${LOCALHOST}/files`, form, axiosConfig)
        testData.file = result.data
        assert(result.status === 200)
      } catch (error) {
        assert.fail('Unexpected code path.')
      }
    })
  })

  describe('GET /files', () => {
    it('should reject if the authorization header is missing', async () => {
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/files`,
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
          url: `${LOCALHOST}/files`,
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
          url: `${LOCALHOST}/files`,
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
          url: `${LOCALHOST}/files`,
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
        sandbox.stub(app.controller.useCases.files, 'getFiles').throws(new Error('test error'))

        const options = {
          method: 'GET',
          url: `${LOCALHOST}/files`,
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
    it('should get files', async () => {
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/files`,
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

  describe('GET /files/:id', () => {
    it('should reject if the authorization header is missing', async () => {
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/files/${testData.file._id}`,
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
          url: `${LOCALHOST}/files/${testData.file._id}`,
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
          url: `${LOCALHOST}/files/${testData.file._id}`,
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
          url: `${LOCALHOST}/files/${testData.file._id}`,
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
        sandbox.stub(app.controller.useCases.files, 'getFile').throws(new Error('test error'))

        const options = {
          method: 'GET',
          url: `${LOCALHOST}/files/${testData.file._id}`,
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
    it('should get files', async () => {
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/files/${testData.file._id}`,
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
