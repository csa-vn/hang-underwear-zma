// src/services/oa.service.ts
// Fake OA notification service for Zalo mini app demo

export async function sendOANotification({
  userId,
  productName,
}: {
  userId: string;
  productName: string;
}) {
  // Giả lập gửi thông báo OA (ở đây chỉ log, thực tế sẽ gọi API OA)
  // TODO: Thay thế bằng API thật nếu có
  const message = `Bạn quan tâm sản phẩm ${productName} ?`;
  console.log(`[OA] Gửi cho userId=${userId}: ${message}`);
  // Có thể trả về Promise.resolve() để giả lập async
  return Promise.resolve();
}
