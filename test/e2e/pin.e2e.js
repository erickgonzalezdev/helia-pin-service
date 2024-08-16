import sinon from 'sinon'
import { assert } from 'chai'
import axios from 'axios'
import config from '../../config.js'
import { cleanDb, cleanNode, startApp, createTestUser, createTestBoxModel } from '../util/test-util.js'

const LOCALHOST = `http://localhost:${config.port}`

let app // global var

describe('e2e-pin', () => {
  let sandbox
  const testData = {}
  before(async () => {
    app = await startApp()
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

  describe('GET /pin/box/:id', () => {
    it('should reject if the authorization header is missing', async () => {
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/pin/box/${testData.box._id}`,
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
          url: `${LOCALHOST}/pin/box/${testData.box._id}`,
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
          url: `${LOCALHOST}/pin/box/${testData.box._id}`,
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
          url: `${LOCALHOST}/pin/box/${testData.box._id}`,
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
        sandbox.stub(app.controller.useCases.pin, 'getPinsByBox').throws(new Error('test error'))

        const options = {
          method: 'GET',
          url: `${LOCALHOST}/pin/box/${testData.box._id}`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.user.token}`
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

    it('should get box pins with user JWT', async () => {
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/pin/box/${testData.box._id}`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.user.token}`
          }
        }

        const result = await axios(options)

        assert(result.status === 200)
        assert.isArray(result.data)
      } catch (error) {
        assert.fail('Unexpected code path.')
      }
    })
    it('should get box pins with box JWT', async () => {
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/pin/box/${testData.box._id}`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.box.signatures[0].key}`
          }
        }

        const result = await axios(options)

        assert(result.status === 200)
        assert.isArray(result.data)
      } catch (error) {
        assert.fail('Unexpected code path.')
      }
    })
  })
})
