import mongoose from 'mongoose'

const Pin = new mongoose.Schema({
  createdAt: { type: Number, required: true },
  name: { type: String },
  description: { type: String },
  pinOwner: { type: String, ref: 'box', required: true },
  file: { type: String, ref: 'files', required: true },
  metadata: { type: Object, default: {} }

})

export default mongoose.model('pin', Pin)
