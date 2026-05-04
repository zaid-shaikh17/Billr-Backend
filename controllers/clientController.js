import Client from '../models/clientModel.js'

// Add client
export const addClient = async (req, res) => {
  try {
    const { name, email, phone, company, notes } = req.body
    const client = await Client.create({
      userId: req.user._id, name, email, phone, company, notes
    })
    res.json({ success: true, client })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

// Get all clients
export const getClients = async (req, res) => {
  try {
    const clients = await Client.find({ userId: req.user._id }).sort({ createdAt: -1 })
    res.json({ success: true, clients })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

// Get single client
export const getClient = async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, userId: req.user._id })
    if (!client) return res.json({ success: false, message: 'Client not found' })
    res.json({ success: true, client })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

// Update client
export const updateClient = async (req, res) => {
  try {
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    )
    if (!client) return res.json({ success: false, message: 'Client not found' })
    res.json({ success: true, client })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

// Delete client
export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
    if (!client) return res.json({ success: false, message: 'Client not found' })
    res.json({ success: true, message: 'Client deleted' })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}