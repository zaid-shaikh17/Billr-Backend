import express from 'express'
import { createInvoice, getInvoices, getInvoice, updateInvoiceStatus, deleteInvoice } from '../controllers/invoiceController.js'
import protect from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect)

router.post('/', createInvoice)
router.get('/', getInvoices)
router.get('/:id', getInvoice)
router.put('/:id', updateInvoiceStatus)
router.delete('/:id', deleteInvoice)

export default router