import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: { type: Number, required: true, trim: true },
  transactionId: { type: String, required: true, trim: true },
  accountNo: { type: String, required: true, trim: true },
  ifscCode: { type: String, required: true, trim: true },
  payeeName: { type: String, required: true, trim: true },
  remarks: { type: String, required: true, trim: true },
  status: {
    type: String,
    default: 'PENDING',
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

const PayOut = mongoose.model('payoutData', userSchema)

export default PayOut
