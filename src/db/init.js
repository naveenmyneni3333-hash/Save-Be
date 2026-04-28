const sql = require('./neon')

async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS accounts (
      id         SERIAL PRIMARY KEY,
      name       VARCHAR(50)  NOT NULL UNIQUE,
      color      VARCHAR(20)  NOT NULL DEFAULT '#6366f1',
      created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id         SERIAL PRIMARY KEY,
      name       VARCHAR(100) NOT NULL,
      email      VARCHAR(150) NOT NULL UNIQUE,
      password   VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS transactions (
      id         SERIAL PRIMARY KEY,
      title      VARCHAR(150) NOT NULL,
      item       VARCHAR(150),
      amount     NUMERIC(12,2) NOT NULL CHECK (amount > 0),
      type       VARCHAR(10)  NOT NULL CHECK (type IN ('debit','credit')),
      category   VARCHAR(50)  NOT NULL,
      account    VARCHAR(50)  NOT NULL,
      note       TEXT,
      date       DATE         NOT NULL DEFAULT CURRENT_DATE,
      created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `

  // Seed default accounts if empty
  const existing = await sql`SELECT COUNT(*) AS cnt FROM accounts`
  if (parseInt(existing[0].cnt) === 0) {
    await sql`
      INSERT INTO accounts (name, color) VALUES
        ('Cash',  '#10b981'),
        ('Bank',  '#6366f1'),
        ('UPI',   '#f59e0b')
    `
  }

  console.log('✅  Database tables ready')
}

module.exports = initDB
