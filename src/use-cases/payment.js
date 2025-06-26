import axios from 'axios'

class PaymentUseCases {
  constructor (config = {}) {
    this.config = config
    this.url = config.paymentUrl
    this.axios = axios
    this.db = config.libraries.dbModels
    this.paymentLib = this.config.libraries.payment
    this.wlogger = config.libraries.wlogger
    this.accountsUseCases = this.config.accountsUseCases

    // Bind functions

    this.createPayment = this.createPayment.bind(this)
    this.validatePayment = this.validatePayment.bind(this)
    this.cancelPayment = this.cancelPayment.bind(this)
    this.getUserPayments = this.getUserPayments.bind(this)
  }

  async createPayment (inObj = {}) {
    try {
      const { user, chain, accountType } = inObj
      if (!user) throw new Error('user model is required.')
      if (!chain || typeof chain !== 'string') throw new Error('chain is required.')
      if (!accountType) throw new Error('accountType is required.')

      let hasWallet
      console.log(user)
      try {
        hasWallet = await this.paymentLib.getWalletById({ walletId: user.paymentWalletId })
      } catch (error) {
        hasWallet = false
      }

      console.log('hasWallet', hasWallet)
      if (!hasWallet) {
        const wallet = await this.paymentLib.createWallet({ name: user._id, description: 'pinbox user wallet' })
        console.log('adding wallet ot user', wallet._id)
        user.paymentWalletId = wallet._id

        await user.save()
        console.log('saving wallet user ', user)
      }

      const accData = await this.accountsUseCases.accountLib.getTypeData(accountType)

      const paymentObj = {
        amountUSD: accData.priceUSD,
        chain,
        walletId: user.paymentWalletId,
        metadata: {
          accountType
        }
      }
      console.log('paymentObj', paymentObj)
      const payment = await this.paymentLib.createPayment(paymentObj)
      console.log('payment created!', payment)

      return payment
    } catch (error) {
      this.wlogger.error(`Error in payment/createPayment() $ ${error.message}`)
      throw error
    }
  }

  async validatePayment (inObj = {}) {
    try {
      const { paymentId, user } = inObj
      if (!user) throw new Error('user model is required.')
      if (!paymentId || typeof paymentId !== 'string') throw new Error('paymentId is required.')

      const payment = await this.paymentLib.validatePayment({ paymentId })

      const { metadata, _id } = payment

      const account = await this.accountsUseCases.createAccount({
        userId: user._id,
        type: metadata.accountType,
        paymentId: _id
      })

      return {
        payment,
        account
      }
    } catch (error) {
      this.wlogger.error(`Error in payment/validatePayment() $ ${error.message}`)
      throw error
    }
  }

  async cancelPayment (inObj = {}) {
    try {
      const { id } = inObj
      const success = await this.paymentLib.cancelPayment({ paymentId: id })

      return {
        success
      }
    } catch (error) {
      this.wlogger.error(`Error in payment/cancelPayment() $ ${error.message}`)
      throw error
    }
  }

  async getUserPayments (user) {
    try {
      if (!user) throw new Error('user model is required.')
      console.log('user', user)
      const walletId = user.paymentWalletId
      if (!walletId) return []
      const payments = await this.paymentLib.getPaymentsByWallet({ walletId })
      return payments
    } catch (error) {
      this.wlogger.error(`Error in payment/getPaymentsByUser() $ ${error.message}`)
      throw error
    }
  }
}

export default PaymentUseCases
