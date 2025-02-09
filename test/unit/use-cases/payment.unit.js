import { assert } from 'chai'
import sinon from 'sinon'

import UseCase from '../../../src/use-cases/payment.js'
import Libraries from '../../../src/lib/index.js'
import AccountUseCases from '../../../src/use-cases/account.js'
import { cleanDb, startDb, createTestUser } from '../../util/test-util.js'
import config from '../../../config.js'

describe('#payment-use-case', () => {
  let uut
  let sandbox
  const testData = {}
  before(async () => {
    await startDb()
    await cleanDb()

    const libraries = new Libraries(config)
    const accountsUseCases = new AccountUseCases({ libraries })
    uut = new UseCase({ libraries, accountsUseCases })

    testData.user = await createTestUser()
    testData.user.save = () => { }
    uut.paymentLib.jwt = 'jwt'
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

  describe('#createPayment', () => {
    it('should throw an error if no input is given', async () => {
      try {
        await uut.createPayment()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'user model is required')
      }
    })
    it('should throw an error if user input is missing', async () => {
      try {
        await uut.createPayment({})

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'user model is required')
      }
    })
    it('should throw an error if chain input is missing', async () => {
      try {
        await uut.createPayment({ user: {} })

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'chain is required')
      }
    })
    it('should throw an error if accountType input is missing', async () => {
      try {
        await uut.createPayment({ user: {}, chain: 'crypto chain' })

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'accountType is required')
      }
    })
    it('should handle request error', async () => {
      try {
        sandbox.stub(uut.paymentLib, 'createWallet').throws(new Error('test error'))
        await uut.createPayment({ user: {}, chain: 'crypto chain', accountType: 1 })
      } catch (error) {
        assert.include(error.message, 'test error')
      }
    })
    it('should create payment and handle user without asigned wallet', async () => {
      try {
        sandbox.stub(uut.paymentLib, 'createWallet').resolves({ _id: 'payment gateway wallet id' })
        sandbox.stub(uut.paymentLib, 'createPayment').resolves({})

        const payment = await uut.createPayment({ user: testData.user, chain: 'crypto chain', accountType: 1 })

        assert.isObject(payment)
      } catch (error) {
        assert.fail('Unexpected code path')
      }
    })
    it('should create payment and handle user with existing wallet', async () => {
      try {
        sandbox.stub(uut.paymentLib, 'createPayment').resolves({})

        const payment = await uut.createPayment({ user: testData.user, chain: 'crypto chain', accountType: 1 })

        assert.isObject(payment)
      } catch (error) {
        assert.fail('Unexpected code path')
      }
    })
  })
  describe('#validatePayment', () => {
    it('should throw an error if no input is given', async () => {
      try {
        await uut.validatePayment()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'user model is required')
      }
    })
    it('should throw an error if user input is missing', async () => {
      try {
        await uut.validatePayment({})

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'user model is required')
      }
    })
    it('should throw an error if paymentId input is missing', async () => {
      try {
        await uut.validatePayment({ user: {} })

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'paymentId is required')
      }
    })
    it('should validatePayment', async () => {
      try {
        sandbox.stub(uut.paymentLib, 'validatePayment').resolves({ metadata: { accountType: 1 } })
        const result = await uut.validatePayment({ user: testData.user, paymentId: 'paymentId' })

        assert.property(result, 'payment')
        assert.property(result, 'account')
      } catch (error) {
        assert.fail('Unexpected code path')
      }
    })
  })
  describe('#cancelPayment', () => {
    it('should handle paymentLib error', async () => {
      try {
        sandbox.stub(uut.paymentLib, 'cancelPayment').throws(new Error('test error'))

        await uut.cancelPayment()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'test error')
      }
    })
    it('should cancel payment', async () => {
      sandbox.stub(uut.paymentLib, 'cancelPayment').resolves({ success: true })

      const result = await uut.cancelPayment({ id: 'test id' })
      assert.property(result, 'success')
    })
  })
  describe('#getUserPayments', () => {
    it('should throw an error if user input is missing', async () => {
      try {
        await uut.getUserPayments()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'user model is required')
      }
    })
    it('should return empty array if user does not have a asigned wallet', async () => {
      try {
        const result = await uut.getUserPayments({})
        assert.isArray(result)
      } catch (error) {
        assert.fail('Unexpected code path')
      }
    })
    it('should return payment list', async () => {
      try {
        const spy = sandbox.stub(uut.paymentLib, 'getPaymentsByWallet').resolves([])
        const result = await uut.getUserPayments(testData.user)
        assert.isArray(result)
        assert.isTrue(spy.calledOnce)
      } catch (error) {
        assert.fail('Unexpected code path')
      }
    })
  })
})
