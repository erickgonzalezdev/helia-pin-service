import mongoose from 'mongoose'

const Pin = new mongoose.Schema({
  cid: { type: String, unique: true },
  createdAt: { type: Number, required: true },
  name :{ type: String, unique: true },
  type : { type: String, unique: true },
  size : { type: Number, required: true },
  //expiredAt: { type: String, required: true }
})


export default mongoose.model('pin', Pin)
