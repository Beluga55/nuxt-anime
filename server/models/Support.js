import mongoose from 'mongoose';

const supportSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  dateCreated: { type: Date, default: Date.now },
  status: { type: String, default: 'open' }
});

const Support = mongoose.model('Support', supportSchema);

export default Support;