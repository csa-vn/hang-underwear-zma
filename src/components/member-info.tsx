import { useState } from "react";
import { useAtomValue } from "jotai";
import { userState } from "@/state";
import toast from "react-hot-toast";
import { saveMemberInfo } from "@/services/sheet.service";

export default function MemberInfo() {
  const user = useAtomValue(userState);
  const [phone, setPhone] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Handler submit form - lưu vào sheet "Thông tin thành viên"
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error("Vui lòng nhập số điện thoại!");
      return;
    }

    if (!user?.userInfo?.id) {
      toast.error("Không thể lấy thông tin user");
      return;
    }

    setLoading(true);
    try {
      const userId = user.userInfo.id;

      // Lưu trực tiếp vào sheet "Thông tin thành viên"
      const result = await saveMemberInfo(userId, phone);

      console.log("👤 THÀNH VIÊN MỚI ĐĂNG KÝ:");
      console.log("- User ID:", userId);
      console.log("- Số điện thoại:", `'${phone}`);

      toast.success("Đã đăng ký thông tin thành viên!");
      setPhone("");
    } catch (err: any) {
      console.error("Lỗi đăng ký:", err);
      toast.error("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4 text-center">
        Thông tin thành viên
      </h3>

      <div className="space-y-3">
        {/* Hiển thị User ID */}
        <div className="text-center">
          <div className="text-sm text-gray-500">User ID:</div>
          <div className="font-mono text-sm">
            {user?.userInfo?.id?.slice(-8) || "********"}
          </div>
        </div>

        {/* Form nhập số điện thoại luôn hiển thị */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="block text-sm font-medium text-blue-800 mb-1">
                Số điện thoại của bạn:
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0987654321"
                className="w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50 font-medium"
            >
              {loading ? "Đang lưu..." : "📝 Đăng ký thành viên"}
            </button>
          </form>
        </div>

        {/* Thông tin bổ sung */}
        <div className="text-xs text-gray-500 mt-4 p-2 bg-gray-50 rounded">
          💡 Số điện thoại sẽ được dùng để liên hệ tư vấn và gửi thông báo ưu
          đãi.
        </div>
      </div>
    </div>
  );
}
