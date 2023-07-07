
import nodemailer from 'nodemailer'

const sendMail = async (req, res) => {
//   const testAccount = await nodemailer.createTestAccount()

  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'kenny.lang83@ethereal.email',
      pass: 'ugFynZQvUnw7affqgq'
    }
  })

  const info = await transporter.sendMail({
    from: '"SH_INFO👻" moniurzzaman25@gmail.com', // sender address
    to: 'moniurzzaman25@gmail.com', // list of receivers
    subject: 'Hello ✔', // Subject line
    text: 'Hello world?', // plain text body
    html: '<b>Hello world?</b>' // html body
  })

  res.json(info)
  console.log('Message sent: %s', info.messageId)
}

export {
  sendMail
}
