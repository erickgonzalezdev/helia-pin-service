import axios from 'axios'

class PaymentGateway {
  constructor (config = {}) {
    this.config = config
    this.url = config.paymentUrl
    this.axios = axios
    this.wlogger = config.wlogger

    if (!this.url) throw new Error('Payment URL must be provided!')
    if (!this.config.paymentUser) throw new Error('Payment User must be provided!')
    if (!this.config.paymentPass) throw new Error('Payment Password must be provided!')

    // Declare on runtime
    this.jwt = null

    // Bind functions
    this.auth = this.auth.bind(this)
    this.createWallet = this.createWallet.bind(this)
    this.createPayment = this.createPayment.bind(this)
    this.validatePayment = this.validatePayment.bind(this)
    this.cancelPayment = this.cancelPayment.bind(this)
    this.getPaymentsByWallet = this.getPaymentsByWallet.bind(this)
    this.getWalletById = this.getWalletById.bind(this)
  }

  async auth () {
    try {
      const options = {
        method: 'POST',
        url: `${this.url}/users/auth`,
        data: {
          username: this.config.paymentUser,
          password: this.config.paymentPass
        }
      }

      const result = await this.axios.request(options)
      this.wlogger.info('Payment Gateway auth successfully!')
      this.jwt = result.data.token
      return result.data
    } catch (error) {
      this.wlogger.error(`Error in payment/auth() $ ${error.message}`)
      return false
    }
  }

  async createWallet ({ label, description } = {}) {
    try {
      if (!this.jwt) await this.auth()
      const options = {
        method: 'POST',
        url: `${this.url}/wallets`,
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${this.jwt}`
        },
        data: {
          label,
          description
        }
      }
      const result = await this.axios.request(options)
      return result.data.wallet
    } catch (error) {
      this.wlogger.error(`Error in payment/createWallet() $ ${error.message}`)
      throw error
    }
  }

  async createPayment (inObj = {}) {
    try {
      if (!this.jwt) await this.auth()
      const { walletId, amountUSD, chain, metadata } = inObj

      const options = {
        method: 'POST',
        url: `${this.url}/payments`,
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${this.jwt}`
        },
        data: {
          walletId,
          amountUSD,
          chain,
          metadata
        }
      }
      const result = await this.axios.request(options)
      return result.data.payment
    } catch (error) {
      this.wlogger.error(`Error in payment/createPayment() $ ${error.message}`)
      throw error
    }
  }

  async validatePayment (inObj = {}) {
    try {
      if (!this.jwt) await this.auth()
      const { paymentId } = inObj

      const options = {
        method: 'POST',
        url: `${this.url}/payments/validate`,
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${this.jwt}`
        },
        data: { paymentId }
      }
      const result = await this.axios.request(options)
      return result.data.payment
    } catch (error) {
      this.wlogger.error(`Error in payment/createPayment() $ ${error.message}`)
      throw error
    }
  }

  async cancelPayment (inObj = {}) {
    try {
      if (!this.jwt) await this.auth()
      const { paymentId } = inObj

      const options = {
        method: 'delete',
        url: `${this.url}/payments/cancel/${paymentId}`,
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${this.jwt}`
        }
      }
      const result = await this.axios.request(options)
      return result.data.success
    } catch (error) {
      this.wlogger.error(`Error in payment/cancelPayment() $ ${error.message}`)
      throw error
    }
  }

  async getPaymentsByWallet (inObj = {}) {
    try {
      if (!this.jwt) await this.auth()
      const { walletId } = inObj

      const options = {
        method: 'get',
        url: `${this.url}/payments/wallet/${walletId}`,
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${this.jwt}`
        }
      }
      const result = await this.axios.request(options)
      return result.data
    } catch (error) {
      this.wlogger.error(`Error in payment/getPaymentsByWallet() $ ${error.message}`)
      throw error
    }
  }

  async getWalletById (inObj = {}) {
    try {
      if (!this.jwt) await this.auth()
      const { walletId } = inObj
      if (!walletId) throw new Error('wallet id is required!')
      const options = {
        method: 'get',
        url: `${this.url}/wallets/${walletId}`,
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${this.jwt}`
        }
      }
      const result = await this.axios.request(options)
      return result.data
    } catch (error) {
      this.wlogger.error(`Error in payment/getPaymentsByWallet() $ ${error.message}`)
      throw error
    }
  }
}

export default PaymentGateway
