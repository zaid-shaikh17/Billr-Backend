import express from 'express'
import { addClient, getClients, getClient, updateClient, deleteClient } from '../controllers/clientController.js'
import protect from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect)

router.post('/', addClient)
router.get('/', getClients)
router.get('/:id', getClient)
router.put('/:id', updateClient)
router.delete('/:id', deleteClient)

export default router