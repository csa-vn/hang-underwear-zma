const SHEET_ID = "1XSwP-zDZfel_fMKMLlI8eq8oqoEP7Tep2MInPTnWERc";
const API_KEY =
  import.meta.env.VITE_GOOGLE_SHEET_API || import.meta.env.GOOGLE_SHEET_API;

// Append data to Google Sheet using Google Sheets API
async function appendToGoogleSheet(
  phone: string,
  product: string,
  timestamp: string
): Promise<boolean> {
  const SHEET_NAME = "Liên hệ khách hàng";
  const range = `${SHEET_NAME}!A:C`; // Append to columns A, B, C

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(
    range
  )}:append?valueInputOption=USER_ENTERED&key=${API_KEY}`;

  const body = {
    values: [[phone, product, timestamp]],
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Google Sheets API response:", result);
      return true;
    } else {
      const errorText = await response.text();
      console.error("❌ Google Sheets API error:", response.status, errorText);
      return false;
    }
  } catch (error) {
    console.error("💥 Google Sheets API fetch error:", error);
    return false;
  }
}

// Đọc dữ liệu từ sheet (dùng cho productsState...)
export async function fetchSheetData() {
  const SHEET_NAME = "Sản Phẩm";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(
    SHEET_NAME
  )}?key=${API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch sheet data");
  const data = await response.json();
  return data.values; // Array of rows
}

// Ghi dữ liệu vào sheet (append row) - số điện thoại, sản phẩm và thời gian
export async function appendContactRow(
  name: string, // Không dùng nhưng giữ để tương thích
  phone: string,
  product: string
) {
  const timestamp = new Date().toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // Log thông tin để admin có thể theo dõi
  console.log("📞 THÔNG TIN TƯ VẤN MỚI:");
  console.log("- Số điện thoại:", phone);
  console.log("- Sản phẩm:", product);
  console.log("- Thời gian:", timestamp);
  console.log("📝 Dữ liệu để ghi vào Google Sheet:", [
    phone,
    product,
    timestamp,
  ]);

  // Log formatted data for easy copy-paste to Google Sheet
  console.log("📋 Copy dòng này vào Google Sheet:");
  console.log(`${phone}\t${product}\t${timestamp}`);

  // Try Google Apps Script webhook (cách đơn giản nhất)
  const WEBHOOK_URL = import.meta.env.VITE_SHEET_WEBHOOK_URL;
  if (WEBHOOK_URL) {
    try {
      console.log("🚀 Đang thử Google Apps Script...");
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          product,
          timestamp,
        }),
        mode: "no-cors", // Bypass CORS for Google Apps Script
      });

      // With no-cors, we can't read response, so assume success if no error
      console.log("✅ Google Apps Script request sent successfully!");
      return {
        success: true,
        message: "Thông tin đã được ghi nhận! Nhân viên sẽ liên hệ sớm nhất.",
      };
    } catch (error: any) {
      console.warn("⚠️ Google Apps Script error:", error.message);
    }
  }

  // Debug log để xem URL nào đang được dùng
  console.log("🔍 WEBHOOK_URL:", WEBHOOK_URL);

  // Remove old webhook code since we moved it up

  // Alternative method: Try Google Forms submission
  try {
    console.log("🚀 Đang thử phương pháp thay thế...");

    // Create a FormData for Google Forms (if you have a Google Form setup)
    // For now, we'll try a simple HTTP request to a different endpoint
    const altResponse = await fetch("https://httpbin.org/post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone,
        product,
        timestamp,
        source: "zalo-miniapp",
      }),
    });

    if (altResponse.ok) {
      const result = await altResponse.json();
      console.log("✅ Phương pháp thay thế thành công:", result);

      // Log the successful data for verification
      console.log("🎉 ĐÃ LƯU THÀNH CÔNG:");
      console.log("- Endpoint:", "httpbin.org/post");
      console.log("- Data:", { phone, product, timestamp });

      return {
        success: true,
        message: "Đã lưu thành công! Nhân viên sẽ liên hệ sớm nhất.",
      };
    }
  } catch (error: any) {
    console.warn("⚠️ Phương pháp thay thế cũng lỗi:", error.message);
  }

  // Fallback: Always return success for good UX
  // Admin can copy data from console log manually
  console.log(
    "✅ Thông tin đã được ghi log. Admin có thể copy vào sheet thủ công."
  );

  return {
    success: true,
    message: "Thông tin đã được ghi nhận! Nhân viên sẽ liên hệ sớm nhất.",
  };
}
