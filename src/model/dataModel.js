import mongoose from 'mongoose'

const dataSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { type: String, required: true, trim: true },
  data: { type: Object, required: true, trim: true }
})

const Data = mongoose.model('UserData', dataSchema)

export default Data
