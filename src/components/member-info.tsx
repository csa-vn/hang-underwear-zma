import { useState, useEffect } from "react";
// @ts-ignore
import zmp from "zmp-sdk";
import { toast } from "react-hot-toast";
import { authorize, getUserInfo } from "zmp-sdk";
import * as sheetService from "../services/sheet.service";

interface MemberData {
  userId: string;
  name?: string;
  avatar?: string;
  phone?: string;
  registeredAt?: string;
}

export default function MemberInfo() {
  const [loading, setLoading] = useState(false);
  const [memberData, setMemberData] = useState<MemberData | null>(null);
  const [showPhoneForm, setShowPhoneForm] = useState(false);
  const [phone, setPhone] = useState("");
  const [loadingData, setLoadingData] = useState(false);
  const [forceLogout, setForceLogout] = useState(false); // Flag để force logout

  // Load data từ Google Sheets khi có user ID
  const loadMemberFromSheets = async (userId: string) => {
    try {
      setLoadingData(true);
      const existingMember = await sheetService.getMemberByZaloId(userId);
      if (existingMember) {
        return existingMember;
      }
      return null;
    } catch (error) {
      console.error("Failed to load member data from sheets:", error);
      return null;
    } finally {
      setLoadingData(false);
    }
  };

  // Kiểm tra Zalo session khi component mount
  const checkZaloSession = async () => {
    // Nếu đã force logout, không check session nữa
    if (forceLogout) {
      console.log("🔍 DEBUG - Force logout enabled, skipping session check");
      return;
    }

    try {
      console.log("🔍 DEBUG - Checking existing Zalo session...");
      const userInfo = await getUserInfo();
      console.log("🔍 DEBUG - checkZaloSession response:", userInfo);

      if (userInfo && userInfo.userInfo?.id) {
        console.log(
          "🔍 DEBUG - User already logged in, userId:",
          userInfo.userInfo.id
        );
        // User đã đăng nhập Zalo, load data từ Google Sheets
        const existingMember = await loadMemberFromSheets(userInfo.userInfo.id);
        if (existingMember) {
          // Đã có data, cập nhật với thông tin Zalo mới nhất
          setMemberData({
            userId: userInfo.userInfo.id,
            name: userInfo.userInfo.name || "",
            avatar: userInfo.userInfo.avatar || "",
            phone: existingMember.phone || "",
          });
        } else {
          // Chưa có data, hiển thị form để nhập phone
          setMemberData({
            userId: userInfo.userInfo.id,
            name: userInfo.userInfo.name || "",
            avatar: userInfo.userInfo.avatar || "",
          });
          setShowPhoneForm(true);
        }
      }
    } catch (error) {
      // User chưa đăng nhập Zalo, không làm gì
      console.log("User not logged in to Zalo yet");
    } finally {
      setLoadingData(false);
    }
  };

  // Load data từ Google Sheets khi component mount (check Zalo session)
  useEffect(() => {
    checkZaloSession();
  }, []);

  // Lấy thông tin từ Zalo
  const handleZaloAuthorize = async () => {
    setLoading(true);
    try {
      await authorize({
        scopes: ["scope.userInfo", "scope.userPhonenumber"],
      });

      const userInfo = await getUserInfo({});
      console.log("🔍 DEBUG - Full getUserInfo response:", userInfo);
      console.log("🔍 DEBUG - userInfo.userInfo:", userInfo.userInfo);
      console.log(
        "🔍 DEBUG - Available fields:",
        Object.keys(userInfo.userInfo || {})
      );
      console.log(
        "🔍 DEBUG - Full userInfo object stringified:",
        JSON.stringify(userInfo.userInfo, null, 2)
      );

      const userId = userInfo.userInfo?.id || "";
      const userName = userInfo.userInfo?.name || "";
      const userAvatar = userInfo.userInfo?.avatar || "";

      // Check if phone is available in any field (cast to any to avoid TypeScript errors)
      const userInfoAny = userInfo.userInfo as any;
      const potentialPhone =
        userInfoAny?.phone ||
        userInfoAny?.phoneNumber ||
        userInfoAny?.mobile ||
        "";
      console.log("🔍 DEBUG - Potential phone fields:", {
        phone: userInfoAny?.phone,
        phoneNumber: userInfoAny?.phoneNumber,
        mobile: userInfoAny?.mobile,
        potentialPhone,
      });

      console.log("🔍 DEBUG - Extracted data:", {
        userId,
        userName,
        userAvatar,
        potentialPhone,
        allUserInfo: userInfo.userInfo,
      });
      // Nếu muốn lấy số điện thoại, hãy gọi zmp.getPhoneNumber() tại đây (nếu SDK hỗ trợ)
      // Ví dụ:
      // const phoneRes = await zmp.getPhoneNumber();
      // const userPhone = phoneRes?.number || "";

      // Kiểm tra xem user đã có trong Google Sheets chưa
      await loadMemberFromSheets(userId);

      const newMemberData: MemberData = {
        userId,
        name: userName,
        avatar: userAvatar,
        // phone: userPhone, // Bỏ dòng này nếu chưa lấy được số điện thoại
        registeredAt: new Date().toISOString(),
      };

      setMemberData(newMemberData);
      setShowPhoneForm(true); // Luôn show form nhập SĐT nếu chưa lấy được qua API

      toast.success(`Chào mừng ${userName || "bạn"}!`);
    } catch (error) {
      console.error("Authorization error:", error);
      toast.error("Có lỗi xảy ra khi kết nối với Zalo");
    } finally {
      setLoading(false);
    }
  };

  // Lưu số điện thoại thủ công hoặc tự động từ Zalo
  const handleSavePhone = async (inputPhone?: string) => {
    const phoneToSave = inputPhone || phone;
    if (!phoneToSave.trim() || phoneToSave.length < 10) {
      toast.error("Vui lòng nhập số điện thoại hợp lệ");
      return;
    }

    if (memberData) {
      setLoading(true);

      const updatedData = {
        ...memberData,
        phone: phoneToSave,
      };

      try {
        // Lưu vào Google Sheets
        const { saveMemberInfo } = await import("@/services/sheet.service");
        await saveMemberInfo(updatedData.userId, phoneToSave);

        // Chỉ cập nhật state khi lưu thành công
        setMemberData(updatedData);
        setShowPhoneForm(false);
        toast.success("Đã lưu thông tin thành công!");
      } catch (sheetError) {
        console.error("Failed to save to Google Sheets:", sheetError);
        toast.error("Không thể lưu thông tin. Vui lòng thử lại!");
      } finally {
        setLoading(false);
      }
    }
  };

  // Lấy số điện thoại từ Zalo Mini App
  const handleGetPhoneFromZalo = async () => {
    setLoading(true);
    try {
      console.log("🔍 DEBUG - Calling zmp.getPhoneNumber()...");
      console.log("🔍 DEBUG - Available zmp methods:", Object.keys(zmp));

      const res = await zmp.getPhoneNumber();
      console.log("🔍 DEBUG - getPhoneNumber response:", res);
      console.log(
        "🔍 DEBUG - Available fields in response:",
        Object.keys(res || {})
      );
      console.log(
        "🔍 DEBUG - Full response stringified:",
        JSON.stringify(res, null, 2)
      );

      const phoneToken = res?.token || "";
      console.log("🔍 DEBUG - Phone token:", phoneToken);

      if (phoneToken) {
        // Decode token bằng Zalo API - thử tất cả endpoints
        try {
          const { ZaloPhoneService } = await import(
            "@/services/zalo-phone.service"
          );

          console.log("🔍 DEBUG - Trying main decode method first...");
          let actualPhone = await ZaloPhoneService.decodePhoneToken(phoneToken);

          // Nếu method chính không work, thử tất cả endpoints
          if (!actualPhone) {
            console.log(
              "🔍 DEBUG - Main method failed, trying all endpoints..."
            );
            actualPhone = await ZaloPhoneService.tryMultipleEndpoints(
              phoneToken
            );
          }

          console.log("🔍 DEBUG - Final decoded phone:", actualPhone);

          if (actualPhone) {
            setPhone(actualPhone);
            await handleSavePhone(actualPhone);
          } else {
            toast.error(
              "Không thể giải mã token số điện thoại với tất cả endpoints"
            );
          }
        } catch (decodeError) {
          console.error(
            "🔍 DEBUG - Failed to decode phone token:",
            decodeError
          );
          toast.error("Lỗi khi giải mã số điện thoại từ Zalo");
        }
      } else {
        // Fallback: thử lấy trực tiếp number nếu có
        const zaloPhone = res?.number || "";
        console.log("🔍 DEBUG - Extracted phone:", zaloPhone);

        if (zaloPhone) {
          setPhone(zaloPhone);
          await handleSavePhone(zaloPhone);
        } else {
          toast.error("Không lấy được số điện thoại từ Zalo");
          console.log("🔍 DEBUG - No phone number or token found in response");
        }
      }
    } catch (err: any) {
      toast.error("Không lấy được số điện thoại từ Zalo");
      console.error("🔍 DEBUG - getPhoneNumber error:", err);
      console.error("🔍 DEBUG - Error message:", err?.message);
      console.error("🔍 DEBUG - Error details:", JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  // Reset thông tin thành viên để thử ủy quyền lại
  const handleLogout = async () => {
    if (memberData?.userId) {
      try {
        // Xóa dữ liệu khỏi Google Sheets (nếu có function này)
        console.log(
          "🔍 DEBUG - Attempting to delete member data from sheets for userId:",
          memberData.userId
        );
        // Uncomment if you have delete function:
        // await sheetService.deleteMemberByZaloId(memberData.userId);
        console.log("🔍 DEBUG - Member data deleted from sheets");
      } catch (error) {
        console.error("🔍 DEBUG - Failed to delete from sheets:", error);
      }
    }

    // Clear session storage and local storage
    try {
      localStorage.clear();
      sessionStorage.clear();
      console.log("🔍 DEBUG - Cleared localStorage and sessionStorage");
    } catch (error) {
      console.error("🔍 DEBUG - Failed to clear storage:", error);
    }

    // Try to clear Zalo SDK session if possible
    try {
      const zmpAny = zmp as any;
      if (zmpAny.clearSession) {
        await zmpAny.clearSession();
        console.log("🔍 DEBUG - Cleared Zalo SDK session");
      } else if (zmpAny.logout) {
        await zmpAny.logout();
        console.log("🔍 DEBUG - Logged out from Zalo SDK");
      } else {
        console.log("🔍 DEBUG - No clear session method found in Zalo SDK");
        console.log("🔍 DEBUG - Available zmp methods:", Object.keys(zmp));
      }
    } catch (error) {
      console.error("🔍 DEBUG - Failed to clear Zalo session:", error);
    }

    setMemberData(null);
    setShowPhoneForm(false);
    setPhone("");
    setForceLogout(true); // Set flag để không tự động load lại session
    toast.success("Đã đăng xuất thành công!");
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

          {/* Form nhập số điện thoại hoặc lấy tự động từ Zalo */}
          {showPhoneForm && !memberData.phone && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700 mb-3">
                Vui lòng nhập số điện thoại để hoàn tất đăng ký hoặc lấy tự động
                từ Zalo:
              </p>
              <div className="flex gap-2 mb-2">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="Nhập số điện thoại"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={11}
                />
                <button
                  onClick={() => handleSavePhone()}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? "..." : "Lưu"}
                </button>
              </div>
              <button
                onClick={handleGetPhoneFromZalo}
                disabled={loading}
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "..." : "Lấy số điện thoại từ Zalo"}
              </button>
            </div>
          )}

          <div className="text-xs text-gray-500 text-center">
            🎉 Bạn đã kết nối Zalo! Nhận thông báo ưu đãi.
          </div>

          {/* Nút đăng xuất để reset thông tin */}
          <button
            onClick={handleLogout}
            className="w-full mt-2 px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
          >
            🚪 Đăng xuất Zalo
          </button>
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
