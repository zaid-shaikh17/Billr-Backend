import pkg from 'sib-api-v3-sdk'
const { ApiClient, TransactionalEmailsApi, SendSmtpEmail } = pkg

import Invoice from '../models/invoiceModel.js'
import { formatCurrency, formatDate } from '../utils/helpers.js'

export const sendInvoiceEmail = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('clientId', 'name email company')
      .populate('userId', 'name email businessName phone')

    if (!invoice) return res.json({ success: false, message: 'Invoice not found' })

    const itemsHTML = invoice.items.map(item => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee">${item.description}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${formatCurrency(item.rate)}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${formatCurrency(item.quantity * item.rate)}</td>
      </tr>
    `).join('')

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h1 style="color:#6c63ff;font-size:28px;margin-bottom:4px">Billr</h1>
        <p style="color:#888;font-size:13px;margin-bottom:24px">Invoice smart. Get paid faster.</p>
        <div style="background:#f8f9fa;border-radius:8px;padding:16px;margin-bottom:24px">
          <h2 style="margin:0 0 4px;font-size:20px">${invoice.invoiceNumber}</h2>
          <p style="margin:0;color:#888;font-size:13px">Due: ${formatDate(invoice.dueDate)} · Status: ${invoice.status}</p>
        </div>
        <p>Hi <strong>${invoice.clientId.name}</strong>,</p>
        <p>Please find your invoice from <strong>${invoice.userId.businessName || invoice.userId.name}</strong> below.</p>
        <table style="width:100%;border-collapse:collapse;margin:24px 0">
          <thead>
            <tr style="background:#f8f9fa">
              <th style="padding:8px;text-align:left;font-size:12px;color:#888">DESCRIPTION</th>
              <th style="padding:8px;text-align:center;font-size:12px;color:#888">QTY</th>
              <th style="padding:8px;text-align:right;font-size:12px;color:#888">RATE</th>
              <th style="padding:8px;text-align:right;font-size:12px;color:#888">TOTAL</th>
            </tr>
          </thead>
          <tbody>${itemsHTML}</tbody>
        </table>
        <div style="text-align:right;margin-bottom:24px">
          <p style="color:#888;font-size:13px">Subtotal: <strong>${formatCurrency(invoice.subtotal)}</strong></p>
          <p style="color:#888;font-size:13px">Tax (${invoice.tax}%): <strong>${formatCurrency(invoice.subtotal * invoice.tax / 100)}</strong></p>
          <p style="font-size:18px;font-weight:700;color:#6c63ff">Total: ${formatCurrency(invoice.total)}</p>
        </div>
        ${invoice.notes ? `<p style="color:#888;font-size:13px;font-style:italic">${invoice.notes}</p>` : ''}
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
        <p style="color:#888;font-size:12px">Sent via Billr · ${invoice.userId.email}</p>
      </div>
    `

    const defaultClient = ApiClient.instance
    const apiKey = defaultClient.authentications['api-key']
    apiKey.apiKey = process.env.BREVO_API_KEY

    const apiInstance = new TransactionalEmailsApi()
    const sendSmtpEmail = new SendSmtpEmail()

    sendSmtpEmail.subject = `Invoice ${invoice.invoiceNumber} from ${invoice.userId.businessName || invoice.userId.name}`
    sendSmtpEmail.htmlContent = html
    sendSmtpEmail.sender = { name: invoice.userId.businessName || invoice.userId.name, email: process.env.EMAIL_USER }
    sendSmtpEmail.to = [{ email: invoice.clientId.email, name: invoice.clientId.name }]

    await apiInstance.sendTransacEmail(sendSmtpEmail)
    await Invoice.findByIdAndUpdate(invoice._id, { status: 'Sent' })

    res.json({ success: true, message: 'Invoice sent successfully' })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}