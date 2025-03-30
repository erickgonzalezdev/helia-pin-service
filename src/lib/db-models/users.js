import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import config from '../../../config.js'

const AccountSchema = new mongoose.Schema({
  createdAt: { type: Number, required: true },
  type: { type: Number, default: 1 }, // Account Storage type by default
  typeLabel: { type: String }, // Account Storage type label
  maxBytes: { type: Number, default: 10 ** 6 * 50000 }, // Max 500 MB in total by default
  maxFileBytes: { type: Number, default: 10 ** 6 * 50 }, // Max 50 MB per file by default.
  maxBoxes: { type: Number, default: 5 }, // Max 5 Boxes by default
  maxPins: { type: Number, default: 100 }, // Max 100 pins by default
  description: { type: String },
  owner: { type: String, ref: 'user' },
  currentBytes: { type: Number, default: 0 },
  currentPins: { type: Number, default: 0 },
  currentBox: { type: Number, default: 0 },
  expiredAt: { type: Number, default: null },
  archived: { type: Boolean, default: false },
  expired: { type: Boolean, default: false }
})

const AccountData = mongoose.model('account', AccountSchema)

const UserShema = new mongoose.Schema({
  createdAt: { type: Number, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (email) {
        // eslint-disable-next-line no-useless-escape
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
      },
      message: props => `${props.value} is not a valid Email format!`
    }
  },
  username: { type: String },
  password: { type: String, required: true },
  account: { type: String, ref: 'account' },
  telegramVerified: { type: Boolean, default: false },
  telegramChatId: { type: Number },
  emailVerified: { type: Boolean, default: false },
  emailVerificationCode: { type: Object },
  emailSentAt: { type: String },
  paymentWalletId: { type: String, default: '' },
  resetPasswordTokenSentAt: { type: Number, default: null },
  resetPasswordTokenUsed: { type: Boolean, default: false }
})

// Before saving, convert the password to a hash.
UserShema.pre('save', async function preSave (next) {
  const user = this

  if (!user.isModified('password')) {
    return next()
  }

  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(user.password, salt)

  user.password = hash

  next(null)
})

// Validate the password by comparing to the saved hash.
UserShema.methods.validatePassword = async function validatePassword (password) {
  const user = this

  const isMatch = await bcrypt.compare(password, user.password)

  return isMatch
}

// Generate a JWT token.
UserShema.methods.generateToken = function generateToken () {
  const user = this
  const token = jwt.sign({ id: user.id, type: 'userAccess' }, config.passKey)

  return token
}

UserShema.methods.generatePasswordResetToken = function generatePasswordResetToken () {
  const user = this
  const expiredAt = new Date()
  expiredAt.setMinutes(expiredAt.getMinutes() + 10)
  const token = jwt.sign({ id: user.id, type: 'passwordReset', expiredAt }, config.passKey)
  return token
}

const User = mongoose.model('user', UserShema)
export default { User, AccountData }
