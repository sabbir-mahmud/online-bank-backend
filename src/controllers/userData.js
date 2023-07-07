import Data from '../model/dataModel.js'
import crypto from 'crypto'

const ENCRYPTION = async (req, res) => {
  try {
    const { name, data } = req.body
    const user = req.user_id
    const iv = crypto.randomBytes(16)
    const key = crypto.randomBytes(32)
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
    const jsonData = JSON.stringify(data)
    let encryptedData = cipher.update(jsonData, 'utf-8', 'hex')
    encryptedData += cipher.final('hex')
    const newData = new Data({
      user,
      name,
      data: {
        iv: iv.toString('hex'),
        key: key.toString('hex'),
        data: encryptedData
      }
    })

    const result = await newData.save()
    res.status(201).json(result)
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
}

const DECRYPTION_ID = async (req, res) => {
  try {
    const id = req.params.id

    const data = await Data.findById(id)

    if (!data) {
      return res.status(404).json({ error: 'Data not found' })
    }
    const iv = Buffer.from(data.data.iv, 'hex')
    const key = Buffer.from(data.data.key, 'hex')
    const encryptedData = data.data.data
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
    let decryptedData = decipher.update(encryptedData, 'hex', 'utf-8')
    decryptedData += decipher.final('utf-8')

    // try {
    //   const parsedData = JSON.parse(decryptedData)
    //   res.status(200).json({ name: data.name, data: parsedData })
    // } catch (e) {
    //   res.status(200).json({ name: data.name, data: decryptedData })
    // }
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
}

const DECRYPTION = async (req, res) => {
  try {
    const user = req.user_id

    const data = await Data.find({ user })

    if (!data) {
      return res.status(404).json({ error: 'Data not found' })
    }

    const decryptedDataArray = []

    for (let i = 0; i < data.length; i++) {
      const iv = Buffer.from(data[i].data.iv, 'hex')
      const key = Buffer.from(data[i].data.key, 'hex')
      const encryptedData = data[i].data.data
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
      let decryptedData = decipher.update(encryptedData, 'hex', 'utf-8')
      decryptedData += decipher.final('utf-8')
      try {
        const parsedData = JSON.parse(decryptedData)
        decryptedData = parsedData
      } catch (err) {
      }

      decryptedDataArray.push({ name: data[i].name, data: decryptedData })
    }

    res.status(200).json(decryptedDataArray)
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
}

export { ENCRYPTION, DECRYPTION, DECRYPTION_ID }
