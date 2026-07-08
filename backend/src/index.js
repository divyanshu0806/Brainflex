require('dotenv').config()
const express = require('express')
const cors = require('cors')

const authRoutes      = require('./routes/auth')
const questionsRoutes = require('./routes/questions')
const dashboardRoutes = require('./routes/dashboard')

const app = express()

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'BrainFlex API is running 🚀' })
})

// Routes
app.use('/api/auth',      authRoutes)
app.use('/api/questions', questionsRoutes)
app.use('/api',           dashboardRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message)
  res.status(500).json({ error: 'Internal server error' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 BrainFlex API running on port ${PORT}`)
})
