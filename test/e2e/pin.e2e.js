import sinon from 'sinon'
import { assert } from 'chai'
import axios from 'axios'
import config from '../../config.js'
import { cleanDb, cleanNode, startApp, createTestUser, createTestBoxModel, createTestFileModel } from '../util/test-util.js'

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
    testData.user2 = await createTestUser({ username: 'testuser2', password: 'pass' })
    testData.box = await createTestBoxModel({ label: 'test', description: 'test', user: testData.user })
    testData.file = await createTestFileModel()
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
          method: 'POST',
          url: `${LOCALHOST}/pin`,
          headers: {
            Accept: 'application/json'
          },
          data: {
            boxId: testData.box._id,
            fileId: testData.file._id
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
          url: `${LOCALHOST}/pin`,
          headers: {
            Accept: 'application/json',
            Authorization: '1'
          },
          data: {
            boxId: testData.box._id,
            fileId: testData.file._id
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
          url: `${LOCALHOST}/pin`,
          headers: {
            Accept: 'application/json',
            Authorization: `Unknow ${token}`
          },
          data: {
            boxId: testData.box._id,
            fileId: testData.file._id
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
          url: `${LOCALHOST}/pin`,
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer 1'
          },
          data: {
            boxId: testData.box._id,
            fileId: testData.file._id
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
          url: `${LOCALHOST}/pin`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.user.token}`
          },
          data: {
          }
        }
        await axios(options)

        assert.fail('Invalid code path.')
      } catch (error) {
        assert.equal(error.response.status, 422)
        assert.isString(error.response.data)
      }
    })
    it('should add pin to box  by owner', async () => {
      try {
        sandbox.stub(app.controller.useCases.box.db.Files, 'findById').resolves({ _id: 'smoke pin', size: 0, save: () => {} })

        const options = {
          method: 'POST',
          url: `${LOCALHOST}/pin`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.user.token}`
          },
          data: {
            boxId: testData.box._id,
            fileId: testData.file._id
          }
        }
        const result = await axios(options)
        assert(result.status === 200)
        assert.isObject(result.data)
      } catch (error) {
        assert.fail('Unexpected code path.')
      }
    })
    it('should add pin to box  by key', async () => {
      try {
        // sandbox.stub(app.controller.useCases.Box.db.Files, 'findById').resolves({ _id: 'smoke pin' })

        const boxSignature = testData.box.signatures[0].key
        const options = {
          method: 'POST',
          url: `${LOCALHOST}/pin`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${boxSignature}`
          },
          data: {
            fileId: testData.file._id
          }
        }
        const result = await axios(options)
        assert(result.status === 200)
        assert.isObject(result.data)
      } catch (error) {
        assert.fail('Unexpected code path.')
      }
    })
    it('should add pin to box with full input', async () => {
      try {
        // sandbox.stub(app.controller.useCases.Box.db.Files, 'findById').resolves({ _id: 'smoke pin' })

        const options = {
          method: 'POST',
          url: `${LOCALHOST}/pin`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.user.token}`
          },
          data: {
            boxId: testData.box._id,
            fileId: testData.file._id,
            name: 'test name',
            description: 'test description'
          }
        }
        const result = await axios(options)
        testData.pin = result.data
        assert(result.status === 200)
        assert.isObject(result.data)
      } catch (error) {
        assert.fail('Unexpected code path.')
      }
    })
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

  describe('DELETE /pin/:id', () => {
    it('should reject if the authorization header is missing', async () => {
      try {
        const options = {
          method: 'DELETE',
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
    it('should reject if the authorization header is missing the scheme', async () => {
      try {
        const options = {
          method: 'DELETE',
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
          method: 'DELETE',
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
          method: 'DELETE',
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
    it('should reject if token is not pin owner', async () => {
      try {
        const options = {
          method: 'DELETE',
          url: `${LOCALHOST}/pin/${testData.pin._id}`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.user2.token}`
          }
        }
        await axios(options)

        assert.fail('Invalid code path.')
      } catch (err) {
        assert.equal(err.response.status, 422)
      }
    })

    it('should dele pin', async () => {
      try {
        const options = {
          method: 'DELETE',
          url: `${LOCALHOST}/pin/${testData.pin._id}`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${testData.user.token}`
          }
        }

        const result = await axios(options)

        assert(result.status === 200)
        assert.isBoolean(result.data)
      } catch (error) {
        assert.fail('Unexpected code path.')
      }
    })
  })
})
