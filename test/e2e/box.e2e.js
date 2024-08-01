import sinon from 'sinon'
import { assert } from 'chai'
import axios from 'axios'
import config from '../../config.js'
import { cleanDb, cleanNode , startApp } from '../util/test-util.js'

const testData = {}
const LOCALHOST = `http://localhost:${config.port}`

let app // global var

describe('e2e-box', () => {
  let sandbox
  before(async () => {

    app = await  startApp()
    await cleanDb()
    await cleanNode()
  })
  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })
  afterEach(() => {
    sandbox.restore()
  })

  describe('POST /box', () => {
    it('should handle request error', async () => {
      try {
        const options = {
          method: 'post',
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
          data: {
            label: 'test box',
            description: 'this a test box model'
          }
        }
        const result = await axios(options)

        testData.box = result.data.box

        assert(result.status === 200)
      } catch (error) {
        throw error
      }
    })
  })

  describe('GET /box/', () => {
    it('should handle request error', async () => {
      try {
        sandbox.stub(app.controller.useCases.Box, 'getBoxes').throws(new Error('test error'))

        const options = {
          method: 'GET',
          url: `${LOCALHOST}/box`,
          headers: {
            Accept: 'application/json',
            //Authorization: `Bearer ${testData.token}`
          }
        }
         await axios(options)

        assert.fail('Unexpected code path.')
      } catch (error) {
        assert(error.response.status === 422)
        assert.isString(error.response.data)
      }
    })
/*     it('should not fetch users if the authorization header is missing', async () => {
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
    */
    it('should get all boxes', async () => {
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/box`,
          headers: {
            Accept: 'application/json',
            //Authorization: `Bearer ${testData.token}`
          }
        }
        const result = await axios(options)
        assert(result.status === 200)
        assert.isArray(result.data)
      } catch (error) {
        throw error
      }
    })
  })

  describe('GET /box/:id', () => {
    it('should handle request error', async () => {
      try {
        sandbox.stub(app.controller.useCases.Box, 'getBox').throws(new Error('test error'))

        const options = {
          method: 'GET',
          url: `${LOCALHOST}/box/${testData.box._id}`,
          headers: {
            Accept: 'application/json',
            //Authorization: `Bearer ${testData.token}`
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
/*     it('should not fetch users if the authorization header is missing', async () => {
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
    }) */
    it('should get box by id', async () => {
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/box/${testData.box._id}`,
          headers: {
            Accept: 'application/json',
           // Authorization: `Bearer ${testData.token}`
          }
        }

        const result = await axios(options)
        
        assert(result.status === 200)
        assert.isObject(result.data.box)

      } catch (error) {
        throw error
      }
    })
  })

  describe('PUT /box/:id', () => {
    it('should handle request error', async () => {
      try {
        sandbox.stub(app.controller.useCases.Box, 'updateBox').throws(new Error('test error'))

        const options = {
          method: 'PUT',
          url: `${LOCALHOST}/box/${testData.box._id}`,
          headers: {
            Accept: 'application/json',
            //Authorization: `Bearer ${testData.token}`

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
/*     it('should not fetch users if the authorization header is missing', async () => {
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
    }) */
    it('should update box', async () => {
      try {
        const options = {
          method: 'PUT',
          url: `${LOCALHOST}/box/${testData.box._id}`,
          headers: {
            Accept: 'application/json',
            //Authorization: `Bearer ${testData.token}`
          },
          data: {
            label: 'new box label'
          }
        }
        const result = await axios(options)

        assert(result.status === 200)
        assert.isObject(result.data)
      } catch (error) {
        throw error
      }
    })
  })


  describe('DELETE /box/:id', () => {
    it('should handle request error', async () => {
      try {
        sandbox.stub(app.controller.useCases.Box, 'deleteBox').throws(new Error('test error'))

        const options = {
          method: 'DELETE',
          url: `${LOCALHOST}/box/${testData.box._id}`,
          headers: {
            Accept: 'application/json',
            //Authorization: `Bearer ${testData.token}`

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
            //Authorization: `Bearer ${testData.token}`
          }
        }
        const result = await axios(options)

        assert(result.status === 200)
        assert.isTrue(result.data)
      } catch (error) {
        throw error
      }
    })
  })
})
