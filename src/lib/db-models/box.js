import mongoose from 'mongoose'

const Box = new mongoose.Schema({
  createdAt: { type: Number, required: true },
  pinList: { type: Array, default: [] },
  label: { type: String, required: true },
  desription: { type: String },
  owner: { type: String, ref: 'user' },
  type: { type: String },
  parent: { type: String },
  signatures: { type: Array, default: [] }
})

export default mongoose.model('box', Box)
