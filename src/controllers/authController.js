const bcrypt = require('bcryptjs')
const jwt    = require('jsonwebtoken')
const sql    = require('../db/neon')

const sign = (user) => jwt.sign(
  { id: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
)

// POST /api/auth/signup
async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'name, email, password are required' })

    const existing = await sql`SELECT id FROM users WHERE email = ${email}`
    if (existing.length) return res.status(409).json({ success: false, message: 'Email already registered' })

    const hash = await bcrypt.hash(password, 10)
    const [user] = await sql`
      INSERT INTO users (name, email, password) VALUES (${name}, ${email}, ${hash}) RETURNING id, name, email, created_at
    `
    res.status(201).json({ success: true, data: { token: sign(user), user } })
  } catch (err) { next(err) }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'email and password are required' })

    const [user] = await sql`SELECT * FROM users WHERE email = ${email}`
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' })

    const { password: _, ...safeUser } = user
    res.json({ success: true, data: { token: sign(user), user: safeUser } })
  } catch (err) { next(err) }
}

module.exports = { signup, login }
