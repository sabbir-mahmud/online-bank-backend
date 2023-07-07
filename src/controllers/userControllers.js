import UserModel from '../model/userModel.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10)
}
const register = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    role,
    IpAddress,
    payInCharge,
    payOutCharge,
    payInChargeType,
    payOutChargeType,
    payOutEnabled,
    payInEnabled
  } = req.body
  try {
    if (!email || !firstName || !lastName || !password || !confirmPassword) {
      return res.status(400).json({
        message: 'Please fill all the required fields'
      })
    }
    if (password === !confirmPassword) {
      return res.status(400).json({
        message: 'Passwords do not match'
      })
    }
    const users = await UserModel.findOne({ email })
    if (users) {
      return res.status(400).json({
        message: 'User already exists'
      })
    }

    const hashedPassword = await hashPassword(password)
    const user = new UserModel({
      firstName,
      lastName,
      email,
      IpAddress: IpAddress || '',
      password: hashedPassword,
      role: role || 'employee',
      enabled: true,
      payInCharge: payInCharge || 0,
      payOutCharge: payOutCharge || 0,
      wallet: 0,
      DEBITACC: 'DEBITACC',
      URN: 'URN',
      payoutWallet: 0,
      USERID: 'USERID',
      CORPID: 'CORPID',
      cu: 'cu',
      mc: 'mc',
      pn: 'pn',
      prefix: '123',
      NoPayIn: 0,
      NoPayOut: 0,
      AurAmtOfPayIn: 0,
      AurAmtOfPayOut: 0,
      payInChargeType: payInChargeType || 'percentage',
      payOutChargeType: payOutChargeType || 'percentage',
      payInEnabled: payInEnabled || true,
      payOutEnabled: payOutEnabled || true
    })
    await user.save()
    const accessToken = jwt.sign({ userID: user._id }, '123456789', {
      expiresIn: '1d'
    })
    const refreshToken = jwt.sign({ userID: user._id }, '123456789', {
      expiresIn: '3d'
    })
    user.accessToken = accessToken
    user.refreshToken = refreshToken

    res.status(200).json({
      user,
      accessToken,
      refreshToken
    })
  } catch (error) {
    console.log(error)
  }
}

const validatePassword = async (password, hashPassword) => {
  return await bcrypt.compare(password, hashPassword)
}

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email && !password) {
      return res.status(400).json({
        message: 'Please fill all the required fields'
      })
    }
    const user = await UserModel.findOne({ email })
    if (!user) {
      return res.status(400).json({
        message: 'Email does not exist'
      })
    }
    const validPassword = await validatePassword(password, user.password)
    if (!validPassword) {
      return res.status(400).json({
        message: 'Password is not correct'
      })
    }
    if (!user.enabled) {
      return res.status(403).json({ message: 'User disabled' })
    }
    const accessToken = jwt.sign({ userID: user._id }, '123456789', {
      expiresIn: '1d'
    })
    const refreshToken = jwt.sign({ userID: user._id }, '123456789', {
      expiresIn: '3d'
    })
    await UserModel.findByIdAndUpdate(user._id)
    res.status(200).json({
      user,
      accessToken,
      refreshToken
    })
  } catch (error) {
    next(error)
  }
}
const refreshToken = async (req, res) => {
  const refreshToken = req.body.refreshToken
  if (refreshToken) {
    try {
      const { userID } = jwt.verify(refreshToken, '123456789')
      const accessToken = jwt.sign({ userID }, '123456789', {
        expiresIn: '1d'
      })
      const newRefreshToken = jwt.sign({ userID }, '123456789', {
        expiresIn: '3d'
      })

      res.status(203).json({
        accessToken,
        newRefreshToken
      })
    } catch (error) {
      return res.status(401).json({
        message: 'Unauthorized User'
      })
    }
  } else {
    return res.status(401).json({
      message: 'Unauthorized User'
    })
  }
}
const changePass = async (req, res) => {
  try {
    const { oldPassword, password, confirmPassword } = req.body
    if (oldPassword && password && confirmPassword) {
      if (password === confirmPassword) {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const user = await UserModel.findById(req.params.id)
        const validPassword = await validatePassword(
          oldPassword,
          user.password
        )
        if (!validPassword) {
          return res.status(400).json({
            message: 'Old Password is not correct'
          })
        }
        user.password = hashedPassword
        await user.save()
        res.status(200).json({
          message: 'Password changed successfully'
        })
      } else {
        res.status(400).json({
          message: "New Password and Confirm New Password doesn't match"
        })
      }
    } else {
      res.status(400).json({
        message: 'Please fill all the required fields'
      })
    }
  } catch (err) {
    console.log(err)
  }
}

const findUser = async (req, res) => {
  const id = req.user_id
  const user = await UserModel.findById(id)
  if (!user) {
    return res.status(403).json({
      message: 'user not exist'
    })
  }
  res.status(200).json({
    user
  })
}
const users = async (req, res) => {
  const user = await UserModel.find({})
  res.status(200).json({
    user
  })
}

const user = async (req, res) => {
  const id = req.params.id
  const user = await UserModel.findById(id)
  res.status(200).json({
    user
  })
}

const updateUser = async (req, res) => {
  try {
    const id = req.params.id
    const update = req.body.user
    const user = await UserModel.findByIdAndUpdate(id, update)
    res.status(200).json({
      user
    })
  } catch (err) {
    console.log(err)
  }
}

const forgotPass = async (req, res) => {
  const { email } = req.body
  try {
    const oldUser = await UserModel.findOne({ email })
    if (!oldUser) {
      return res.json({
        status: 'User NOt Exists!!'
      })
    }
    const secret = '123456789' + oldUser.password
    const token = jwt.sign(
      {
        email: oldUser.email,
        id: oldUser._id
      },
      secret,
      { expiresIn: '5min' }
    )
    const link = `http://35.154.91.189:8080/server/resetPassword/${oldUser._id}/${token}`
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'cardinalcasey53@gmail.com',
        pass: 'rdlvczhlkolgwwxz'
      }
    })

    const mailOptions = {
      from: 'cardinalcasey53@gmail.com',
      to: email,
      subject: 'Password reset',
      text: link
    }

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error)
      } else {
        console.log('Email sent: ' + info.response)
      }
    })
  } catch (err) {
    console.log(err)
  }
}
const resetPassword = async (req, res) => {
  const { id, token } = req.params
  const oldUser = await UserModel.findOne({ _id: id })
  if (!oldUser) {
    return res.json({ status: 'User NOt Exists!!' })
  }
  const secret = '123456789' + oldUser.password
  try {
    const verify = jwt.verify(token, secret)
    res.render('index', { email: verify.email, status: 'Not Verified' })
  } catch (err) {
    console.log(err)
    console.log('Not Verify')
  }
}
// const resetPasswordChange = async (req, res) => {
//   const { id, token } = req.params
//   const { password, confirmPassword } = req.body
//   if (password !== confirmPassword) {
//     return res.json({
//       status: 'Password does not match'
//     })
//   }
//   const oldUser = await UserModel.findOne({ _id: id })
//   if (!oldUser) {
//     return res.json({ status: 'User NOt Exists!!' })
//   }
//   const secret = '123456789' + oldUser.password
//   try {
//     const verify = jwt.verify(token, secret)
//     const hashedPassword = await hashPassword(password)
//     await UserModel.updateOne({
//       _id: id
//     }, {
//       $set: {
//         password: hashedPassword
//       }
//     })
//     res.status(200).json({
//       message: 'Password change successfully'
//     })
//     res.render('index', { email: verify.email, status: 'verified' })
//   } catch (err) {
//     console.log(err)
//     res.json({
//       status: 'Something Went Wrong'
//     })
//   }
// }
const resetPasswordChange = async (req, res) => {
  const { id, token } = req.params
  const { password, confirmPassword } = req.body
  if (password !== confirmPassword) {
    return res.json({
      status: 'Password does not match'
    })
  }
  const oldUser = await UserModel.findOne({ _id: id })
  if (!oldUser) {
    return res.json({ status: 'User NOt Exists!!' })
  }
  const secret = '123456789' + oldUser.password
  try {
    const verify = jwt.verify(token, secret)
    const hashedPassword = await hashPassword(password)
    await UserModel.updateOne(
      {
        _id: id
      },
      {
        $set: {
          password: hashedPassword
        }
      }
    )
    res.render('index', {
      email: verify.email,
      status: 'verified',
      message: 'Password changed successfully'
    })
  } catch (err) {
    console.log(err)
    res.json({
      status: 'Something Went Wrong'
    })
  }
}

export {
  register,
  login,
  refreshToken,
  changePass,
  findUser,
  users,
  user,
  updateUser,
  forgotPass,
  resetPassword,
  resetPasswordChange
}
