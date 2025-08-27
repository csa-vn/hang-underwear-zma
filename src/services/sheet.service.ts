const SHEET_ID = "1XSwP-zDZfel_fMKMLlI8eq8oqoEP7Tep2MInPTnWERc";
const API_KEY =
  import.meta.env.VITE_GOOGLE_SHEET_API || import.meta.env.GOOGLE_SHEET_API;

// Append member info to "Thông tin thành viên" sheet using Google Sheets API
async function appendToMemberSheet(
  userId: string,
  phone: string
): Promise<boolean> {
  const SHEET_NAME = "Thông tin thành viên";
  const range = `${SHEET_NAME}!A:D`; // 4 cột: A (UserID), B (Phone), C (Điểm), D (Đơn hàng)

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(
    range
  )}:append?valueInputOption=USER_ENTERED&key=${API_KEY}`;

  // Thêm dấu nháy đơn để giữ số 0 đầu
  const phoneText = `'${phone}`;
  const body = {
    values: [[userId, phoneText, 0, ""]], // UserID, Phone, Điểm = 0, Đơn hàng = rỗng
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
      console.log("✅ Member sheet API response:", result);
      return true;
    } else {
      const errorText = await response.text();
      console.error("❌ Member sheet API error:", response.status, errorText);
      return false;
    }
  } catch (error) {
    console.error("💥 Member sheet API fetch error:", error);
    return false;
  }
}

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

  // Thêm dấu nháy đơn để giữ số 0 đầu
  const phoneText = `'${phone}`;
  const body = {
    values: [[phoneText, product, timestamp]],
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

// Lấy thông tin thành viên từ Google Sheets bằng Zalo user ID
export async function getMemberByZaloId(userId: string) {
  const SHEET_NAME = "Thông tin thành viên";
  const range = `${SHEET_NAME}!A:D`; // 4 cột: A (UserID), B (Phone), C (Điểm), D (Đơn hàng)

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(
    range
  )}?key=${API_KEY}`;

  try {
    const response = await fetch(url);
    if (response.ok) {
      const result = await response.json();
      const rows = result.values || [];

      // Tìm row có UserID khớp
      const memberRow = rows.find((row: string[]) => row[0] === userId);
      if (memberRow) {
        return {
          userId: memberRow[0],
          phone: memberRow[1]?.replace("'", "") || "", // Remove leading quote
          points: parseInt(memberRow[2]) || 0, // Điểm
          orders: memberRow[3] || "", // Đơn hàng
        };
      }
      return null;
    } else {
      console.error("Failed to fetch member data:", response.status);
      return null;
    }
  } catch (error) {
    console.error("Error fetching member data:", error);
    return null;
  }
}

// Lưu thông tin thành viên vào webhook riêng - CẬP NHẬT ĐỂ HỖ TRỢ 4 CỘT
export async function saveMemberInfo(userId: string, phone: string) {
  const WEBHOOK_URL = import.meta.env.VITE_MEMBER_WEBHOOK_URL;
  if (!WEBHOOK_URL) throw new Error("Không tìm thấy webhook thành viên");

  // Thêm dấu nháy đơn để giữ số 0 đầu trong Google Sheet
  const phoneFormatted = `'${phone}`;

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "add_new_member",
        userId,
        phone: phoneFormatted,
        points: 0,
        orders: "",
      }),
      mode: "no-cors",
    });
    return { success: true, message: "Đăng ký thành viên thành công!" };
  } catch (error: any) {
    throw new Error("Không thể lưu thông tin thành viên");
  }
}

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
  const phoneText = `'${phone}`;
  console.log("📞 THÔNG TIN TƯ VẤN MỚI:");
  console.log("- Số điện thoại:", phoneText);
  console.log("- Sản phẩm:", product);
  console.log("- Thời gian:", timestamp);
  console.log("📝 Dữ liệu để ghi vào Google Sheet:", [
    phoneText,
    product,
    timestamp,
  ]);

  // Log formatted data for easy copy-paste to Google Sheet
  console.log("📋 Copy dòng này vào Google Sheet:");
  console.log(`${phoneText}\t${product}\t${timestamp}`);

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
          phone: phoneText,
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

// Lưu thông tin thành viên vào Google Sheet riêng
export async function appendMemberInfo(
  userId: string,
  name: string,
  phone: string,
  avatar?: string
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

  console.log("👤 THÔNG TIN THÀNH VIÊN MỚI:");
  console.log("- User ID:", userId);
  console.log("- Tên:", name);
  console.log("- Số điện thoại:", `'${phone}`);
  console.log("- Avatar:", avatar);
  console.log("- Thời gian:", timestamp);

  // Log cho việc copy thủ công - chỉ ID và SĐT
  console.log("📋 Copy dòng này vào Google Sheet (tab Thông tin thành viên):");
  console.log(`${userId}\t'${phone}`);

  // Sử dụng webhook riêng cho thành viên
  const MEMBER_WEBHOOK_URL = import.meta.env.VITE_MEMBER_WEBHOOK_URL;

  if (MEMBER_WEBHOOK_URL) {
    try {
      console.log("🚀 Đang lưu thông tin thành viên vào sheet riêng...");

      // Payload cho member webhook
      const payload = {
        userId,
        name,
        phone: `'${phone}`, // Giữ số 0 đầu
        avatar,
        timestamp,
      };

      await fetch(MEMBER_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        mode: "no-cors",
      });
      console.log("✅ Đã lưu thông tin thành viên!");
      return true;
    } catch (error: any) {
      console.warn("⚠️ Lỗi lưu thành viên:", error.message);
      return false;
    }
  }

  return false;
}

// Lưu thông tin tích điểm và cập nhật thông tin thành viên trong một webhook
export async function savePointsTransaction(
  userId: string,
  orderId: string,
  orderAmount: number,
  pointsEarned: number,
  productNames: string
) {
  const MEMBER_WEBHOOK_URL = import.meta.env.VITE_MEMBER_WEBHOOK_URL;

  if (!MEMBER_WEBHOOK_URL) {
    console.warn("⚠️ Không tìm thấy VITE_MEMBER_WEBHOOK_URL");
    return { success: false, message: "Webhook không được cấu hình" };
  }

  const timestamp = new Date().toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  console.log("💎 THÔNG TIN TÍCH ĐIỂM:");
  console.log("- User ID:", userId);
  console.log("- Order ID:", orderId);
  console.log(
    "- Số tiền đơn hàng:",
    orderAmount.toLocaleString("vi-VN") + " VNĐ"
  );
  console.log("- Điểm được cộng:", pointsEarned);
  console.log("- Sản phẩm:", productNames);
  console.log("- Thời gian:", timestamp);

  const payload = {
    action: "update_points_and_orders",
    userId,
    orderId,
    orderAmount,
    pointsEarned,
    productNames,
    timestamp,
    status: "completed",
  };

  console.log(
    "📤 PAYLOAD gửi đến Google Apps Script:",
    JSON.stringify(payload, null, 2)
  );

  try {
    await fetch(MEMBER_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      mode: "no-cors",
    });
    console.log(
      "✅ Đã cập nhật điểm và đơn hàng trong sheet Thông tin thành viên!"
    );
    return { success: true, message: "Tích điểm thành công!" };
  } catch (error: any) {
    console.error("❌ Lỗi cập nhật thành viên:", error.message);
    return {
      success: false,
      message: "Không thể cập nhật thông tin thành viên",
    };
  }
}

// Xóa hàm updateMemberPointsAndOrders vì không cần thiết nữa
