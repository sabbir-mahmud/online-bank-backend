import PayIn from '../model/Payin.js'
import PayInModal from '../model/payInModel.js'
import PayOutModel from '../model/payoutModel.js'
import axios from 'axios'
import UserModel from '../model/userModel.js'
const payIn = async (req, res) => {
  const {
    txnId,
    amount,
    payId,
    refNo,
    credit,
    description,
    remark,
    vpa,
    mid,
    txnType,
    status
  } = req.body
  try {
    const user = req.user_id
    if (
      !txnId ||
      !amount ||
      !payId ||
      !credit ||
      !refNo ||
      !description ||
      !remark ||
      !vpa ||
      !mid ||
      !txnType
    ) {
      return res.status(400).json({
        message: 'Please fill the all required fields'
      })
    }
    if (txnId.length < 12) {
      return res.status(400).json({
        message: 'Transaction ID should be 12 characters long'
      })
    }

    const existingPayOut = await PayInModal.findOne({ txnId })
    if (existingPayOut) {
      return res.status(400).json({
        message: 'Transaction ID already exists for this user'
      })
    }
    const now = new Date()
    const reqUser = await UserModel.findById(user)
    if (!reqUser.payInEnabled) {
      return res
        .status(403)
        .json({ message: 'You are disabled payin transition' })
    }
    const charge = reqUser.payInCharge
    const balance = amount - charge
    const wallet = reqUser.wallet + balance
    const name = reqUser.firstName + ' ' + reqUser.lastName
    const NoPayIn = reqUser.NoPayIn + 1
    const AurAmtOfPayIn = reqUser.AurAmtOfPayIn + balance
    const newPayIn = new PayInModal({
      user,
      wallet,
      txnId,
      amount,
      name,
      payId: txnId,
      refNo: txnId,
      description,
      remark,
      vpa: 'abc',
      mid: 'abc',
      balance,
      txnType,
      charge,
      credit: 0,
      status: status || 'INITIATED',
      created_at: now,
      updated_at: now
    })
    await newPayIn.save()
    await UserModel.findByIdAndUpdate(
      user,
      { $set: { wallet, NoPayIn, AurAmtOfPayIn } },
      { new: true }
    )
    res.status(201).json({
      newPayIn
    })
  } catch (err) {
    console.log(err)
  }
}
const payIns = async (req, res) => {
  const {
    txnId,
    amount
  } = req.body
  try {
    const user = req.user_id
    if (
      !txnId ||
      !amount
    ) {
      return res.status(400).json({
        message: 'Please fill the all required fields'
      })
    }
    if (txnId.length < 12) {
      return res.status(400).json({
        message: 'Transaction ID should be 12 characters long'
      })
    }

    const existingPayOut = await PayInModal.findOne({ txnId })
    if (existingPayOut) {
      return res.status(400).json({
        message: 'Transaction ID already exists for this user'
      })
    }
    const now = new Date()
    const reqUser = await UserModel.findById(user)
    if (!reqUser.payInEnabled) {
      return res
        .status(403)
        .json({ message: 'You are disabled payin transition' })
    }
    if (!reqUser.enabled) {
      return res
        .status(403)
        .json({ message: 'You are disabled' })
    }
    const charge = reqUser.payInCharge
    const balance = amount - charge
    const wallet = reqUser.wallet + balance
    const name = reqUser.firstName + ' ' + reqUser.lastName
    const NoPayIn = reqUser.NoPayIn + 1
    const AurAmtOfPayIn = reqUser.AurAmtOfPayIn + balance
    const prefix = reqUser.prefix
    const pn = reqUser.pn
    const mc = reqUser.mc
    const cu = reqUser.cu
    const newPayIn = new PayIn({
      user,
      wallet,
      txnId,
      amount,
      name,
      payId: txnId,
      refNo: txnId,
      vpa: 'abc',
      mid: 'abc',
      balance,
      charge,
      credit: 0,
      status: 'INITIATED',
      created_at: now,
      updated_at: now
    })
    await newPayIn.save()
    await UserModel.findByIdAndUpdate(
      user,
      { $set: { wallet, NoPayIn, AurAmtOfPayIn } },
      { new: true }
    )
    res.status(200).json({
      // upi://pay?pa=".$prefix.".TXN".$transactionId."@icici&pn=".$pn."&tr=".$prefix.".TXN".$transactionId."&am=".$amount."&cu=".$cu."&mc=".$mc
      qrString: `upi://pay?pa=${prefix}TXN${txnId}@icici&pn=${pn}&tr=${prefix}TXN${txnId}&am=${amount}&cu=${cu}&mc=${mc}`,
      status: 200
    })
  } catch (err) {
    console.log(err)
  }
}

const payOut = async (req, res) => {
  const {
    txnId,
    amount,
    debit,
    accountNo,
    payId,
    refNo,
    description,
    remark,
    txnType,
    status,
    number,
    mobile,
    name,
    ifscCode
  } = req.body
  try {
    const user = req.user_id
    if (txnId) {
      if (txnId?.length < 12) {
        return res.status(400).json({
          message: 'Transaction ID should be 12 characters long'
        })
      }
    }

    const reqUser = await UserModel.findById(user)
    const charge = reqUser.payOutCharge
    const balance = amount - charge
    if (!reqUser.payOutEnabled) {
      return res
        .status(403)
        .json({ message: 'You are disabled payout transition' })
    }
    if (reqUser.payoutWallet < balance - 1) {
      return res.status(401).json({
        message: 'Your wallet balance is not eligible for withdrawal'
      })
    }
    if (txnId) {
      const existingPayOut = await PayOutModel.findOne({ txnId })
      if (existingPayOut) {
        return res.status(400).json({
          message: 'Transaction ID already exists for this user'
        })
      }
    }
    const now = new Date()
    const NoPayOut = reqUser.NoPayOut + 1
    const payoutWallet = reqUser.payoutWallet - balance
    const AurAmtOfPayOut = reqUser.AurAmtOfPayOut + balance
    const userName = reqUser.firstName + ' ' + reqUser.lastName
    const newPayOut = new PayOutModel({
      user,
      ifscCode,
      name: name || userName,
      txnId: txnId || '...',
      amount,
      payoutWallet,
      payId: payId || '...',
      refNo: refNo || '...',
      description: description || '...',
      debit: debit || '...',
      remark: remark || '...',
      number: number || '...',
      mobile: mobile || '...',
      txnType: txnType || '...',
      charge,
      balance,
      accountNo,
      status: status || 'INITIATED',
      created_at: now,
      updated_at: now
    })

    await newPayOut.save()
    await UserModel.findByIdAndUpdate(
      user,
      { $set: { payoutWallet, NoPayOut, AurAmtOfPayOut } },
      { new: true }
    )
    res.status(201).json({
      newPayOut
    })
  } catch (err) {
    console.log(err)
  }
}
const getPayIn = async (req, res) => {
  const user = req.user_id
  const data = await PayInModal.find({ user })
  res.status(201).json({
    data
  })
}
const getPayOut = async (req, res) => {
  const user = req.user_id
  const data = await PayOutModel.find({ user })
  res.status(201).json({
    data
  })
}
const statement = async (req, res) => {
  const user = req.user_id
  const payInData = await PayOutModel.findOne({ user })
  const payOutData = await PayInModal.findOne({ user })
  res.status(201).json({
    payInData,
    payOutData
  })
}

const getAllRecode = async (req, res) => {
  const allPayInRecode = await PayOutModel.find({})
  const allPayOutRecode = await PayOutModel.find({})
  res.status(201).json({
    allPayInRecode,
    allPayOutRecode
  })
}
const getNoOfRecode = async (req, res) => {
  const allPayOutRecode = await PayOutModel.find({})
  const allPayInRecode = await PayInModal.find({})
  const { payInCount, totalPayInAmount } = allPayInRecode.reduce(
    (acc, payIn) => {
      acc.payInCount += 1
      acc.totalPayInAmount += payIn.amount
      return acc
    },
    { payInCount: 0, totalPayInAmount: 0 }
  )
  const { payOutCount, totalOutAmount } = allPayOutRecode.reduce(
    (acc, payout) => {
      acc.payOutCount += 1
      acc.totalOutAmount += payout.amount
      return acc
    },
    { payOutCount: 0, totalOutAmount: 0 }
  )

  res.status(201).json({
    payInCount,
    totalPayInAmount,
    payOutCount,
    totalOutAmount
  })
}
const getAllPayInRecode = async (req, res) => {
  const data = await PayInModal.find({})
  res.status(201).json({
    data
  })
}
const getAllPayOutRecode = async (req, res) => {
  const data = await PayOutModel.find({})
  res.status(201).json({
    data
  })
}
const payInStatusChange = async (req, res) => {
  const payInId = req.params.id
  const status = req.body.status
  try {
    const updatedPayIn = await PayInModal.findByIdAndUpdate(
      payInId,
      { status },
      { new: true }
    )
    if (!updatedPayIn) {
      return res.status(404).json({ message: 'Pay-Out transaction not found' })
    }
    res.status(200).json({
      message: 'Pay-out Transaction status updated successfully',
      payInTransaction: updatedPayIn
    })
  } catch (error) {
    res.status(500).json({ error: 'Error updating pay-in transaction status' })
  }
}
const payOutStatusChange = async (req, res) => {
  const payInId = req.params.id
  const status = req.body.status
  console.log(status)
  try {
    const updatedPayIn = await PayOutModel.findByIdAndUpdate(
      payInId,
      { status },
      { new: true }
    )
    if (!updatedPayIn) {
      return res.status(404).json({ message: 'Pay-Out transaction not found' })
    }
    res.status(200).json({
      message: 'Pay-out Transaction status updated successfully',
      payInTransaction: updatedPayIn
    })
  } catch (error) {
    res.status(500).json({ error: 'Error updating pay-in transaction status' })
  }
}
const payOutSummery = async (req, res) => {
  const users = await UserModel.find({})

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const payIns = await PayOutModel.find({
  })

  const userSummary = users.map(user => {
    const userWallet = user.wallet
    const todayUserPayIns = payIns.filter(p => p.user.toString() === user._id.toString() && p.created_at >= today && p.created_at < new Date(today.getTime() + 24 * 60 * 60 * 1000))
    const todaySuccess = todayUserPayIns.filter(p => p.status === 'SUCCESS').length
    const todayFailed = todayUserPayIns.filter(p => p.status === 'FAILED').length
    const totalUserPayIns = payIns.filter(p => p.user.toString() === user._id.toString())
    const totalSuccess = totalUserPayIns.filter(p => p.status === 'SUCCESS').length
    const todayCharge = todayUserPayIns
      .filter(p => p.charge)
      .reduce((total, p) => total + p.charge, 0)
    const totalCharge = totalUserPayIns
      .filter(p => p.charge)
      .reduce((total, p) => total + p.amount, 0)
    const todayTrn = todayUserPayIns
      .filter(p => p.charge)
      .reduce((total, p) => total + p.amount, 0)
    const totalTrn = totalUserPayIns
      .filter(p => p.amount)
      .reduce((total, p) => total + p.amount, 0)
    const todaySuccessAmount = todayUserPayIns
      .filter(p => p.status === 'SUCCESS')
      .reduce((total, p) => total + p.amount, 0)
    const todayFailedAmount = todayUserPayIns
      .filter(p => p.status === 'FAILED')
      .reduce((total, p) => total + p.amount, 0)
    const totalSuccessAmount = totalUserPayIns
      .filter(p => p.status === 'SUCCESS')
      .reduce((total, p) => total + p.amount, 0)

    const totalFailedAmount = totalUserPayIns
      .filter(p => p.status === 'FAILED')
      .reduce((total, p) => total + p.amount, 0)
    const totalFailed = totalUserPayIns.filter(p => p.status === 'FAILED').length

    return {
      name: user.firstName + ' ' + user.lastName,
      todaySuccess,
      todayFailed,
      totalSuccess,
      totalFailed,
      totalSuccessAmount,
      totalFailedAmount,
      todayFailedAmount,
      todaySuccessAmount,
      todayCharge: parseInt(todayCharge),
      totalCharge: parseInt(totalCharge),
      todayTrn: parseInt(todayTrn),
      totalTrn: parseInt(totalTrn),
      userWallet
    }
  })

  res.json(userSummary)
}
const payInSummery = async (req, res) => {
  const users = await UserModel.find({})

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const payIns = await PayInModal.find({
  })

  const userSummary = users.map(user => {
    const userWallet = user.wallet
    const todayUserPayIns = payIns.filter(p => p.user.toString() === user._id.toString() && p.created_at >= today && p.created_at < new Date(today.getTime() + 24 * 60 * 60 * 1000))
    const todaySuccess = todayUserPayIns.filter(p => p.status === 'SUCCESS').length
    const todayFailed = todayUserPayIns.filter(p => p.status === 'FAILED').length
    const totalUserPayIns = payIns.filter(p => p.user.toString() === user._id.toString())
    const totalSuccess = totalUserPayIns.filter(p => p.status === 'SUCCESS').length
    const todayCharge = todayUserPayIns
      .filter(p => p.charge)
      .reduce((total, p) => total + p.charge, 0)
    const totalCharge = totalUserPayIns
      .filter(p => p.charge)
      .reduce((total, p) => total + p.amount, 0)
    const todayTrn = todayUserPayIns
      .filter(p => p.charge)
      .reduce((total, p) => total + p.amount, 0)
    const totalTrn = totalUserPayIns
      .filter(p => p.amount)
      .reduce((total, p) => total + p.amount, 0)
    const todaySuccessAmount = todayUserPayIns
      .filter(p => p.status === 'SUCCESS')
      .reduce((total, p) => total + p.amount, 0)
    const todayFailedAmount = todayUserPayIns
      .filter(p => p.status === 'FAILED')
      .reduce((total, p) => total + p.amount, 0)
    const totalSuccessAmount = totalUserPayIns
      .filter(p => p.status === 'SUCCESS')
      .reduce((total, p) => total + p.amount, 0)

    const totalFailedAmount = totalUserPayIns
      .filter(p => p.status === 'FAILED')
      .reduce((total, p) => total + p.amount, 0)
    const totalFailed = totalUserPayIns.filter(p => p.status === 'FAILED').length

    return {
      name: user.firstName + ' ' + user.lastName,
      todaySuccess,
      todayFailed,
      totalSuccess,
      totalFailed,
      totalSuccessAmount,
      totalFailedAmount,
      todayFailedAmount,
      todaySuccessAmount,
      todayCharge: parseInt(todayCharge),
      totalCharge: parseInt(totalCharge),
      todayTrn: parseInt(todayTrn),
      totalTrn: parseInt(totalTrn),
      userWallet
    }
  })

  res.json(userSummary)
}

const checkIp = async (req, res) => {
  const api = 'http://fixxxpay.com/v1/generate/access-token'
  try {
    const response = await axios.post(api)
    res.json(response.data)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to fetch data from the API' })
  }
}
const transferWallet = async (req, res) => {
  try {
    const userId = req.params.id
    const { wallet } = req.body
    // Check if wallet value is valid
    if (isNaN(wallet) || wallet <= 0) {
      return res.status(400).json({
        message: 'Invalid wallet value'
      })
    }

    const user = await UserModel.findById(userId)
    const userWallet = user.wallet
    if (userWallet < wallet) {
      return res.status(400).json({
        message: 'Insufficient balance for wallet transfer'
      })
    }

    // Update userWallet and payOutwallet
    const updatedUserWallet = userWallet - wallet
    const updatedPayOutwallet = user.payoutWallet + wallet

    // Update the user document in the database
    const updateUser = await UserModel.findByIdAndUpdate(userId, {
      $set: {
        wallet: updatedUserWallet,
        payoutWallet: updatedPayOutwallet
      }
    }, { new: true })

    // Return success response
    return res.status(200).json({
      user: updateUser
    })
  } catch (err) {
    console.log(err)
    // Return error response
    return res.status(500).json({
      message: 'Internal server error'
    })
  }
}

export {
  payIn,
  payOut,
  payOutStatusChange,
  payInStatusChange,
  getPayIn,
  getPayOut,
  statement,
  getAllRecode,
  getAllPayInRecode,
  getAllPayOutRecode,
  getNoOfRecode,
  payInSummery,
  payOutSummery,
  payIns,
  checkIp,
  transferWallet
}
