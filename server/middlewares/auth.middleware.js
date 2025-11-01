const jwt = require('jsonwebtoken')

const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        action: 'authenticate',
        error: 'No token provided',
        code: 401
      })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      action: 'authenticate',
      error: 'Invalid or expired token',
      code: 401
    })
  }
}

module.exports = { authenticate }

