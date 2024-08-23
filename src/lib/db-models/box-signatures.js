import mongoose from 'mongoose'

const BoxSignature = new mongoose.Schema({
  createdAt: { type: Number, required: true },
  label: { type: String, required: true },
  desription: { type: String },
  boxOwner: { type: String, ref: 'box', required: true },
  signature: { type: String, required: true },
  shortSignature: { type: String, required: true }
})

export default mongoose.model('boxSignature', BoxSignature)
