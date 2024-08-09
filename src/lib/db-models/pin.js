import mongoose from 'mongoose'

const Pin = new mongoose.Schema({
  cid: { type: String, unique: true },
  createdAt: { type: Number, required: true },
  name: { type: String },
  type: { type: String },
  size: { type: Number },
  host: { type: Array, default: [] },
  pinned: { type: Boolean, default: false }
  // expiredAt: { type: String, required: true }
})

export default mongoose.model('pin', Pin)
