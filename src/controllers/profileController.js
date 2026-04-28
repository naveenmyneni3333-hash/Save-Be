const bcrypt = require('bcryptjs')
const sql    = require('../db/neon')

// GET /api/profile
async function getProfile(req, res, next) {
  try {
    const [user] = await sql`SELECT id, name, email, created_at FROM users WHERE id = ${req.user.id}`
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    res.json({ success: true, data: user })
  } catch (err) { next(err) }
}

// PUT /api/profile
async function updateProfile(req, res, next) {
  try {
    const { name, email, password } = req.body
    const updates = {}
    if (name)     updates.name     = name
    if (email)    updates.email    = email
    if (password) updates.password = await bcrypt.hash(password, 10)

    const [user] = await sql`
      UPDATE users SET
        name     = COALESCE(${updates.name     ?? null}, name),
        email    = COALESCE(${updates.email    ?? null}, email),
        password = COALESCE(${updates.password ?? null}, password)
      WHERE id = ${req.user.id}
      RETURNING id, name, email, created_at
    `
    res.json({ success: true, data: user })
  } catch (err) { next(err) }
}

module.exports = { getProfile, updateProfile }
