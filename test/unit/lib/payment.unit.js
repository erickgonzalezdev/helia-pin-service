import { assert } from 'chai'
import sinon from 'sinon'

import LibUnderTest from '../../../src/lib/payment.js'

describe('#payment.js', () => {
  let uut
  let sandbox
  // const testData = {}

  before(async () => {
    const wlogger = { error: () => { }, info: () => { } }
    uut = new LibUnderTest({ wlogger, paymentUrl: 'testingUrl', paymentUser: 'test', paymentPass: 'test' })
  })

  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })

  afterEach(() => {
    sandbox.restore()
  })

  after(async () => {
  })
  describe('#constructor', () => {
    it('should throw an error if paymentUrl is not provided', async () => {
      try {
        const _uut = new LibUnderTest()
        console.log(_uut) // Eslint
        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'Payment URL must be provided!')
      }
    })
    it('should throw an error if paymentUser is not provided', async () => {
      try {
        const _uut = new LibUnderTest({ paymentUrl: 'url' })
        console.log(_uut) // Eslint
        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'Payment User must be provided!')
      }
    })
    it('should throw an error if paymentPass is not provided', async () => {
      try {
        const _uut = new LibUnderTest({ paymentUrl: 'url', paymentUser: 'user' })
        console.log(_uut) // Eslint
        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'Payment Password must be provided!')
      }
    })
  })
  describe('#auth', () => {
    it('should return false on axios error', async () => {
      sandbox.stub(uut.axios, 'request').throws(new Error('test error'))
      const res = await uut.auth()
      assert.isFalse(res)
    })

    it('should auth to payment server', async () => {
      sandbox.stub(uut.axios, 'request').resolves({ data: { token: 'jwt' } })

      const result = await uut.auth()

      assert.isObject(result)
    })
  })

  describe('#createWallet', () => {
    it('should handle axios error', async () => {
      try {
        sandbox.stub(uut.axios, 'request').throws(new Error('test error'))
        await uut.createWallet()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'test error')
      }
    })

    it('should create wallet', async () => {
      sandbox.stub(uut.axios, 'request').resolves({ data: { wallet: {} } })

      const result = await uut.createWallet()

      assert.isObject(result)
    })
  })

  describe('#createPayment', () => {
    it('should handle axios error', async () => {
      try {
        sandbox.stub(uut.axios, 'request').throws(new Error('test error'))
        await uut.createPayment()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'test error')
      }
    })

    it('should auth to payment server', async () => {
      sandbox.stub(uut.axios, 'request').resolves({ data: { payment: {} } })

      const result = await uut.createPayment()

      assert.isObject(result)
    })
  })

  describe('#validatePayment', () => {
    it('should handle axios error', async () => {
      try {
        sandbox.stub(uut.axios, 'request').throws(new Error('test error'))
        await uut.validatePayment()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'test error')
      }
    })

    it('should auth to payment server', async () => {
      sandbox.stub(uut.axios, 'request').resolves({ data: { payment: {} } })

      const result = await uut.validatePayment()

      assert.isObject(result)
    })
  })
  describe('#cancelPayment', () => {
    it('should handle axios error', async () => {
      try {
        sandbox.stub(uut.axios, 'request').throws(new Error('test error'))
        await uut.cancelPayment()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'test error')
      }
    })

    it('should auth to payment server', async () => {
      sandbox.stub(uut.axios, 'request').resolves({ data: { success: true } })

      const result = await uut.cancelPayment()

      assert.isTrue(result)
    })
  })

  describe('#getPaymentsByWallet', () => {
    it('should handle axios error', async () => {
      try {
        sandbox.stub(uut.axios, 'request').throws(new Error('test error'))
        await uut.getPaymentsByWallet()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'test error')
      }
    })

    it('should get payments', async () => {
      sandbox.stub(uut.axios, 'request').resolves({ data: [] })

      const result = await uut.getPaymentsByWallet()

      assert.isArray(result)
    })
  })
  describe('#getWalletById', () => {
    it('should throw error if walletid is not provided', async () => {
      try {
        await uut.getWalletById()

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'wallet id is required!')
      }
    })
    it('should handle axios error', async () => {
      try {
        sandbox.stub(uut.axios, 'request').throws(new Error('test error'))
        await uut.getWalletById({ walletId: 'wallet id' })

        assert.fail('Unexpected code path')
      } catch (error) {
        assert.include(error.message, 'test error')
      }
    })

    it('should get wallet id', async () => {
      sandbox.stub(uut.axios, 'request').resolves({ data: {} })

      const result = await uut.getWalletById({ walletId: 'wallet id' })

      assert.exists(result)
    })
  })
})
