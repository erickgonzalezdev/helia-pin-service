import mongoose from 'mongoose'

const Pin = new mongoose.Schema({
  cid: { type: String, unique: true },
  createdAt: { type: Number, required: true },
  name :{ type: String },
  type : { type: String},
  size : { type: Number },
  //expiredAt: { type: String, required: true }
})


export default mongoose.model('pin', Pin)
