import sinon from 'sinon'
import { assert } from 'chai'
import axios from 'axios'
import config from '../../config.js'
import { cleanDb, cleanNode, startApp, createTestUser } from '../util/test-util.js'

const LOCALHOST = `http://localhost:${config.port}`

let app // global var

describe('e2e-box', () => {
  let sandbox
  const testData = {}
  before(async () => {
    app = await startApp()
    await cleanDb()
    await cleanNode()
    testData.user = await createTestUser()
    testData.user2 = await createTestUser()
  })
  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })
  afterEach(() => {
    sandbox.restore()
  })

  describe('POST /box', () => {
    it('should reject if the authorization header is missing', async () => {
      try {
        const options = {
          method: 'POST',
          url: `${LOCALHOST}/box`,
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
          url: `${LOCALHOST}/box`,
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
          url: `${LOCALHOST}/box`,
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
          url: `${LOCALHOST}/box`,
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
          url: `${LOCALHOST}/box`

        }
        await axios(options)

        assert.fail('Unexpected code path.')
      } catch (error) {
        assert(error.response.status === 422)
        assert.isString(error.response.data)
      }
    })
    it('should create box', async () => {
      try {
        const options = {
          method: 'post',
          url: `${LOCALHOST}/box`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.user.token}`
          },
          data: {
            label: 'test box',
            description: 'this a test box model'
          }
        }
        const result = await axios(options)

        testData.box = result.data.box

        assert(result.status === 200)
      } catch (error) {
        assert.fail('Unexpected code path.')
      }
    })
  })

  describe('GET /box/', () => {
    it('should reject if the authorization header is missing', async () => {
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/box`,
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
          url: `${LOCALHOST}/box`,
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
          url: `${LOCALHOST}/box`,
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
          url: `${LOCALHOST}/box`,
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
        sandbox.stub(app.controller.useCases.box, 'getBoxes').throws(new Error('test error'))

        const options = {
          method: 'GET',
          url: `${LOCALHOST}/box`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.user.token}`
          }
        }
        await axios(options)

        assert.fail('Unexpected code path.')
      } catch (error) {
        assert(error.response.status === 422)
        assert.isString(error.response.data)
      }
    })

    it('should get all boxes', async () => {
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/box`,
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
  })

  describe('GET /box/:id', () => {
    it('should reject if the authorization header is missing', async () => {
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/box/${testData.box._id}`,
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
          url: `${LOCALHOST}/box/${testData.box._id}`,
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
          url: `${LOCALHOST}/box/${testData.box._id}`,
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
          url: `${LOCALHOST}/box/${testData.box._id}`,
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
        sandbox.stub(app.controller.useCases.box, 'getBox').throws(new Error('test error'))

        const options = {
          method: 'GET',
          url: `${LOCALHOST}/box/${testData.box._id}`,
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

    it('should get box by id', async () => {
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/box/${testData.box._id}`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.user.token}`
          }
        }

        const result = await axios(options)

        assert(result.status === 200)
        assert.isObject(result.data.box)
      } catch (error) {
        assert.fail('Unexpected code path.')
      }
    })
  })
  describe('GET /box/user', () => {
    it('should reject if the authorization header is missing', async () => {
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/box/user`,
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
          url: `${LOCALHOST}/box/user`,
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
          url: `${LOCALHOST}/box/user`,
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
          url: `${LOCALHOST}/box/user`,
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
        sandbox.stub(app.controller.useCases.box, 'getBoxesByUser').throws(new Error('test error'))

        const options = {
          method: 'GET',
          url: `${LOCALHOST}/box/user`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.user.token}`
          }
        }
        await axios(options)

        assert.fail('Unexpected code path.')
      } catch (error) {
        assert(error.response.status === 422)
        assert.isString(error.response.data)
      }
    })

    it('should get all user boxes', async () => {
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/box/user`,
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
  })
  describe('PUT /box/:id', () => {
    it('should reject if the authorization header is missing', async () => {
      try {
        const options = {
          method: 'PUT',
          url: `${LOCALHOST}/users/${testData.user._id}`,
          headers: {
            Accept: 'application/json'
          },
          data: {
            label: 'new box label'
          }
        }
        await axios(options)

        assert.fail('Invalid code path.')
      } catch (error) {
        assert.equal(error.response.status, 401)
      }
    })
    it('should reject if the authorization header is missing the scheme', async () => {
      try {
        const options = {
          method: 'PUT',
          url: `${LOCALHOST}/users/${testData.user._id}`,
          headers: {
            Accept: 'application/json',
            Authorization: `${testData.token}`
          },
          data: {
            label: 'new box label'
          }
        }
        await axios(options)

        assert.fail('Invalid code path.')
      } catch (err) {
        assert.equal(err.response.status, 401)
      }
    })
    it('should reject if the authorization header has invalid scheme', async () => {
      try {
        const options = {
          method: 'PUT',
          url: `${LOCALHOST}/users/${testData.user._id}`,
          headers: {
            Accept: 'application/json',
            Authorization: `Unknown ${testData.token}`
          },
          data: {
            label: 'new box label'
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
          method: 'PUT',
          url: `${LOCALHOST}/users/${testData.user._id}`,
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer invalidtoken'
          },
          data: {
            label: 'new box label'
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
        sandbox.stub(app.controller.useCases.box, 'updateBox').throws(new Error('test error'))

        const options = {
          method: 'PUT',
          url: `${LOCALHOST}/box/${testData.box._id}`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.user.token}`

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
    it('should update box', async () => {
      try {
        const options = {
          method: 'PUT',
          url: `${LOCALHOST}/box/${testData.box._id}`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.user.token}`
          },
          data: {
            label: 'new box label'
          }
        }
        const result = await axios(options)

        assert(result.status === 200)
        assert.isObject(result.data)
      } catch (error) {
        assert.fail('Unexpected code path.')
      }
    })
  })

  describe('POST /box/sign', () => {
    it('should reject if the authorization header is missing', async () => {
      try {
        const options = {
          method: 'POST',
          url: `${LOCALHOST}/box/sign`,
          headers: {
            Accept: 'application/json'
          },
          data: {
            boxId: testData.box._id,
            label: 'label'
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
          url: `${LOCALHOST}/box/sign`,
          headers: {
            Accept: 'application/json',
            Authorization: '1'
          },
          data: {
            boxId: testData.box._id,
            label: 'label'
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
          url: `${LOCALHOST}/box/sign`,
          headers: {
            Accept: 'application/json',
            Authorization: `Unknow ${token}`
          },
          data: {
            boxId: testData.box._id,
            label: 'label'
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
          url: `${LOCALHOST}/box/sign`,
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer 1'
          },
          data: {
            boxId: testData.box._id,
            label: 'label'
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
          method: 'POST',
          url: `${LOCALHOST}/box/sign`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.user.token}`
          },
          data: {
            boxId: testData.box._id
          }
        }
        await axios(options)

        assert.fail('Invalid code path.')
      } catch (error) {
        assert.equal(error.response.status, 422)
        assert.isString(error.response.data)
      }
    })
    it('should generate box signature', async () => {
      try {
        const options = {
          method: 'POST',
          url: `${LOCALHOST}/box/sign`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.user.token}`
          },
          data: {
            boxId: testData.box._id,
            label: 'my key'
          }
        }
        const result = await axios(options)
        assert(result.status === 200)
        assert.isObject(result.data)
        testData.signature = result.data
      } catch (error) {
        assert.fail('Unexpected code path.')
      }
    })
  })

  describe('GET /box/sign/<id>', () => {
    it('should reject if the authorization header is missing', async () => {
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/box/sign/${testData.box._id}`,
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
          url: `${LOCALHOST}/box/sign/${testData.box._id}`,
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
          url: `${LOCALHOST}/box/sign/${testData.box._id}`,
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
          url: `${LOCALHOST}/box/sign/${testData.box._id}`,
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
          method: 'GET',
          url: `${LOCALHOST}/box/sign/unknowId`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.user.token}`
          }
        }
        await axios(options)

        assert.fail('Invalid code path.')
      } catch (error) {
        assert.equal(error.response.status, 422)
        assert.isString(error.response.data)
      }
    })
    it('should get box signatures', async () => {
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/box/sign/${testData.box._id}`,
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
  })

  describe('GET /box/import', () => {
    it('should reject if the authorization header is missing', async () => {
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/box/import`,
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
          url: `${LOCALHOST}/box/import`,
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
          url: `${LOCALHOST}/box/import`,
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
          url: `${LOCALHOST}/box/import`,
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
        sandbox.stub(app.controller.useCases.box, 'getImportedBoxByUser').throws(new Error('test error'))

        const options = {
          method: 'GET',
          url: `${LOCALHOST}/box/import`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.user.token}`
          }
        }
        await axios(options)

        assert.fail('Invalid code path.')
      } catch (error) {
        assert.equal(error.response.status, 422)
        assert.isString(error.response.data)
      }
    })

    it('should get imported signatures', async () => {
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/box/import`,
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
  })
  describe('POST /box/import', () => {
    it('should reject if the authorization header is missing', async () => {
      try {
        const options = {
          method: 'POST',
          url: `${LOCALHOST}/box/import`,
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
          url: `${LOCALHOST}/box/import`,
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
          url: `${LOCALHOST}/box/import`,
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
          url: `${LOCALHOST}/box/import`,
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
          url: `${LOCALHOST}/box/import`

        }
        await axios(options)

        assert.fail('Unexpected code path.')
      } catch (error) {
        assert(error.response.status === 422)
        assert.isString(error.response.data)
      }
    })
    it('should import box', async () => {
      try {
        const options = {
          method: 'post',
          url: `${LOCALHOST}/box/import`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.user2.token}`
          },
          data: {
            signature: testData.signature.signature
          }
        }
        const result = await axios(options)
        assert(result.status === 200)
      } catch (error) {
        assert.fail('Unexpected code path.')
      }
    })
  })
  describe('DELETE /box/sign/:id', () => {
    it('should reject if the authorization header is missing', async () => {
      try {
        const options = {
          method: 'DELETE',
          url: `${LOCALHOST}/box/sign/${testData.signature._id}`,
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
          method: 'DELETE',
          url: `${LOCALHOST}/box/sign/${testData.signature._id}`,
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
          method: 'DELETE',
          url: `${LOCALHOST}/box/sign/${testData.signature._id}`,
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
          method: 'DELETE',
          url: `${LOCALHOST}/box/sign/${testData.signature._id}`,
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
        sandbox.stub(app.controller.useCases.box, 'deleteSignature').throws(new Error('test error'))

        const options = {
          method: 'DELETE',
          url: `${LOCALHOST}/box/sign/${testData.signature._id}`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.user.token}`

          }
        }
        await axios(options)

        assert.fail('Invalid code path.')
      } catch (error) {
        assert.equal(error.response.status, 422)
        assert.isString(error.response.data)
      }
    })
    it('should delete signature', async () => {
      try {
        const options = {
          method: 'DELETE',
          url: `${LOCALHOST}/box/sign/${testData.signature._id}`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.user.token}`
          }
        }
        const result = await axios(options)

        assert(result.status === 200)
        assert.isTrue(result.data)
      } catch (error) {
        assert.fail('Unexpected code path.')
      }
    })
  })
  describe('DELETE /box/:id', () => {
    it('should reject if the authorization header is missing', async () => {
      try {
        const options = {
          method: 'DELETE',
          url: `${LOCALHOST}/box/${testData.box._id}`,
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
          method: 'DELETE',
          url: `${LOCALHOST}/box/${testData.box._id}`,
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
          method: 'DELETE',
          url: `${LOCALHOST}/box/${testData.box._id}`,
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
          method: 'DELETE',
          url: `${LOCALHOST}/box/${testData.box._id}`,
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
        sandbox.stub(app.controller.useCases.box, 'deleteBox').throws(new Error('test error'))

        const options = {
          method: 'DELETE',
          url: `${LOCALHOST}/box/${testData.box._id}`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.user.token}`

          }
        }
        await axios(options)

        assert.fail('Invalid code path.')
      } catch (error) {
        assert.equal(error.response.status, 422)
        assert.isString(error.response.data)
      }
    })
    it('should delete box', async () => {
      try {
        const options = {
          method: 'DELETE',
          url: `${LOCALHOST}/box/${testData.box._id}`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.user.token}`
          }
        }
        const result = await axios(options)

        assert(result.status === 200)
        assert.isTrue(result.data)
      } catch (error) {
        assert.fail('Unexpected code path.')
      }
    })
  })
})
