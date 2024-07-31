import { assert } from 'chai'
import sinon from 'sinon'
import passport from 'koa-passport'

import User from '../../../src/lib/db-models/users.js'

import { verify, passportStrategy } from '../../../src/utils/passport.js'

describe('#passport-util', () => {
  let sandbox
  let id
  let done

  beforeEach(() => {
    sandbox = sinon.createSandbox()

    id = 'abc123'
    done = () => {}
  })

  afterEach(() => sandbox.restore())

  describe('#verify', () => {
    it('should return if user is found', () => {
      sandbox.stub(User, 'findOne').resolves({ id })

      verify(id, 'password', done)
    })

    it('should return if password is validated', () => {
      // Mock Users model.
      sandbox.stub(User, 'findOne').resolves(new User())

      verify(id, 'password', done)
    })

    it('should catch a high-level error', () => {
      // Force an error
      sandbox.stub(User, 'findOne').rejects(new Error('test error'))

      verify(id, 'password', done)
    })
  })

  describe('#passportStrategy', () => {
    it('should apply modifications to default passport behavior', () => {
      const result = passportStrategy(passport)

      assert.equal(result, true)
    })
  })

  describe('#serializeUser', () => {
    it('should serialize a user', () => {
      const user = {
        id: 'abc123'
      }
      const done = () => {}

      passportStrategy(passport)

      passport.serializeUser(user, done)
    })
  })

  describe('#deserializeUser', () => {
    it('should deserialize a user', () => {
      // Mock Users model.
      sandbox.stub(User, 'findById').resolves({ id })

      passportStrategy(passport)

      passport.deserializeUser(id, done)
    })

    it('should catch and handle errors', () => {
      // Force an error
      sandbox.stub(User, 'findById').rejects(new Error('test error'))

      passportStrategy(passport)

      passport.deserializeUser(id, done)
    })
  })
})
