import express from 'express'
import { generateInvoicePDF } from '../controllers/pdfController.js'
import protect from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/:id', protect, generateInvoicePDF)

export default router