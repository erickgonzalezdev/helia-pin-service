import mongoose from 'mongoose'

const Files = new mongoose.Schema({
  cid: { type: String, unique: true },
  createdAt: { type: Number, required: true }, // Created Date
  name: { type: String },
  type: { type: String },
  size: { type: Number },
  targetNode: { type: String, default: '' }, //  target node to pin
  host: { type: Array, default: [] }, // current nodes id holding this file.
  pinned: { type: Boolean, default: false }, // pin status
  pinCount: { type: Number, default: 0 }, // pin quantity
  pinnedAt: { type: Number }, // pin date
  archived: { type: Boolean, default: false },
  archivedDate: { type: Number }

  // expiredAt: { type: String, required: true }
})

export default mongoose.model('files', Files)
