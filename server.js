require('dotenv').config()
const app    = require('./src/app')
const initDB = require('./src/db/init')

const PORT = process.env.PORT || 5000

async function start() {
  try {
    await initDB()
    app.listen(PORT, () => {
      console.log('✅  Server is running')
    })
  } catch (err) {
    console.error('❌  Server is not running:', err.message)
    process.exit(1)
  }
}

start()
