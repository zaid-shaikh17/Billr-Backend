import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  businessName: { type: String, default: '' },
  phone: { type: String, default: '' },
  invoicePrefix: { type: String, default: 'INV' },
}, { timestamps: true })

export default mongoose.model('User', userSchema)