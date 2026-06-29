// ─────────────────────────────────────────────────────────────
// GOOGLE APPS SCRIPT — Backend for Home Expense Tracker
// ─────────────────────────────────────────────────────────────
//
// SETUP INSTRUCTIONS:
// 1. Create a new Google Sheet
// 2. Extensions → Apps Script
// 3. Replace all code with this file
// 4. Save (💾)
// 5. Deploy → New Deployment
//    - Type: Web app
//    - Execute as: Me
//    - Who has access: Anyone
// 6. Copy the deployment URL
// 7. Paste it in frontend/.env as VITE_API_URL
//
// The script auto-creates the "Expenses" tab with headers on first call.
// ─────────────────────────────────────────────────────────────

const SHEET_NAME = "Expenses";
const HEADERS = [
  "id", "date", "amount", "spentBy", "category",
  "subCategory", "subSubCategory", "mealTag", "isRefund", "notes",
];

// ─── Helpers ───

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    sheet.setFrozenRows(1);

    // Format ID and date columns to avoid auto-conversion
    sheet.getRange("A:A").setNumberFormat("@"); // plain text for IDs
    sheet.getRange("B:B").setNumberFormat("yyyy-mm-dd");
  }
  return sheet;
}

function rowToExpense(row) {
  const obj = {};
  HEADERS.forEach((h, i) => {
    let val = row[i];
    if (h === "amount") {
      val = Number(val) || 0;
    } else if (h === "isRefund") {
      val = val === true || val === "true" || val === "TRUE";
    } else if (h === "date" && val instanceof Date) {
      const y = val.getFullYear();
      const m = String(val.getMonth() + 1).padStart(2, "0");
      const d = String(val.getDate()).padStart(2, "0");
      val = `${y}-${m}-${d}`;
    } else {
      // FIX #7: Coerce everything else to string (especially IDs)
      val = val == null ? "" : String(val);
    }
    obj[h] = val;
  });
  return obj;
}

function expenseToRow(expense) {
  return HEADERS.map((h) => {
    const v = expense[h];
    if (h === "isRefund") return v ? "true" : "false";
    if (h === "amount") return Number(v) || 0;
    if (v == null) return "";
    return String(v);
  });
}

function findRowById(sheet, id) {
  // Compare as strings to dodge any auto-conversion issues
  const target = String(id);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === target) return i + 1;
  }
  return -1;
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── GET ───

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || "getAll";
    if (action !== "getAll") {
      return jsonResponse({ success: false, error: "Unknown action" });
    }
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    const expenses = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) expenses.push(rowToExpense(data[i]));
    }
    return jsonResponse({ success: true, expenses });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

// ─── POST ───

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const { action } = body;
    const sheet = getOrCreateSheet();

    switch (action) {
      case "add": {
        if (!body.expense || !body.expense.id) {
          return jsonResponse({ success: false, error: "Missing expense.id" });
        }
        // Idempotency: skip if id already exists
        if (findRowById(sheet, body.expense.id) > 0) {
          return jsonResponse({ success: true, expense: body.expense, note: "Already exists" });
        }
        sheet.appendRow(expenseToRow(body.expense));
        return jsonResponse({ success: true, expense: body.expense });
      }

      case "update": {
        const { expense } = body;
        if (!expense || !expense.id) {
          return jsonResponse({ success: false, error: "Missing expense.id" });
        }
        const rowNum = findRowById(sheet, expense.id);
        if (rowNum > 0) {
          sheet.getRange(rowNum, 1, 1, HEADERS.length).setValues([expenseToRow(expense)]);
          return jsonResponse({ success: true, expense });
        }
        sheet.appendRow(expenseToRow(expense));
        return jsonResponse({ success: true, expense, note: "Added as new" });
      }

      case "delete": {
        if (!body.id) {
          return jsonResponse({ success: false, error: "Missing id" });
        }
        const rowNum = findRowById(sheet, body.id);
        if (rowNum > 0) {
          sheet.deleteRow(rowNum);
          return jsonResponse({ success: true, id: body.id });
        }
        return jsonResponse({ success: true, id: body.id, note: "Already deleted" });
      }

      case "syncAll": {
        const lastRow = sheet.getLastRow();
        if (lastRow > 1) sheet.deleteRows(2, lastRow - 1);
        const expenses = Array.isArray(body.expenses) ? body.expenses : [];
        if (expenses.length > 0) {
          const rows = expenses.map(expenseToRow);
          sheet.getRange(2, 1, rows.length, HEADERS.length).setValues(rows);
        }
        return jsonResponse({ success: true, count: expenses.length });
      }

      default:
        return jsonResponse({ success: false, error: "Unknown action: " + action });
    }
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}
