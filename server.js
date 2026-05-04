import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'
import clientRoutes from './routes/clientRoutes.js'
import invoiceRoutes from './routes/invoiceRoutes.js'
import pdfRoutes from './routes/pdfRoutes.js'
import emailRoutes from './routes/emailRoutes.js'

dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())

app.use('/api/auth', authRoutes)
app.use('/api/clients', clientRoutes)
app.use('/api/invoices', invoiceRoutes)
app.use('/api/pdf', pdfRoutes)
app.use('/api/email', emailRoutes)

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err))

app.get('/', (req, res) => res.send('Billr API running'))

app.listen(process.env.PORT || 4000, () => console.log('Server started'))