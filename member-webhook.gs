function doPost(e) {
  try    // Thêm dữ liệu mới - chỉ 2 cột: ID và SĐT
    memberSheet.appendRow([data.userId || "", data.phone || ""]); console.log("📨 Member webhook nhận data:", e.postData.contents);

    const data = JSON.parse(e.postData.contents);
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

    // Tạo hoặc lấy sheet "Thông tin thành viên"
    let memberSheet;
    try {
      memberSheet = spreadsheet.getSheetByName("Thông tin thành viên");
    } catch (error) {
      // Tạo sheet mới nếu chưa có
      memberSheet = spreadsheet.insertSheet("Thông tin thành viên");

      // Thêm header - chỉ 2 cột: ID và SĐT
      memberSheet.getRange(1, 1, 1, 2).setValues([["ID", "SĐT"]]);

      // Format header - chỉ 2 cột
      memberSheet
        .getRange(1, 1, 1, 2)
        .setBackground("#4285f4")
        .setFontColor("white")
        .setFontWeight("bold");
    }

    // Thêm dữ liệu mới - chỉ 3 cột: ID, Tên, SĐT
    memberSheet.appendRow([
      data.userId || "",
      data.name || "Thành viên",
      data.phone || "",
    ]);

    console.log("✅ Đã lưu thành viên mới vào sheet");

    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        message: "Thành viên đã được đăng ký thành công!",
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error("❌ Lỗi member webhook:", error);

    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: error.toString(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
