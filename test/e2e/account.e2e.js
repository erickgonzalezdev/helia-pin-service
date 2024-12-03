import sinon from 'sinon'
import { assert } from 'chai'
import axios from 'axios'
import config from '../../config.js'
import { cleanDb, startApp, cleanNode, createTestUser } from '../util/test-util.js'

const LOCALHOST = `http://localhost:${config.port}`

describe('e2e-account', () => {
  let sandbox
  const testData = {}
  before(async () => {
    config.passKey = 'testKey'
    await startApp(config)
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

  describe('POST /account', () => {
    it('should reject if the authorization header is missing', async () => {
      try {
        const options = {
          method: 'POST',
          url: `${LOCALHOST}/account`,
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
          method: 'POST',
          url: `${LOCALHOST}/account`,
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
          method: 'POST',
          url: `${LOCALHOST}/account`,
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
          method: 'POST',
          url: `${LOCALHOST}/account`,
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
        const options = {
          method: 'post',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.user.token}`
          },
          url: `${LOCALHOST}/account`

        }
        await axios(options)

        assert.fail('Unexpected code path.')
      } catch (error) {
        assert(error.response.status === 422)
        assert.isString(error.response.data)
      }
    })
    it('should create account', async () => {
      try {
        const options = {
          method: 'post',
          url: `${LOCALHOST}/account`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.user.token}`
          },
          data: {
            userId: testData.user._id.toString(),
            type: 1,
            expirationData: { days: 1 }
          }
        }
        const result = await axios(options)

        const account = result.data.account

        assert(result.status === 200)
        assert.isObject(account)
      } catch (error) {
        assert.fail('Unexpected code path.')
      }
    })
  })
})
