import sinon from 'sinon'
import { assert } from 'chai'
import axios from 'axios'
import config from '../../config.js'
import { cleanDb } from '../util/test-util.js'
import FormData from 'form-data'

const testData = {}
const LOCALHOST = `http://localhost:${config.port}`

describe('e2e-pin', () => {
  let sandbox
  before(async () => {

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
})
