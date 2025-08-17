import { useState } from "react";
import { toast } from "react-hot-toast";
import { authorize, getUserInfo } from "zmp-sdk";

interface MemberData {
  userId: string;
  name?: string;
  avatar?: string;
  phone?: string;
}

export default function MemberInfo() {
  const [loading, setLoading] = useState(false);
  const [memberData, setMemberData] = useState<MemberData | null>(null);
  const [showPhoneForm, setShowPhoneForm] = useState(false);
  const [phone, setPhone] = useState("");

  // Lấy thông tin từ Zalo
  const handleZaloAuthorize = async () => {
    setLoading(true);
    try {
      await authorize({
        scopes: ["scope.userInfo"],
      });

      const userInfo = await getUserInfo({});
      const userId = userInfo.userInfo?.id || "";
      const userName = userInfo.userInfo?.name || "";
      const userAvatar = userInfo.userInfo?.avatar || "";

      const newMemberData: MemberData = {
        userId,
        name: userName,
        avatar: userAvatar,
      };

      setMemberData(newMemberData);
      setShowPhoneForm(true); // Hiển thị form nhập SĐT
      toast.success(`Chào mừng ${userName || "bạn"}!`);
    } catch (error) {
      console.error("Authorization error:", error);
      toast.error("Có lỗi xảy ra khi kết nối với Zalo");
    } finally {
      setLoading(false);
    }
  };

  // Lưu số điện thoại
  const handleSavePhone = () => {
    if (!phone.trim() || phone.length < 10) {
      toast.error("Vui lòng nhập số điện thoại hợp lệ");
      return;
    }

    if (memberData) {
      setMemberData({
        ...memberData,
        phone: phone,
      });
      setShowPhoneForm(false);
      toast.success("Đã lưu thông tin thành công!");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          👤
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">Thông tin thành viên</h3>
          <p className="text-sm text-gray-500">
            Kết nối với Zalo để nhận ưu đãi
          </p>
        </div>
      </div>

      {memberData ? (
        <div className="space-y-3">
          {/* Hiển thị thông tin thành viên */}
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            {memberData.avatar && (
              <img
                src={memberData.avatar}
                alt="Avatar"
                className="w-12 h-12 rounded-full"
              />
            )}
            <div className="flex-1">
              <div className="font-medium text-green-800">
                {memberData.name || "Thành viên Zalo"}
              </div>
              <div className="text-sm text-green-600">
                {memberData.phone ? `📱 ${memberData.phone}` : "📱 Chưa có SĐT"}
              </div>
            </div>
            <div className="text-2xl">✅</div>
          </div>

          {/* Form nhập số điện thoại */}
          {showPhoneForm && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700 mb-3">
                Vui lòng nhập số điện thoại để hoàn tất đăng ký:
              </p>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="Nhập số điện thoại"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={11}
                />
                <button
                  onClick={handleSavePhone}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Lưu
                </button>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 text-center">
            🎉 Bạn đã kết nối Zalo! Nhận thông báo ưu đãi.
          </div>
        </div>
      ) : (
        <div className="text-center">
          <button
            onClick={handleZaloAuthorize}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Đang kết nối...
              </>
            ) : (
              <>📱 Kết nối với Zalo</>
            )}
          </button>

          <div className="text-xs text-gray-500 mt-2">
            💡 Kết nối để nhận thông báo ưu đãi và tích điểm thành viên
          </div>
        </div>
      )}
    </div>
  );
}
