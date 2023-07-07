import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  prefix: { type: String, required: true, trim: true },
  pn: { type: String, required: true, trim: true },
  mc: { type: String, required: true, trim: true },
  cu: { type: String, required: true, trim: true },
  CORPID: { type: String, required: true, trim: true },
  USERID: { type: String, required: true, trim: true },
  URN: { type: String, required: true, trim: true },
  DEBITACC: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  payInCharge: { type: Number, required: true, trim: true },
  payOutCharge: { type: Number, required: true, trim: true },
  NoPayIn: { type: Number, required: true, trim: true },
  NoPayOut: { type: Number, required: true, trim: true },
  AurAmtOfPayIn: { type: Number, required: true, trim: true },
  AurAmtOfPayOut: { type: Number, required: true, trim: true },
  IpAddress: { type: Array, required: true, trim: true },
  wallet: { type: Number, required: true, trim: true },
  payOutChargeType: {
    type: String,
    default: 'percentage',
    enum: ['flat', 'percentage'],
    required: true,
    trim: true
  },
  payInChargeType: {
    type: String,
    default: 'percentage',
    enum: ['flat', 'percentage'],
    required: true,
    trim: true
  },
  enabled: { type: Boolean, default: true },
  payInEnabled: { type: Boolean, default: true },
  payOutEnabled: { type: Boolean, default: true },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  role: {
    type: String,
    default: 'employee',
    enum: ['employee', 'partner']
  },
  payoutWallet: {
    type: Number,
    required: true,
    trim: true
  }
})

const UserModel = mongoose.model('user', userSchema)

export default UserModel
