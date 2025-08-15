import { useAtomValue } from "jotai";
import { productsState, uiModeState } from "@/state";
import { formatPrice } from "@/utils/format";
import Button from "@/components/button";

export default function SimpleProductList() {
  const products = useAtomValue(productsState);
  const uiMode = useAtomValue(uiModeState);

  if (uiMode !== "simple") return null;

  const handleConsultation = (productName: string) => {
    // Tích hợp với Zalo OA hoặc hotline
    const message = `Tôi muốn tư vấn về sản phẩm: ${productName}`;
    const phoneNumber = "0123456789"; // Số hotline
    const zaloUrl = `https://zalo.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(zaloUrl, "_blank");
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

            {/* Nút tư vấn - to và nổi bật */}
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
