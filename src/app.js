const express      = require('express')
const cors         = require('cors')

const transactionRoutes = require('./routes/transactions')
const accountRoutes     = require('./routes/accounts')
const authRoutes        = require('./routes/auth')
const profileRoutes     = require('./routes/profile')
const exportRoutes      = require('./routes/export')
const errorHandler      = require('./middleware/errorHandler')

const app = express()

// ── Middleware ──
app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Health check ──
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'SavingsBE', timestamp: new Date().toISOString() })
})

// ── Routes ──
app.use('/api/transactions', transactionRoutes)
app.use('/api/accounts',     accountRoutes)
app.use('/api/auth',         authRoutes)
app.use('/api/profile',      profileRoutes)
app.use('/api/export',       exportRoutes)

// ── 404 ──
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` })
})

// ── Error handler ──
app.use(errorHandler)

module.exports = app
