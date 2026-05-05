import Invoice from '../models/invoiceModel.js'

// Generate invoice number
const generateInvoiceNumber = async () => {
  const count = await Invoice.countDocuments()
  return `INV-${String(count + 1).padStart(4, '0')}`
}

// Create invoice
export const createInvoice = async (req, res) => {
  try {
    const { clientId, items, tax, dueDate, notes } = req.body

    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0)
    const total = subtotal + (subtotal * tax) / 100
    const invoiceNumber = await generateInvoiceNumber()

    const invoice = await Invoice.create({
      userId: req.user._id,
      clientId, items, subtotal, tax, total,
      invoiceNumber, dueDate, notes
    })

    res.json({ success: true, invoice })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

// Get all invoices
export const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.user._id })
      .populate('clientId', 'name email company')
      .sort({ createdAt: -1 })
    res.json({ success: true, invoices })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

// Get single invoice
export const getInvoices = async (req, res) => {
  try {
    const now = new Date()
    await Invoice.updateMany(
      {
        userId: req.user._id,
        status: { $in: ['Draft', 'Sent'] },
        dueDate: { $lt: now }
      },
      { status: 'Overdue' }
    )

    const invoices = await Invoice.find({ userId: req.user._id })
      .populate('clientId', 'name email company')
      .sort({ createdAt: -1 })
    res.json({ success: true, invoices })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

// Update invoice status
export const updateInvoiceStatus = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status: req.body.status },
      { new: true }
    )
    if (!invoice) return res.json({ success: false, message: 'Invoice not found' })
    res.json({ success: true, invoice })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

// Delete invoice
export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
    if (!invoice) return res.json({ success: false, message: 'Invoice not found' })
    res.json({ success: true, message: 'Invoice deleted' })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}