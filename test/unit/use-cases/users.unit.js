import { assert } from 'chai'
import sinon from 'sinon'

import UseCase from '../../../src/use-cases/users.js'
import Libraries from '../../../src/lib/index.js'
import { cleanDb, startDb } from '../../util/test-util.js'

describe('#users-use-case', () => {
  let uut
  let sandbox
  const testData = {}

  before(async () => {
    uut = new UseCase({ libraries: new Libraries() })
    await startDb()
    await cleanDb()
  })

  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })

  afterEach(() => {
    sandbox.restore()
  })

  after(async () => {
    await cleanDb()
  })
  describe('#createUser', () => {
    it('should throw an error if no input is given', async () => {
      try {
        await uut.createUser()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'username is required!')
      }
    })

    it('should throw an error if username is not provided', async () => {
      try {
        await uut.createUser({})

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'username is required!')
      }
    })

    it('should throw an error if password is not provided', async () => {
      try {
        const usrObj = {
          username: 'username'
        }

        await uut.createUser(usrObj)

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'password is required')
      }
    })

    it('should catch and throw DB errors', async () => {
      try {
        // Force an error with the database.
        sandbox.stub(uut.db, 'Users').throws(new Error('test error'))

        const usrObj = {
          password: 'anypass',
          username: 'test'
        }

        await uut.createUser(usrObj)

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'test error')
      }
    })

    it('should create an user', async () => {
      const usrObj = {
        password: 'anypass',
        username: 'test'
      }
      const user = await uut.createUser(usrObj)

      testData.user = user
    })
  })

  describe('#authUser', () => {
    it('should handle passport auth error', async () => {
      try {
        sandbox.stub(uut.passport, 'authUser').throws(new Error('Authentication error'))

        const koaContex = {}
        await uut.authUser(koaContex)

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'Authentication error')
      }
    })
  })

  describe('#getUsers', () => {
    it('should catch and throw an error', async () => {
      try {
        // Force an error.
        sandbox.stub(uut.db.Users, 'find').throws(new Error('test error'))

        await uut.getUsers()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'test error')
      }
    })
    it('should get all users', async () => {
      const res = await uut.getUsers()
      assert.isArray(res)
    })
  })

  describe('#getUser', () => {
    it('should throw error if input is missing', async () => {
      try {
        await uut.getUser()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'id is required')
      }
    })
    it('should catch and throw an error', async () => {
      try {
        // Force an error.
        sandbox.stub(uut.db.Users, 'findById').throws(new Error('test error'))

        await uut.getUser({ id: 'myUserId' })

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'test error')
      }
    })
    it('should get user', async () => {
      const res = await uut.getUser({ id: testData.user._id.toString() })
      testData.user = res
      assert.isObject(res)
    })
  })

  describe('#updateUser', () => {
    it('should throw an error if no input is given', async () => {
      try {
        await uut.updateUser()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'existingData is required')
      }
    })

    it('should throw an error if newData is not provided', async () => {
      try {
        const existingData = testData.user
        await uut.updateUser({ existingData })

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'newData data is required!')
      }
    })

    it('should update the existing user', async () => {
      const existingData = testData.user
      const newData = { username: 'test2' }

      const result = await uut.updateUser({ existingData, newData })

      assert.isObject(result)
      assert.property(result, 'username')
      assert.equal(result.username, newData.username)
    })
  })
})
