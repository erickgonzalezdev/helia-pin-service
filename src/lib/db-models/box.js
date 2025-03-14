import mongoose from 'mongoose'

// Box model scheme
const BoxSchema = new mongoose.Schema({
  createdAt: { type: Number, required: true },
  label: { type: String, required: true },
  desription: { type: String },
  owner: { type: String, ref: 'user' },
  type: { type: String },
  parent: { type: String }
})

const Box = mongoose.model('box', BoxSchema)

// Box Sgiantures model scheme
const BoxSignatureScheme = new mongoose.Schema({
  createdAt: { type: Number, required: true },
  label: { type: String, required: true },
  desription: { type: String },
  signatureOwner: { type: String, ref: 'box', required: true },
  jwt: { type: String, required: true },
  signature: { type: String, required: true }
})

const BoxSignature = mongoose.model('boxSignature', BoxSignatureScheme)

const importedBoxSignatureScheme = new mongoose.Schema({
  createdAt: { type: Number, required: true },
  signatureId: { type: String, ref: 'boxSignature', required: true },
  owner: { type: String, required: true, ref: 'user' }
})

const ImportedBoxSignature = mongoose.model('importedSignature', importedBoxSignatureScheme)

export default { Box, BoxSignature, ImportedBoxSignature }
