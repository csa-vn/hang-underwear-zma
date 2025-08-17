import { useState, useEffect } from "react";
import { useAtomValue } from "jotai";
import { userState } from "@/state";
import toast from "react-hot-toast";
import { saveMemberInfo } from "@/services/sheet.service";

interface MemberData {
  userId: string;
  phone: string;
  registeredAt: string;
}

export default function MemberInfo() {
  const user = useAtomValue(userState);
  const [phone, setPhone] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [memberData, setMemberData] = useState<MemberData | null>(null);

  // Load member data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem("memberInfo");
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setMemberData(data);
      } catch (e) {
        console.error("Failed to parse member data:", e);
      }
    }
  }, []);

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

      // Save to localStorage
      const memberInfo: MemberData = {
        userId,
        phone,
        registeredAt: new Date().toISOString(),
      };
      localStorage.setItem("memberInfo", JSON.stringify(memberInfo));
      setMemberData(memberInfo);

      toast.success("Đã đăng ký thông tin thành viên!");
      setPhone("");
      setShowPopup(false);
    } catch (err: any) {
      console.error("Lỗi đăng ký:", err);
      toast.error("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleEditInfo = () => {
    setPhone(memberData?.phone || "");
    setShowPopup(true);
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

        {/* Hiển thị thông tin thành viên hoặc nút đăng ký */}
        {memberData ? (
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-center mb-3">
              <div className="text-green-600 font-semibold mb-2">
                ✅ Đã đăng ký thành viên
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Số điện thoại:</span>
                <span className="font-semibold">{memberData.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Ngày đăng ký:</span>
                <span className="text-sm">
                  {new Date(memberData.registeredAt).toLocaleDateString(
                    "vi-VN"
                  )}
                </span>
              </div>
            </div>
            <button
              onClick={handleEditInfo}
              className="w-full mt-3 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 text-sm"
            >
              ✏️ Cập nhật thông tin
            </button>
          </div>
        ) : (
          <div className="text-center">
            <button
              onClick={() => setShowPopup(true)}
              className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 font-medium"
            >
              📝 Đăng ký thành viên
            </button>
            <div className="text-xs text-gray-500 mt-2">
              Đăng ký để nhận ưu đãi và tư vấn
            </div>
          </div>
        )}
      </div>

      {/* Popup nhập số điện thoại */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">
                {memberData ? "Cập nhật thông tin" : "Đăng ký thành viên"}
              </h4>
              <button
                onClick={() => {
                  setShowPopup(false);
                  setPhone("");
                }}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại của bạn:
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0987654321"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={loading}
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPopup(false);
                    setPhone("");
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400"
                  disabled={loading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50 font-medium"
                >
                  {loading
                    ? "Đang lưu..."
                    : memberData
                    ? "Cập nhật"
                    : "Đăng ký"}
                </button>
              </div>
            </form>

            <div className="text-xs text-gray-500 mt-3 text-center">
              💡 Số điện thoại sẽ được dùng để liên hệ tư vấn và gửi thông báo
              ưu đãi.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
