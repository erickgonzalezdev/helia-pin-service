import mongoose from 'mongoose'

const BoxSchema = new mongoose.Schema({
  createdAt: { type: Number, required: true },
  label: { type: String, required: true },
  desription: { type: String },
  owner: { type: String, ref: 'user' },
  type: { type: String },
  parent: { type: String },
  signatures: { type: Array, default: [] }
})

const Box = mongoose.model('box', BoxSchema)
export default { Box }
