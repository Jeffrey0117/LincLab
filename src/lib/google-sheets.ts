/**
 * Google Sheets API Client
 * 使用 API Key 方式存取 Google Sheets API v4
 * 注意：Sheet 必須設為「任何人都能編輯」
 */

const GOOGLE_SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

export interface SheetRow {
  title: string;
  og_image: string;
  affiliate_url: string;
  created_at: string;
}

/**
 * 從 Google Sheets URL 提取 spreadsheetId
 * 支援格式：
 * - https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
 * - https://docs.google.com/spreadsheets/d/SPREADSHEET_ID
 */
export function extractSpreadsheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

/**
 * 測試 Sheet 連線
 * 確認 spreadsheetId 是否有效且可存取
 */
export async function testSheetConnection(spreadsheetId: string): Promise<{
  success: boolean;
  title?: string;
  error?: string;
}> {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: 'GOOGLE_API_KEY not configured'
    };
  }

  try {
    const response = await fetch(
      `${GOOGLE_SHEETS_API_BASE}/${spreadsheetId}?key=${apiKey}&fields=properties.title`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error?.message || `HTTP ${response.status}`
      };
    }

    const data = await response.json();
    return {
      success: true,
      title: data.properties?.title
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 附加資料到 Google Sheet
 * @param spreadsheetId - Google Sheet ID
 * @param sheetName - 工作表名稱 (預設 Sheet1)
 * @param rows - 要附加的資料列
 */
export async function appendToSheet(
  spreadsheetId: string,
  sheetName: string,
  rows: SheetRow[]
): Promise<{
  success: boolean;
  updatedRows?: number;
  error?: string;
}> {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: 'GOOGLE_API_KEY not configured'
    };
  }

  if (rows.length === 0) {
    return {
      success: true,
      updatedRows: 0
    };
  }

  // 轉換為二維陣列格式
  const values = rows.map(row => [
    row.title,
    row.og_image,
    row.affiliate_url,
    row.created_at
  ]);

  const range = `${sheetName}!A:D`;

  try {
    const response = await fetch(
      `${GOOGLE_SHEETS_API_BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}:append?key=${apiKey}&valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error?.message || `HTTP ${response.status}`
      };
    }

    const data = await response.json();
    return {
      success: true,
      updatedRows: data.updates?.updatedRows || rows.length
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 在 Sheet 中新增標題列
 * @param spreadsheetId - Google Sheet ID
 * @param sheetName - 工作表名稱
 */
export async function addHeaderRow(
  spreadsheetId: string,
  sheetName: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: 'GOOGLE_API_KEY not configured'
    };
  }

  const headers = [['標題', '圖片URL', '分潤連結', '建立時間']];
  const range = `${sheetName}!A1:D1`;

  try {
    const response = await fetch(
      `${GOOGLE_SHEETS_API_BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}?key=${apiKey}&valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: headers
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error?.message || `HTTP ${response.status}`
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
