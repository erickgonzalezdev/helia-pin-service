import sinon from 'sinon'
import { assert } from 'chai'
import axios from 'axios'
import config from '../../config.js'
import { cleanDb, cleanNode, startApp, createTestUser, createTestBoxModel, createTestFileModel } from '../util/test-util.js'

const LOCALHOST = `http://localhost:${config.port}`

let app // global var

describe('e2e-nodes', () => {
  let sandbox
  const testData = {}
  before(async () => {
    app = await startApp()
    await cleanDb()
    await cleanNode()
    testData.user = await createTestUser()
    testData.box = await createTestBoxModel({ label: 'test', description: 'test', user: testData.user })
    testData.file = await createTestFileModel()
  })
  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })
  afterEach(() => {
    sandbox.restore()
  })
  describe('POST /nodes/remote', () => {
    it('should get remote nodes', async () => {
      try {
        // sandbox.stub(app.controller.useCases.Box.db.Files, 'findById').resolves({ _id: 'smoke pin' })

        const options = {
          method: 'GET',
          url: `${LOCALHOST}/nodes/remote`,
          headers: {
            Accept: 'application/json'
          }
        }
        const result = await axios(options)
        assert(result.status === 200)
        assert.isArray(result.data)
      } catch (error) {
        assert.fail('Unexpected code path.')
      }
    })
    it('should handle request error', async () => {
      try {
        sandbox.stub(app.controller.useCases.nodes.heliaNode.rpc, 'getSubscriptionList').throws(new Error('test error'))

        const options = {
          method: 'GET',
          url: `${LOCALHOST}/nodes/remote`,
          headers: {
            Accept: 'application/json'
          }
        }
        await axios(options)

        assert.fail('Invalid code path.')
      } catch (error) {
        assert.equal(error.response.status, 422)
        assert.isString(error.response.data)
      }
    })
  })
})
