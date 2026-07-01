/**
 * EITPL — Google Apps Script for live stats (optional).
 *
 * Setup:
 * 1. New Google Sheet → Extensions → Apps Script → paste this file.
 * 2. Deploy → New deployment → Web app → Execute as: Me, Access: Anyone.
 * 3. Copy the URL into js/config/constants.js → STATS.publicUrl and STATS.ingestUrl.
 *
 * The sheet stores anonymous rows: timestamp | level | score
 */

function doGet() {
  return jsonResponse_(aggregateStats_());
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var level = Number(body.level);
    var score = Number(body.score);

    if (!(level >= 1 && level <= 5 && score >= 0 && score <= 22)) {
      return jsonResponse_({ ok: false, error: "invalid" });
    }

    getSheet_().appendRow([new Date(), level, score]);
    return jsonResponse_({ ok: true });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) });
  }
}

function aggregateStats_() {
  var rows = getSheet_().getDataRange().getValues();
  var byLevel = [0, 0, 0, 0, 0];
  var scoreSum = 0;
  var total = 0;

  for (var i = 1; i < rows.length; i++) {
    var level = Number(rows[i][1]);
    var score = Number(rows[i][2]);
    if (level >= 1 && level <= 5) {
      byLevel[level - 1]++;
      total++;
      scoreSum += score;
    }
  }

  var level4Plus = byLevel[3] + byLevel[4];

  return {
    updatedAt: new Date().toISOString(),
    total: total,
    avgScore: total ? Math.round((scoreSum / total) * 10) / 10 : 0,
    level4PlusPct: total ? Math.round((level4Plus / total) * 100) : 0,
    byLevel: byLevel,
  };
}

function getSheet_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("completions");
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("completions");
    sheet.appendRow(["timestamp", "level", "score"]);
  }
  return sheet;
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}
