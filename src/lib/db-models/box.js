import mongoose from 'mongoose'

const Box = new mongoose.Schema({
  createdAt: { type: Number, required: true },
  cidList: { type: Array  , default : [] },
  label :{ type: String  , required : true },
  desription : { type: String },
  // owner : { type: String },
  type : { type : String },
  parent : { type : String },
})


export default mongoose.model('box', Box)