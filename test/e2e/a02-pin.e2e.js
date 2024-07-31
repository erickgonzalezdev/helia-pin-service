import sinon from 'sinon'
import { assert } from 'chai'
import axios from 'axios'
import config from '../../config.js'
import { cleanDb , startApp } from '../util/test-util.js'
import FormData from 'form-data'

const testData = {}
const LOCALHOST = `http://localhost:${config.port}`

let app
describe('e2e-pin', () => {
  let sandbox
  before(async () => {
    app = await startApp()
    cleanDb()
  })
  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })
  afterEach(() => {
    sandbox.restore()
  })

  describe('POST /pin', () => {
    it('should handle request error', async () => {
      try {
        // Create a form and append the file to it.
        const form = new FormData()
        const axiosConfig = {
          headers: form.getHeaders()
        }


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

        form.append('file', Buffer.from('Unit under test'), 'test.txt')

        // Send the file to the ipfs-file-stage server.
        const result = await axios.post(`${LOCALHOST}/pin`, form, axiosConfig)


        assert(result.status === 200)
      } catch (error) {
        throw error
      }
    })
  })

  describe('GET /pin', () => {
    it('should handle request error', async () => {
      try {
        sandbox.stub(app.controller.useCases.pin, 'getPins').throws(new Error('test error'))

        const options = {
          method: 'GET',
          url: `${LOCALHOST}/pin`,
          headers: {
            Accept: 'application/json',
            //Authorization: `Bearer ${testData.token}`
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
            //Authorization: `Bearer ${testData.token}`
          }
        }
        const result = await axios(options)


        assert(result.status === 200)
      } catch (error) {
        throw error
      }
    })
  })
})
