const sql = require('../db/neon')

// GET /api/transactions?type=debit&account=cash&month=2025-04
async function getAll(req, res, next) {
  try {
    const { type, account, month } = req.query
    let rows

    if (type && account && month) {
      rows = await sql`
        SELECT * FROM transactions
        WHERE type = ${type} AND account = ${account}
          AND TO_CHAR(date,'YYYY-MM') = ${month}
        ORDER BY date DESC, created_at DESC
      `
    } else if (type && month) {
      rows = await sql`
        SELECT * FROM transactions
        WHERE type = ${type} AND TO_CHAR(date,'YYYY-MM') = ${month}
        ORDER BY date DESC, created_at DESC
      `
    } else if (account) {
      rows = await sql`
        SELECT * FROM transactions
        WHERE account = ${account}
        ORDER BY date DESC, created_at DESC
      `
    } else if (month) {
      rows = await sql`
        SELECT * FROM transactions
        WHERE TO_CHAR(date,'YYYY-MM') = ${month}
        ORDER BY date DESC, created_at DESC
      `
    } else {
      rows = await sql`
        SELECT * FROM transactions
        ORDER BY date DESC, created_at DESC
      `
    }

    res.json({ success: true, data: rows })
  } catch (err) { next(err) }
}

// GET /api/transactions/:id
async function getOne(req, res, next) {
  try {
    const rows = await sql`SELECT * FROM transactions WHERE id = ${req.params.id}`
    if (!rows.length) return res.status(404).json({ success: false, message: 'Transaction not found' })
    res.json({ success: true, data: rows[0] })
  } catch (err) { next(err) }
}

// POST /api/transactions
async function create(req, res, next) {
  try {
    const { title, item, amount, type, category, account, note, date } = req.body
    if (!title || !amount || !type || !category || !account) {
      return res.status(400).json({ success: false, message: 'title, amount, type, category, account are required' })
    }
    if (!['debit','credit'].includes(type)) {
      return res.status(400).json({ success: false, message: 'type must be debit or credit' })
    }

    const rows = await sql`
      INSERT INTO transactions (title, item, amount, type, category, account, note, date)
      VALUES (
        ${title}, ${item || null}, ${amount}, ${type},
        ${category}, ${account}, ${note || null},
        ${date || new Date().toISOString().split('T')[0]}
      )
      RETURNING *
    `
    res.status(201).json({ success: true, data: rows[0] })
  } catch (err) { next(err) }
}

// PUT /api/transactions/:id
async function update(req, res, next) {
  try {
    const { title, item, amount, type, category, account, note, date } = req.body
    const rows = await sql`
      UPDATE transactions SET
        title    = COALESCE(${title    ?? null}, title),
        item     = COALESCE(${item     ?? null}, item),
        amount   = COALESCE(${amount   ?? null}, amount),
        type     = COALESCE(${type     ?? null}, type),
        category = COALESCE(${category ?? null}, category),
        account  = COALESCE(${account  ?? null}, account),
        note     = COALESCE(${note     ?? null}, note),
        date     = COALESCE(${date     ?? null}, date)
      WHERE id = ${req.params.id}
      RETURNING *
    `
    if (!rows.length) return res.status(404).json({ success: false, message: 'Transaction not found' })
    res.json({ success: true, data: rows[0] })
  } catch (err) { next(err) }
}

// DELETE /api/transactions/:id
async function remove(req, res, next) {
  try {
    const rows = await sql`DELETE FROM transactions WHERE id = ${req.params.id} RETURNING id`
    if (!rows.length) return res.status(404).json({ success: false, message: 'Transaction not found' })
    res.json({ success: true, message: 'Deleted successfully' })
  } catch (err) { next(err) }
}

// GET /api/transactions/summary?month=2025-04
async function summary(req, res, next) {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7)

    const [totals] = await sql`
      SELECT
        COALESCE(SUM(CASE WHEN type='credit' THEN amount ELSE 0 END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN type='debit'  THEN amount ELSE 0 END), 0) AS total_expense,
        COALESCE(SUM(CASE WHEN type='credit' THEN amount ELSE -amount END), 0) AS net_savings,
        COUNT(*) AS total_transactions
      FROM transactions
      WHERE TO_CHAR(date,'YYYY-MM') = ${month}
    `

    const byCategory = await sql`
      SELECT category, type,
        SUM(amount) AS total,
        COUNT(*)    AS count
      FROM transactions
      WHERE TO_CHAR(date,'YYYY-MM') = ${month}
      GROUP BY category, type
      ORDER BY total DESC
    `

    const byAccount = await sql`
      SELECT account,
        COALESCE(SUM(CASE WHEN type='credit' THEN amount ELSE -amount END), 0) AS balance,
        COALESCE(SUM(CASE WHEN type='credit' THEN amount ELSE 0 END), 0) AS income,
        COALESCE(SUM(CASE WHEN type='debit'  THEN amount ELSE 0 END), 0) AS expense
      FROM transactions
      WHERE TO_CHAR(date,'YYYY-MM') = ${month}
      GROUP BY account
    `

    res.json({
      success: true,
      data: {
        month,
        ...totals,
        by_category: byCategory,
        by_account:  byAccount,
      }
    })
  } catch (err) { next(err) }
}

module.exports = { getAll, getOne, create, update, remove, summary }
