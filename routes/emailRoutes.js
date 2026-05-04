import express from 'express'
import { sendInvoiceEmail } from '../controllers/emailController.js'
import protect from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/:id', protect, sendInvoiceEmail)

export default router