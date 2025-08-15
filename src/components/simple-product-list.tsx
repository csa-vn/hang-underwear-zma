import { useAtomValue } from "jotai";
import { productsState, uiModeState, userState } from "@/state";
import { formatPrice } from "@/utils/format";
import Button from "@/components/button";
import toast from "react-hot-toast";

// Hàm gửi OA thật, access token truyền qua header
async function sendOAMessage(userId: string, productName: string) {
  const accessToken =
    "sYRdGtSj3HdR8-T8V2W56TidvajwC6zldcpgI45i55cA98r0HYu_4v1oeGfSBHqal5MC4smdDqQCHADISKW3VT95bcGqHJPpo2EkQJ5P1txiD9Xs6ZGIUzXvbKnzTJLZdY_JQdnNS3lRE-qYFMPXTPyc_4CwJreGtW7R9GvzVIJN2kWK9LzAEi8BopmaN3Lfm3IoCZbY5sUQBez0Ia0mUUmmgLmWN0ne_bIMMmWWA7JiQBHj3WG1UlO4vKakKLHUpIVHUIzqQ2dVV_SW1pnT8i9XoWXdEsbOfrhvNbapUMIgKfDrUWOPNjj8d0Kz4mC7qMs9LnLjEs7iODfj6WPgL-TwYmmQ6cfSp7UD3HG_E3IrIgO34ISvDxDMtZPHB7Gc_2EH02ij2YdBMemuAJDcCj15xMK6EN5iPbIKETDZUZ4760";
  const apiUrl = "https://openapi.zalo.me/v2.0/oa/message";
  const message = `Bạn quan tâm sản phẩm ${productName} ?`;
  console.log("[OA DEBUG] Chuẩn bị gửi OA:", {
    userId,
    productName,
    apiUrl,
    message,
  });
  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: accessToken,
      },
      body: JSON.stringify({
        recipient: { user_id: userId },
        message: { text: message },
      }),
    });
    console.log("[OA DEBUG] Đã gửi fetch, status:", res.status);
    const data = await res.json();
    console.log("[OA DEBUG] Response data:", data);
    return data;
  } catch (err) {
    console.error("[OA DEBUG] Lỗi gửi OA:", err);
    throw err;
  }
}

export default function SimpleProductList() {
  const products = useAtomValue(productsState);
  const uiMode = useAtomValue(uiModeState);
  const user = useAtomValue(userState);

  if (uiMode !== "simple") return null;

  // Handler gửi OA khi tư vấn
  const handleConsultation = async (productName: string) => {
    const userId = user?.userInfo?.id;
    console.log("[OA DEBUG] handleConsultation gọi với:", {
      userId,
      productName,
    });
    if (!userId) {
      toast.error("Không lấy được userId Zalo!");
      return;
    }
    toast.promise(sendOAMessage(userId, productName), {
      loading: "Đang gửi tin nhắn OA...",
      success: "Đã gửi tin nhắn OA cho bạn!",
      error: (err) =>
        `Gửi OA thất bại: ${err?.message || "Lỗi không xác định"}`,
    });
  };

  return (
    <div className="simple-product-layout bg-white min-h-screen p-4">
      {/* Danh sách sản phẩm siêu đơn giản */}
      <div className="space-y-6">
        {products.slice(0, 10).map((product) => (
          <div key={product.id} className="product-card">
            {/* Ảnh sản phẩm - to và rõ ràng */}
            <div className="text-center mb-6">
              <img
                src={product.image}
                alt={product.name}
                className="w-full max-w-xs mx-auto h-80 object-cover"
                style={{ aspectRatio: "1/1" }}
              />
            </div>

            {/* Tên sản phẩm - font to, rõ ràng */}
            <h2 className="text-3xl font-bold text-black mb-4 text-center leading-tight">
              {product.name}
            </h2>

            {/* Giá - nổi bật, dễ nhìn */}
            <div className="text-center mb-6">
              <span className="price text-4xl font-bold text-black bg-yellow-400 px-4 py-2 rounded-lg inline-block border-2 border-black">
                {formatPrice(product.price)}
              </span>
            </div>

            {/* Mô tả sản phẩm - ngắn gọn */}
            <div className="mb-6">
              {product.details.map(
                (detail, idx) =>
                  detail.title === "Mô tả" && (
                    <div
                      key={idx}
                      className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-300"
                    >
                      <p className="text-xl text-black leading-relaxed text-center">
                        {detail.content}
                      </p>
                    </div>
                  )
              )}
            </div>

            {/* Chỉ giữ nút tư vấn ngay */}
            <div className="text-center">
              <button
                onClick={() => handleConsultation(product.name)}
                className="consultation-btn w-full bg-black text-yellow-400 text-2xl font-bold py-6 px-8 rounded-xl border-2 border-yellow-400"
              >
                📞 TƯ VẤN NGAY
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
