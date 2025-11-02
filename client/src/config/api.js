// Use environment variable if available (for Vite), otherwise fallback to default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'

export default API_BASE_URL

