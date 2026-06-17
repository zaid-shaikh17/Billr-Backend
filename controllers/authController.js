import User from '../models/userModel.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' })
}

// Register
export const register = async (req, res) => {
  try {
    const { name, email, password, businessName, phone } = req.body

    const userExists = await User.findOne({ email })
    if (userExists) return res.json({ success: false, message: 'Email already registered' })

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const user = await User.create({
      name, email, password: hashedPassword, businessName, phone
    })

    res.json({
      success: true,
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email }
    })

  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) return res.json({ success: false, message: 'Invalid credentials' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.json({ success: false, message: 'Invalid credentials' })

    res.json({
      success: true,
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email }
    })

  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

//Updated Profile

export const updateProfile = async (req, res) => {
  try {
    const { name, businessName, phone } = req.body
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, businessName, phone },
      { returnDocument: 'after' }
    ).select('-password')

    res.json({ success: true, user })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}