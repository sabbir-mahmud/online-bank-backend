import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: { type: Number, required: true, trim: true },
  wallet: { type: Number, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  txnId: { type: String, required: true, trim: true },
  payId: { type: String, required: true, trim: true },
  refNo: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  remark: { type: String, required: true, trim: true },
  vpa: { type: String, required: true, trim: true },
  mid: { type: String, required: true, trim: true },
  balance: { type: String, required: true, trim: true },
  txnType: { type: String, required: true, trim: true },
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

const PayInModal = mongoose.model('payIn', userSchema)

export default PayInModal
