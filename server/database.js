/* eslint-env node */
import mongoose from 'mongoose'
import * as dotenv from 'dotenv'

dotenv.config()

const mongoURI = process.env.MONGO_URI

const connectDB = async () => {
  await mongoose.connect(mongoURI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));
}

export default connectDB;