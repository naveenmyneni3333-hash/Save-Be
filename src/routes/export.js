const router = require('express').Router()
const auth   = require('../middleware/auth')
const ctrl   = require('../controllers/exportController')

router.get('/excel', auth, ctrl.exportExcel)
router.get('/pdf',   auth, ctrl.exportPDF)

module.exports = router
