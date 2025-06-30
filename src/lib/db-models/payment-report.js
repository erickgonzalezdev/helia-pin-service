import mongoose from 'mongoose'

const PaymentReport = new mongoose.Schema({
  createdAt: { type: Number, required: true },
  description: { type: String },
  paymentId: { type: String, required: true, unique: true },
  type: { type: String },
  user: { type: String, ref: 'user', required: true }
})

export default mongoose.model('paymentReport', PaymentReport)
