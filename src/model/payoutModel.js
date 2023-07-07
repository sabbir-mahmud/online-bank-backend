import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: { type: Number, required: true, trim: true },
  wallet: { type: Number, required: true, trim: true },
  txnId: { type: String, required: true, trim: true },
  accountNo: { type: String, required: true, trim: true },
  ifscCode: { type: String, required: true, trim: true },
  balance: { type: String, required: true, trim: true },
  remark: { type: String, required: true, trim: true },
  debit: { type: String, required: true, trim: true },
  mobile: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  number: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  payId: { type: String, required: true, trim: true },
  refNo: { type: String, required: true, trim: true },
  charge: { type: String, required: true, trim: true },
  txnType: { type: String, required: true, trim: true },
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

const PayOutModel = mongoose.model('payOut', userSchema)

export default PayOutModel
