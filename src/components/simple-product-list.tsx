import { useAtomValue } from "jotai";
import { productsState, uiModeState, userState } from "@/state";
import { formatPrice } from "@/utils/format";
import Button from "@/components/button";
import toast from "react-hot-toast";
import { useState } from "react";
import { appendContactRow } from "@/services/sheet.service";

export default function SimpleProductList() {
  const products = useAtomValue(productsState);
  const uiMode = useAtomValue(uiModeState);
  const user = useAtomValue(userState);

  if (uiMode !== "simple") return null;

  // State cho form liên hệ
  const [showForm, setShowForm] = useState<{ product: string } | null>(null);
  const [form, setForm] = useState({ phone: "" });
  const [loading, setLoading] = useState(false);

  // Handler mở form
  const handleConsultation = (productName: string) => {
    // Log userId khi ấn vào sản phẩm
    const userId = user?.userInfo?.id;
    console.log("[ZALO USER ID]", userId);
    setShowForm({ product: productName });
    setForm({ phone: "" });
  };

  // Handler submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phone.trim()) {
      toast.error("Vui lòng nhập số điện thoại!");
      return;
    }
    setLoading(true);
    try {
      const name = user?.userInfo?.name || "";
      await appendContactRow(name, form.phone, showForm?.product || "");
      toast.success("Nhân viên sẽ sớm liên hệ cho bạn!");
      setShowForm(null);
    } catch (err: any) {
      toast.error(
        "Lưu thông tin thất bại: " + (err?.message || "Lỗi không xác định")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="simple-product-layout bg-white min-h-screen p-4">
      {/* Form nhập thông tin khách hàng */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md space-y-6"
          >
            <h2 className="text-2xl font-bold text-center mb-2">
              Đăng ký tư vấn sản phẩm
            </h2>
            <div>
              <label className="block mb-1 font-semibold">Số điện thoại</label>
              <input
                type="tel"
                className="w-full border px-3 py-2 rounded-lg"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                disabled={loading}
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-black text-yellow-400 font-bold py-3 rounded-lg text-lg"
                disabled={loading}
              >
                {loading ? "Đang gửi..." : "Gửi thông tin"}
              </button>
              <button
                type="button"
                className="flex-1 bg-gray-300 text-black font-bold py-3 rounded-lg text-lg"
                onClick={() => setShowForm(null)}
                disabled={loading}
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}
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

            {/* Mô tả sản phẩm bỏ ở chế độ đơn giản */}

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
