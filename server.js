require('dotenv').config()
const app    = require('./src/app')
const initDB = require('./src/db/init')

const PORT = process.env.PORT || 5000

async function start() {
  try {
    await initDB()
    app.listen(PORT, () => {
      console.log(`🚀  SavingsBE running on http://localhost:${PORT}`)
      console.log(`📊  Health: http://localhost:${PORT}/health`)
      console.log(`💾  DB: Neon PostgreSQL`)
    })
  } catch (err) {
    console.error('❌  Failed to start server:', err.message)
    process.exit(1)
  }
}

start()
