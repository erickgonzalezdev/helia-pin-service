import { assert } from 'chai'
import sinon from 'sinon'

import LibUnderTest from '../../../src/lib/nodemailer.js'

describe('#passport.js', () => {
  let uut
  let sandbox
  // const testData = {}

  before(async () => {
    uut = new LibUnderTest({ wlogger: { error: () => { }, info: () => { } } })
  })

  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })

  afterEach(() => {
    sandbox.restore()
  })

  after(async () => {
  })
  describe('#start', () => {
    it('should start transport', async () => {
      try {
        const res = await uut.start()
        assert.isTrue(res)
      } catch (error) {
        assert.fail('Unexpected code path')
      }
    })

    it('should handle error', async () => {
      try {
        sandbox.stub(uut.nodemailer, 'createTransport').callsFake(() => { throw new Error('test error') })
        await uut.start()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'test error')
      }
    })
  })
  describe('#sendMail', () => {
    it('should throw an error if input is missing', async () => {
      try {
        await uut.sendEmail()
        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, '<to> property must be an array of email addresses!')
      }
    })
    it('should throw an error if <to> property  is missing', async () => {
      try {
        const input = {}
        await uut.sendEmail(input)
        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, '<to> property must be an array of email addresses!')
      }
    })
    it('should throw an error if <to> property  is not an array', async () => {
      try {
        const input = { to: 'email@email.com' }
        await uut.sendEmail(input)
        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, '<to> property must be an array of email addresses!')
      }
    })
    it('should throw an error if <subject> property  is missing', async () => {
      try {
        const input = { to: ['email@email.com'] }
        await uut.sendEmail(input)
        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, '<subject> property must be a string.')
      }
    })
    it('should throw an error if <html> property  is missing', async () => {
      try {
        const input = { to: ['email@email.com'], subject: 'test email' }
        await uut.sendEmail(input)
        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, '<html> property must be a string.')
      }
    })

    it('should send email', async () => {
      try {
        sandbox.stub(uut.transporter, 'sendMail').callsFake(() => { return {} })

        const input = { to: ['email@email.com'], subject: 'test email', html: 'html body' }
        const result = await uut.sendEmail(input)
        assert.isObject(result)
      } catch (error) {
        console.log(error)
        assert.fail('Unexpected code path')
      }
    })
  })
})
