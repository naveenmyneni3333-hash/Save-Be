const ExcelJS = require('exceljs')
const PDFKit  = require('pdfkit')
const sql     = require('../db/neon')

async function getRows(query) {
  const { month, type, account } = query
  if (month && type && account)
    return sql`SELECT * FROM transactions WHERE TO_CHAR(date,'YYYY-MM')=${month} AND type=${type} AND account=${account} ORDER BY date DESC`
  if (month && type)
    return sql`SELECT * FROM transactions WHERE TO_CHAR(date,'YYYY-MM')=${month} AND type=${type} ORDER BY date DESC`
  if (month && account)
    return sql`SELECT * FROM transactions WHERE TO_CHAR(date,'YYYY-MM')=${month} AND account=${account} ORDER BY date DESC`
  if (month)
    return sql`SELECT * FROM transactions WHERE TO_CHAR(date,'YYYY-MM')=${month} ORDER BY date DESC`
  return sql`SELECT * FROM transactions ORDER BY date DESC`
}

function fmtDate(d) {
  return d?.toISOString?.().split('T')[0] ?? String(d)
}

// GET /api/export/excel?month=2025-04
async function exportExcel(req, res, next) {
  try {
    const rows = await getRows(req.query)
    const wb   = new ExcelJS.Workbook()
    const ws   = wb.addWorksheet('Transactions')

    ws.columns = [
      { header: 'Date',     key: 'date',     width: 14 },
      { header: 'Title',    key: 'title',    width: 24 },
      { header: 'Item',     key: 'item',     width: 20 },
      { header: 'Type',     key: 'type',     width: 10 },
      { header: 'Category', key: 'category', width: 16 },
      { header: 'Account',  key: 'account',  width: 14 },
      { header: 'Amount',   key: 'amount',   width: 12 },
      { header: 'Note',     key: 'note',     width: 28 },
    ]
    ws.getRow(1).font = { bold: true }
    rows.forEach(r => ws.addRow({ ...r, date: fmtDate(r.date) }))

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', 'attachment; filename="transactions.xlsx"')
    await wb.xlsx.write(res)
    res.end()
  } catch (err) { next(err) }
}

// GET /api/export/pdf?month=2025-04
async function exportPDF(req, res, next) {
  try {
    const rows = await getRows(req.query)
    const doc  = new PDFKit({ margin: 40, size: 'A4' })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename="transactions.pdf"')
    doc.pipe(res)

    doc.fontSize(16).font('Helvetica-Bold').text('Transactions Report', { align: 'center' })
    doc.moveDown()

    const headers = ['Date', 'Title', 'Type', 'Category', 'Account', 'Amount']
    const widths  = [80, 150, 55, 80, 70, 70]
    const startX  = 40

    // Table header
    doc.fontSize(9).font('Helvetica-Bold')
    headers.forEach((h, i) => {
      doc.text(h, startX + widths.slice(0, i).reduce((a, b) => a + b, 0), doc.y, { width: widths[i], continued: i < headers.length - 1 })
    })
    doc.moveDown(0.2)
    doc.moveTo(startX, doc.y).lineTo(555, doc.y).stroke().moveDown(0.3)

    // Rows
    doc.font('Helvetica')
    rows.forEach(r => {
      const vals = [fmtDate(r.date), r.title, r.type, r.category, r.account, `Rs.${Number(r.amount).toFixed(2)}`]
      const rowY = doc.y
      vals.forEach((v, i) => {
        doc.text(String(v ?? ''), startX + widths.slice(0, i).reduce((a, b) => a + b, 0), rowY, { width: widths[i], continued: i < vals.length - 1 })
      })
      doc.moveDown(0.3)
    })

    doc.end()
  } catch (err) { next(err) }
}

module.exports = { exportExcel, exportPDF }
