import sinon from 'sinon'
import { assert } from 'chai'
import axios from 'axios'
import config from '../../config.js'
import { cleanDb, startApp, cleanNode, createTestUser } from '../util/test-util.js'

const LOCALHOST = `http://localhost:${config.port}`

describe('e2e-account', () => {
  let sandbox
  const testData = {}
  let app
  before(async () => {
    config.passKey = 'testKey'
    app = await startApp(config)
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

  describe('POST /payment', () => {
    it('should reject if the authorization header is missing', async () => {
      try {
        const options = {
          method: 'POST',
          url: `${LOCALHOST}/payment`,
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
          url: `${LOCALHOST}/payment`,
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
          url: `${LOCALHOST}/payment`,
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
          url: `${LOCALHOST}/payment`,
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
          url: `${LOCALHOST}/payment`

        }
        await axios(options)

        assert.fail('Unexpected code path.')
      } catch (error) {
        assert(error.response.status === 422)
        assert.isString(error.response.data)
      }
    })
    it('should handle success request', async () => {
      sandbox.stub(app.controller.useCases.payments, 'createPayment').resolves({})
      const options = {
        method: 'post',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${testData.user.token}`
        },
        url: `${LOCALHOST}/payment`

      }
      const result = await axios(options)

      assert(result.status === 200)
    })
  })

  describe('POST /payment/validate', () => {
    it('should reject if the authorization header is missing', async () => {
      try {
        const options = {
          method: 'POST',
          url: `${LOCALHOST}/payment/validate`,
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
          url: `${LOCALHOST}/payment/validate`,
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
          url: `${LOCALHOST}/payment/validate`,
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
          url: `${LOCALHOST}/payment/validate`,
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
          url: `${LOCALHOST}/payment/validate`

        }
        await axios(options)

        assert.fail('Unexpected code path.')
      } catch (error) {
        assert(error.response.status === 422)
        assert.isString(error.response.data)
      }
    })
    it('should handle success request', async () => {
      sandbox.stub(app.controller.useCases.payments, 'validatePayment').resolves([])
      const options = {
        method: 'post',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${testData.user.token}`
        },
        url: `${LOCALHOST}/payment/validate`

      }
      const result = await axios(options)

      assert(result.status === 200)
    })
  })
  describe('DELETE /payment/cancel/<id>', () => {
    it('should reject if the authorization header is missing', async () => {
      try {
        const options = {
          method: 'delete',
          url: `${LOCALHOST}/payment/cancel/${'id'}`,
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
          method: 'delete',
          url: `${LOCALHOST}/payment/cancel/${'id'}`,
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
          method: 'delete',
          url: `${LOCALHOST}/payment/cancel/${'id'}`,
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
          method: 'delete',
          url: `${LOCALHOST}/payment/cancel/${'id'}`,
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
          method: 'delete',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.user.token}`
          },
          url: `${LOCALHOST}/payment/cancel/${'id'}`

        }
        await axios(options)

        assert.fail('Unexpected code path.')
      } catch (error) {
        assert(error.response.status === 422)
        assert.isString(error.response.data)
      }
    })
    it('should handle success request', async () => {
      sandbox.stub(app.controller.useCases.payments, 'cancelPayment').resolves([])
      const options = {
        method: 'delete',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${testData.user.token}`
        },
        url: `${LOCALHOST}/payment/cancel/${'id'}`

      }
      const result = await axios(options)

      assert(result.status === 200)
    })
  })

  describe('GET /payment/user', () => {
    it('should reject if the authorization header is missing', async () => {
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/payment/user`,
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
          url: `${LOCALHOST}/payment/user`,
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
          url: `${LOCALHOST}/payment/user`,
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
          url: `${LOCALHOST}/payment/user`,
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
        sandbox.stub(app.controller.useCases.payments, 'getUserPayments').throws(new Error('test error'))
        const options = {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.user.token}`
          },
          url: `${LOCALHOST}/payment/user`

        }
        await axios(options)

        assert.fail('Unexpected code path.')
      } catch (error) {
        assert(error.response.status === 422)
        assert.isString(error.response.data)
      }
    })
    it('should handle success request', async () => {
      sandbox.stub(app.controller.useCases.payments, 'getUserPayments').resolves([])
      const options = {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${testData.user.token}`
        },
        url: `${LOCALHOST}/payment/user`

      }
      const result = await axios(options)

      assert(result.status === 200)
    })
  })
  describe('POST /payment/report', () => {
    it('should reject if the authorization header is missing', async () => {
      try {
        const options = {
          method: 'POST',
          url: `${LOCALHOST}/payment/report`,
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
          url: `${LOCALHOST}/payment/report`,
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
          url: `${LOCALHOST}/payment/report`,
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
          url: `${LOCALHOST}/payment/report`,
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
          url: `${LOCALHOST}/payment/report`

        }
        await axios(options)

        assert.fail('Unexpected code path.')
      } catch (error) {
        assert(error.response.status === 422)
        assert.isString(error.response.data)
      }
    })
    it('should handle success request', async () => {
      sandbox.stub(app.controller.useCases.payments, 'reportPayment').resolves({})
      const options = {
        method: 'post',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${testData.user.token}`
        },
        url: `${LOCALHOST}/payment/report`,
        data: {
          description: 'report a payment',
          payymentId: 'a payment id'
        }

      }
      const result = await axios(options)

      assert(result.status === 200)
    })
  })
  describe('GET /payment/reports', () => {
    it('should handle request error', async () => {
      try {
        sandbox.stub(app.controller.useCases.payments, 'getReports').throws(new Error('test error'))
        const options = {
          method: 'GET',
          headers: {
            Accept: 'application/json'
          },
          url: `${LOCALHOST}/payment/reports`

        }
        await axios(options)

        assert.fail('Unexpected code path.')
      } catch (error) {
        assert(error.response.status === 422)
        assert.isString(error.response.data)
      }
    })
    it('should handle success request', async () => {
      sandbox.stub(app.controller.useCases.payments, 'getReports').resolves([])
      const options = {
        method: 'GET',
        headers: {
          Accept: 'application/json'
        },
        url: `${LOCALHOST}/payment/reports`

      }
      const result = await axios(options)

      assert(result.status === 200)
    })
  })
})
