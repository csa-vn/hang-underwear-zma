const SHEET_ID = "1XSwP-zDZfel_fMKMLlI8eq8oqoEP7Tep2MInPTnWERc";
const SHEET_NAME = "Sheet1"; // Change if your tab name is different
const API_KEY =
  import.meta.env.VITE_GOOGLE_SHEET_API || import.meta.env.GOOGLE_SHEET_API;

export async function fetchSheetData() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch sheet data");
  const data = await response.json();
  return data.values; // Array of rows
}
