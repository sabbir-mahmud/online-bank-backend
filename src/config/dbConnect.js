import mongoose from 'mongoose'

const connectDBs = async (DATABASE_URL, DB_NAME) => {
  try {
    const DB_OPTIONS = {
      dbName: DB_NAME
    }
    await mongoose.connect(DATABASE_URL, DB_OPTIONS)
    console.log('Server Connect Done..')
  } catch (error) {
    console.log(error)
  }
}

export default connectDBs
