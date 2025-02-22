/*
  Business logic for email.
*/
import nodemailer from 'nodemailer'

class NodemailerLib {
  constructor (config = {}) {
    this.config = config
    this.nodemailer = nodemailer
    this.wlogger = this.config.wlogger

    // Runtime vars
    this.transporter = null

    // Bind functions
    this.start = this.start.bind(this)
    this.sendEmail = this.sendEmail.bind(this)
  }

  async start () {
    try {
      this.wlogger.info('email data', this.config.emailServer, this.config.emailUser, this.config.emailPassword)
      this.transporter = this.nodemailer.createTransport({
        host: this.config.emailServer,
        port: 465,
        auth: {
          user: this.config.emailUser,
          pass: this.config.emailPassword
        }
      })

      this.wlogger.info('Email service transport started!')
      return true
    } catch (error) {
      this.wlogger.error(`Error in nodemailer/start() $ ${error.message}`)
      throw error
    }
  }

  async sendEmail (obj = {}) {
    try {
      const { to, subject, html } = obj
      if (!to || !Array.isArray(to)) throw new Error('<to> property must be an array of email addresses!')
      if (!subject || typeof subject !== 'string') throw new Error('<subject> property must be a string.')
      if (!html || typeof html !== 'string') throw new Error('<html> property must be a string.')

      const sendObj = {
        from: this.config.emailUser,
        to,
        subject,
        html
      }

      const info = await this.transporter.sendMail(sendObj)
      console.log('Message sent: %s', info.messageId)
      return info
    } catch (error) {
      this.wlogger.error(`Error in nodemailer/sendEmail() $ ${error.message}`)
      throw error
    }
  }
}
export default NodemailerLib
