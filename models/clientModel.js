import mongoose from 'mongoose'

const clientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  company: { type: String, default: '' },
  notes: { type: String, default: '' }
}, { timestamps: true })

export default mongoose.model('Client', clientSchema.index({userId: 1}))