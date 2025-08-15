// Đọc dữ liệu từ sheet (dùng cho productsState...)
export async function fetchSheetData() {
  const SHEET_NAME = "Sản Phẩm";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(SHEET_NAME)}?key=${API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch sheet data");
  const data = await response.json();
  return data.values; // Array of rows
}
const SHEET_ID = "1XSwP-zDZfel_fMKMLlI8eq8oqoEP7Tep2MInPTnWERc";
const API_KEY =
  import.meta.env.VITE_GOOGLE_SHEET_API || import.meta.env.GOOGLE_SHEET_API;

// Ghi dữ liệu vào sheet (append row)
export async function appendContactRow(
  name: string,
  phone: string,
  product: string
) {
  const SHEET_NAME = "Liên hệ khách hàng";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(
    SHEET_NAME
  )}:append?valueInputOption=USER_ENTERED&key=${API_KEY}`;
  const body = {
    values: [[name, phone, product]],
  };
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error("Không thể lưu thông tin khách hàng");
  return response.json();
}
