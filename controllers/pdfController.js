import PDFDocument from 'pdfkit'
import Invoice from '../models/invoiceModel.js'
import { formatCurrency, formatDate } from '../utils/helpers.js'

export const generateInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('clientId', 'name email phone company')
      .populate('userId', 'name email businessName phone')

    if (!invoice) return res.json({ success: false, message: 'Invoice not found' })

    const doc = new PDFDocument({ margin: 50 })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=${invoice.invoiceNumber}.pdf`)

    doc.pipe(res)

    // Header
    doc.fontSize(28).font('Helvetica-Bold').fillColor('#6c63ff').text('Billr', 50, 50)
    doc.fontSize(10).font('Helvetica').fillColor('#888').text('Invoice smart. Get paid faster.', 50, 85)

    // Invoice number and status
    doc.fontSize(20).font('Helvetica-Bold').fillColor('#1a1a2e')
      .text(invoice.invoiceNumber, 400, 50, { align: 'right' })
    doc.fontSize(11).font('Helvetica').fillColor('#888')
      .text(`Status: ${invoice.status}`, 400, 78, { align: 'right' })
    doc.fontSize(11).fillColor('#888')
      .text(`Due: ${formatDate(invoice.dueDate)}`, 400, 95, { align: 'right' })

    doc.moveTo(50, 120).lineTo(550, 120).strokeColor('#e0e0e0').stroke()

    // From / To
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#888').text('FROM', 50, 140)
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#1a1a2e').text(invoice.userId.businessName || invoice.userId.name, 50, 155)
    doc.fontSize(10).font('Helvetica').fillColor('#555').text(invoice.userId.email, 50, 170)
    if (invoice.userId.phone) doc.text(invoice.userId.phone, 50, 185)

    doc.fontSize(10).font('Helvetica-Bold').fillColor('#888').text('TO', 300, 140)
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#1a1a2e').text(invoice.clientId.name, 300, 155)
    if (invoice.clientId.company) doc.fontSize(10).font('Helvetica').fillColor('#555').text(invoice.clientId.company, 300, 170)
    doc.fontSize(10).font('Helvetica').fillColor('#555').text(invoice.clientId.email, 300, 185)
    if (invoice.clientId.phone) doc.text(invoice.clientId.phone, 300, 200)

    doc.moveTo(50, 225).lineTo(550, 225).strokeColor('#e0e0e0').stroke()

    // Items table header
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#888')
    doc.text('DESCRIPTION', 50, 240)
    doc.text('QTY', 310, 240)
    doc.text('RATE', 370, 240)
    doc.text('TOTAL', 460, 240)

    doc.moveTo(50, 255).lineTo(550, 255).strokeColor('#e0e0e0').stroke()

    // Items
    let y = 265
    invoice.items.forEach(item => {
      doc.fontSize(10).font('Helvetica').fillColor('#1a1a2e')
      doc.text(item.description, 50, y, { width: 250 })
      doc.text(String(item.quantity), 310, y)
      doc.text(formatCurrency(item.rate), 370, y)
      doc.text(formatCurrency(item.quantity * item.rate), 460, y)
      y += 25
    })

    doc.moveTo(50, y + 5).lineTo(550, y + 5).strokeColor('#e0e0e0').stroke()

    // Totals
    y += 20
    doc.fontSize(10).font('Helvetica').fillColor('#888')
    doc.text('Subtotal', 370, y)
    doc.font('Helvetica-Bold').fillColor('#1a1a2e').text(formatCurrency(invoice.subtotal), 460, y)

    y += 20
    doc.font('Helvetica').fillColor('#888').text(`Tax (${invoice.tax}%)`, 370, y)
    doc.font('Helvetica-Bold').fillColor('#1a1a2e')
      .text(formatCurrency(invoice.subtotal * invoice.tax / 100), 460, y)

    y += 25
    doc.moveTo(370, y).lineTo(550, y).strokeColor('#e0e0e0').stroke()
    y += 10
    doc.fontSize(13).font('Helvetica-Bold').fillColor('#6c63ff')
    doc.text('Total', 370, y)
    doc.text(formatCurrency(invoice.total), 460, y)

    // Notes
    if (invoice.notes) {
      y += 50
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#888').text('NOTES', 50, y)
      doc.fontSize(10).font('Helvetica').fillColor('#555').text(invoice.notes, 50, y + 15)
    }

    doc.end()
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}