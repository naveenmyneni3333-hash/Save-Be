const sql = require('../db/neon')

// GET /api/accounts
async function getAll(req, res, next) {
  try {
    const rows = await sql`SELECT * FROM accounts ORDER BY id ASC`
    res.json({ success: true, data: rows })
  } catch (err) { next(err) }
}

// POST /api/accounts
async function create(req, res, next) {
  try {
    const { name, color } = req.body
    if (!name) return res.status(400).json({ success: false, message: 'name is required' })
    const rows = await sql`
      INSERT INTO accounts (name, color) VALUES (${name}, ${color || '#6366f1'})
      RETURNING *
    `
    res.status(201).json({ success: true, data: rows[0] })
  } catch (err) { next(err) }
}

// DELETE /api/accounts/:id
async function remove(req, res, next) {
  try {
    const rows = await sql`DELETE FROM accounts WHERE id = ${req.params.id} RETURNING id`
    if (!rows.length) return res.status(404).json({ success: false, message: 'Account not found' })
    res.json({ success: true, message: 'Account deleted' })
  } catch (err) { next(err) }
}

module.exports = { getAll, create, remove }
