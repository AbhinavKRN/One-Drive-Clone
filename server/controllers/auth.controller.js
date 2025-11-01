const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const supabase = require('../config/database')

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'error',
        action: 'signup',
        error: 'Name, email, and password are required',
        code: 400
      })
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (existingUser) {
      return res.status(409).json({
        status: 'error',
        action: 'signup',
        error: 'User already exists',
        code: 409
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        name,
        email,
        password: hashedPassword
      }])
      .select()
      .single()

    if (error) {
      throw error
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    )

    return res.status(201).json({
      status: 'success',
      action: 'signup',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.created_at
        },
        token
      },
      message: 'User registered successfully'
    })
  } catch (error) {
    console.error('Signup error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'signup',
      error: error.message,
      code: 500
    })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        action: 'login',
        error: 'Email and password are required',
        code: 400
      })
    }

    // Find user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !user) {
      return res.status(401).json({
        status: 'error',
        action: 'login',
        error: 'Invalid email or password',
        code: 401
      })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        action: 'login',
        error: 'Invalid email or password',
        code: 401
      })
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    )

    return res.json({
      status: 'success',
      action: 'login',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        token
      },
      message: 'Login successful'
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'login',
      error: error.message,
      code: 500
    })
  }
}

const getProfile = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, created_at, updated_at')
      .eq('id', req.user.id)
      .single()

    if (error || !user) {
      return res.status(404).json({
        status: 'error',
        action: 'get_profile',
        error: 'User not found',
        code: 404
      })
    }

    return res.json({
      status: 'success',
      action: 'get_profile',
      data: { user },
      message: 'Profile retrieved successfully'
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'get_profile',
      error: error.message,
      code: 500
    })
  }
}

module.exports = { signup, login, getProfile }
