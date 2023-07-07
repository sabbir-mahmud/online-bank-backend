import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: { type: Number, required: true, trim: true },
  wallet: { type: Number, required: true, trim: true },
  // prefix: { type: String, required: true, trim: true },
  // pn: { type: String, required: true, trim: true },
  // mc: { type: String, required: true, trim: true },
  // cu: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  txnId: { type: String, required: true, trim: true },
  payId: { type: String, required: true, trim: true },
  refNo: { type: String, required: true, trim: true },
  balance: { type: String, required: true, trim: true },
  credit: { type: String, required: true, trim: true },
  charge: { type: Number, required: true, trim: true },
  status: {
    type: String,
    default: 'INITIATED',
    enum: ['SUCCESS', 'FAILED', 'INITIATED', 'PENDING']
  },
  created_at: {
    type: Date,
    required: true,
    default: Date.now
  },
  updated_at: {
    type: Date,
    required: true,
    default: Date.now
  }
})

const PayIn = mongoose.model('payinData', userSchema)

export default PayIn
