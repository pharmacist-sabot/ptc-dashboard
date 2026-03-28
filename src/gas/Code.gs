// ============================================================
// Code.gs — Google Apps Script Backend
// โรงพยาบาลสระโบสถ์ | PTC Dashboard API
//
// Deploy: Extensions → Apps Script → Deploy → Web app
//   Execute as: Me | Who has access: Anyone
// ============================================================

const DEFAULT_SHEET = 'ActionProgress'

// ── Helpers ─────────────────────────────────────────────────
function getOrCreateSheet(sheetName, defaults = []) {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  let sheet = ss.getSheetByName(sheetName)
  if (!sheet) {
    sheet = ss.insertSheet(sheetName)
    let headers = []
    if (sheetName === 'ActionProgress') {
      headers = ['id','status','progressPct','actualValue','notes','blockers','lastUpdated','updatedBy']
    } else if (sheetName === 'Meetings') {
      headers = ['id','date','title','status','reportUrl','lastUpdated']
    } else if (sheetName === 'Agendas') {
      headers = ['id','meetingId','title','proposer','description','resolution','lastUpdated']
    } else {
      headers = ['id','lastUpdated'] // fallback
    }
    
    sheet.appendRow(headers)
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#1B5E6E').setFontColor('#FFFFFF')
    
    // Pre-populate if provided
    if (defaults && defaults.length > 0) {
      defaults.forEach(d => sheet.appendRow(d))
    }
    
    sheet.setFrozenRows(1)
    sheet.autoResizeColumns(1, headers.length)
  }
  return sheet
}

function initActionProgress() {
  const defaults = [
    ['R1A1', 'not_started', 0, '', '', '', '', ''],
    ['R1A2', 'not_started', 0, '', '', '', '', ''],
    ['R1A3', 'not_started', 0, '', '', '', '', ''],
    ['R1A4', 'not_started', 0, '', '', '', '', ''],
    ['R2A1', 'not_started', 0, '', '', '', '', ''],
    ['R2A2', 'not_started', 0, '', '', '', '', ''],
    ['R2A3', 'not_started', 0, '', '', '', '', ''],
    ['R2A4', 'not_started', 0, '', '', '', '', ''],
    ['R3A1', 'not_started', 0, '', '', '', '', ''],
    ['R3A2', 'not_started', 0, '', '', '', '', ''],
    ['R3A3', 'not_started', 0, '', '', '', '', ''],
    ['R3A4', 'not_started', 0, '', '', '', '', '']
  ]
  return getOrCreateSheet('ActionProgress', defaults)
}

function buildCORSHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  }
}

function jsonResponse(data, code = 200) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: true, data, code }))
    .setMimeType(ContentService.MimeType.JSON)
}

function errorResponse(msg, code = 400) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: false, error: msg, code }))
    .setMimeType(ContentService.MimeType.JSON)
}

function sheetToObjects(sheet) {
  const values = sheet.getDataRange().getValues()
  if (values.length <= 1) return []
  const [headers, ...rows] = values
  return rows.map(row => {
    const obj = {}
    headers.forEach((h, i) => obj[h] = row[i])
    return obj
  })
}

// ── GET ──────────────────────────────────────────────────────
// Query param: table (optional, defaults to ActionProgress)
function doGet(e) {
  try {
    const tableName = (e.parameter && e.parameter.table) ? e.parameter.table : DEFAULT_SHEET
    
    let sheet;
    if (tableName === 'ActionProgress') {
      sheet = initActionProgress()
    } else {
      sheet = getOrCreateSheet(tableName)
    }
    
    const rows = sheetToObjects(sheet)
    return jsonResponse(rows)
  } catch(err) {
    return errorResponse(err.message)
  }
}

// ── POST ─────────────────────────────────────────────────────
// รับ application/x-www-form-urlencoded เพื่อหลีกเลี่ยง CORS preflight
// body fields: action (string), payload (JSON string), payloads (JSON string), table (string, optional)
function doPost(e) {
  try {
    const action = e.parameter.action
    const tableName = e.parameter.table || DEFAULT_SHEET

    if (action === 'update') {
      const payload = JSON.parse(e.parameter.payload)
      return handleUpdate(tableName, payload)
    }
    if (action === 'bulkUpdate') {
      const payloads = JSON.parse(e.parameter.payloads)
      return handleBulkUpdate(tableName, payloads)
    }
    if (action === 'delete') {
      const payload = JSON.parse(e.parameter.payload)
      return handleDelete(tableName, payload.id)
    }
    return errorResponse('Unknown action')
  } catch(err) {
    return errorResponse(err.message)
  }
}

function handleUpdate(tableName, payload) {
  let sheet;
  if (tableName === 'ActionProgress') {
    sheet = initActionProgress()
  } else {
    sheet = getOrCreateSheet(tableName)
  }

  const rows = sheet.getDataRange().getValues()
  const headers = rows[0]
  const idCol = headers.indexOf('id')
  const now = new Date().toISOString()
  
  // ensure payload has lastUpdated if applicable
  if (headers.includes('lastUpdated')) {
    payload.lastUpdated = now
  }
  // fallback for updatedBy if not provided for ActionProgress
  if (tableName === 'ActionProgress' && !payload.updatedBy) {
    payload.updatedBy = 'PTC'
  }

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][idCol] === payload.id) {
      headers.forEach((h, col) => {
        if (payload[h] !== undefined) {
          sheet.getRange(i + 1, col + 1).setValue(payload[h])
        }
      })
      return jsonResponse({ updated: payload.id, at: now })
    }
  }
  
  // If not found, append
  const newRow = headers.map(h => payload[h] !== undefined ? payload[h] : '')
  sheet.appendRow(newRow)
  return jsonResponse({ created: payload.id, at: now })
}

function handleBulkUpdate(tableName, payloads) {
  const results = payloads.map(p => {
    try { return handleUpdate(tableName, p) } catch(e) { return { error: e.message, id: p.id } }
  })
  return jsonResponse({ updated: results.length })
}

function handleDelete(tableName, id) {
  const sheet = getOrCreateSheet(tableName)
  const rows = sheet.getDataRange().getValues()
  const headers = rows[0]
  const idCol = headers.indexOf('id')
  
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][idCol] === id) {
      sheet.deleteRow(i + 1)
      return jsonResponse({ deleted: id })
    }
  }
  return errorResponse('ID not found', 404)
}
