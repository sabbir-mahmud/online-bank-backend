import jwt from 'jsonwebtoken'
import UserModel from '../model/userModel.js'
function getClientIp (req) {
  const forwardedFor = req.headers['x-forwarded-for']
  if (forwardedFor) {
    const ips = forwardedFor.split(',')
    return ips[0].trim()
  } else {
    return req.ip
  }
}
const checkUser = async (req, res, next) => {
  const reqUser = req.body
  const { email } = reqUser
  const user = await UserModel.findOne({ email })
  // const userID = user._id
  if (!user) {
    return res.status(400).json({
      message: 'User not found'
    })
  }

  if (user.role === 'partner') {
    // req.user_id = userID
    next()
  } else {
    return res.status(400).json({
      message: 'You are not alow in the site'
    })
  }
}
const checkUserIp = async (req, res, next) => {
  const reqUser = req.body
  const { email } = reqUser
  const user = await UserModel.findOne({ email })
  if (!user) {
    return res.status(403).json({
      status: 'failed', message: 'User Does not exist'
    })
  }
  const ipAddress = user?.IpAddress
  const clientIp = getClientIp(req)
  console.log(ipAddress)
  console.log(clientIp)
  const checkIp = ipAddress.includes(clientIp)
  if (!checkIp) {
    return res.status(403).json({
      status: 'failed', message: 'User Ip Does not match'
    })
  }
  next()
}
const checkAuthUser = async (req, res, next) => {
  let token
  const { authorization } = req.headers
  if (authorization && authorization.startsWith('Bearer')) {
    try {
      // Get Token from header
      token = authorization.split(' ')[1]
      const { userID } = jwt.verify(token, '123456789')
      const user = await UserModel.findById(userID)
      const ipAddress = user.IpAddress
      const clientIp = getClientIp(req)
      const checkIp = ipAddress.includes(clientIp)
      if (!checkIp) {
        return res.status(403).json({
          status: 'failed', message: 'User Ip Does not match'
        })
      }
      req.user_id = userID
      next()
    } catch (error) {
      res.status(403).send({ status: 'failed', message: 'Unauthorized User' })
    }
  }
  if (!token) {
    res
      .status(401)
      .send({ status: 'failed', message: 'Unauthorized User, No Token' })
  }
}
const checkSuperAdmin = async (req, res, next) => {
  let token
  const { authorization } = req.headers
  if (authorization && authorization.startsWith('Bearer')) {
    try {
      // Get Token from header
      token = authorization.split(' ')[1]

      // Verify Token
      const { userID } = jwt.verify(token, '123456789')
      req.user_id = userID
      const user = await UserModel.findById(userID)
      // const ipAddress = user.IpAddress
      // const clientIp = getClientIp(req)
      // const checkIp = ipAddress.includes(clientIp)
      // if (!checkIp) {
      //   return res.status(403).json({
      //     status: 'failed', message: 'User Ip Does not match'
      //   })
      // }
      if (user.role === 'partner') {
        req.user_id = userID
        next()
      } else {
        res.status(400).json({
          message: 'You are not alow in the route'
        })
      }
    } catch (error) {
      res.status(403).send({ status: 'failed', message: 'Unauthorized User' })
    }
  }
  if (!token) {
    res
      .status(401)
      .send({ status: 'failed', message: 'Unauthorized User, No Token' })
  }
}
export { checkAuthUser, checkSuperAdmin, checkUserIp, checkUser }
