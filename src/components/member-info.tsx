import { useState, useEffect } from "react";
import { useEffect as useUpdateEffect } from "react";
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
  followedOA?: boolean;
  registeredAt?: string;
}

export default function MemberInfo({
  setMemberData: setMemberDataProp,
  setIsLoggedIn,
}: {
  setMemberData?: (data: MemberData | null) => void;
  setIsLoggedIn?: (v: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [memberData, setMemberData] = useState<MemberData | null>(null);
  const [showPhoneForm, setShowPhoneForm] = useState(false);
  const [phone, setPhone] = useState("");
  const [loadingData, setLoadingData] = useState(false);
  const [forceLogout, setForceLogout] = useState(false);
  // Sync memberData lên prop nếu có
  useEffect(() => {
    if (setMemberDataProp) setMemberDataProp(memberData);
  }, [memberData, setMemberDataProp]);

  // Sync login state lên ProfilePage
  useEffect(() => {
    if (setIsLoggedIn) setIsLoggedIn(!forceLogout && !!memberData?.userId);
  }, [forceLogout, memberData, setIsLoggedIn]);

  useEffect(() => {
    // Check if force logout is set in localStorage
    const isForceLogout = localStorage.getItem("zalo_force_logout");
    if (isForceLogout === "true") {
      setForceLogout(true);
    } else {
      checkZaloSession();
    }
  }, []);

  // Load data từ Google Sheets
  const loadMemberFromSheets = async (userId: string) => {
    try {
      setLoadingData(true);
      const existingMember = await sheetService.getMemberByZaloId(userId);
      return existingMember || null;
    } catch (error) {
      console.error("Failed to load member data from sheets:", error);
      return null;
    } finally {
      setLoadingData(false);
    }
  };

  // Execute Component Debug để lấy số điện thoại tự động
  const executeComponentDebug = async (
    userId: string,
    userName: string,
    userAvatar: string
  ) => {
    try {
      console.log("🕵️‍♂️ AUTO COMPONENT DEBUG - Starting...");

      // Get access token
      const tokenResult = await zmp.getAccessToken();
      console.log("🕵️‍♂️ Token Result:", tokenResult);

      // Get phone token
      const phoneResult = await zmp.getPhoneNumber();
      console.log("🕵️‍♂️ Phone Result:", phoneResult);

      const accessToken =
        (tokenResult as any)?.access_token ||
        (tokenResult as any)?.token ||
        tokenResult;
      const phoneToken = phoneResult?.token;

      if (accessToken && phoneToken) {
        console.log("🕵️‍♂️ Testing phone decode...");
        const url = "https://graph.zalo.me/v2.0/me/info";
        const response = await fetch(url, {
          method: "GET",
          headers: {
            access_token: accessToken,
            code: phoneToken,
            secret_key: import.meta.env.VITE_ZMA_APP_SECRET,
          } as HeadersInit,
        });

        const phoneData = await response.json();
        console.log("🕵️‍♂️ Phone decode result:", phoneData);

        // Ưu tiên lấy số từ phoneData.data.number nếu có, fallback sang phoneData.phone
        const decodedPhone = phoneData?.data?.number || phoneData.phone;
        if (decodedPhone) {
          console.log("🎉 SUCCESS - Phone:", decodedPhone);
          // Tự động lưu vào Google Sheets
          try {
            const { saveMemberInfo } = await import("@/services/sheet.service");
            await saveMemberInfo(userId, decodedPhone);
            console.log("✅ Saved to Google Sheets");
          } catch (saveError) {
            console.error("❌ Save error:", saveError);
          }
          // Set member data
          setMemberData({
            userId,
            name: userName,
            avatar: userAvatar,
            phone: decodedPhone,
            followedOA: true,
            registeredAt: new Date().toISOString(),
          });
          toast.success(`🎉 Hoàn tất! Số điện thoại: ${decodedPhone}`);
          return true;
        }
      }

      // Fallback nếu không lấy được
      setMemberData({
        userId,
        name: userName,
        avatar: userAvatar,
        followedOA: true,
      });
      setShowPhoneForm(true);
      toast.error(
        "Không thể tự động lấy số điện thoại. Vui lòng nhập thủ công."
      );
      return false;
    } catch (error) {
      console.error("❌ Component debug error:", error);
      setMemberData({
        userId,
        name: userName,
        avatar: userAvatar,
        followedOA: true,
      });
      setShowPhoneForm(true);
      toast.error(
        "Có lỗi khi lấy thông tin. Vui lòng nhập số điện thoại thủ công."
      );
      return false;
    }
  };

  // Check Zalo session
  const checkZaloSession = async () => {
    if (forceLogout) {
      console.log("🔍 Force logout enabled, skipping session check");
      return;
    }

    try {
      const userInfo = await getUserInfo();
      if (userInfo && userInfo.userInfo?.id) {
        const existingMember = await loadMemberFromSheets(userInfo.userInfo.id);

        if (existingMember && existingMember.phone) {
          setMemberData({
            userId: userInfo.userInfo.id,
            name: userInfo.userInfo.name || "",
            avatar: userInfo.userInfo.avatar || "",
            phone: existingMember.phone,
            followedOA: userInfo.userInfo.followedOA || false,
          });
        } else {
          setMemberData({
            userId: userInfo.userInfo.id,
            name: userInfo.userInfo.name || "",
            avatar: userInfo.userInfo.avatar || "",
            followedOA: userInfo.userInfo.followedOA || false,
          });
          setShowPhoneForm(true);
        }
      }
    } catch (error) {
      console.log("User not logged in to Zalo yet");
    } finally {
      setLoadingData(false);
    }
  };

  // Zalo Authorization với auto component debug
  const handleZaloAuthorize = async () => {
    setLoading(true);
    try {
      console.log("🚀 Starting Zalo authorization...");

      await authorize({
        scopes: ["scope.userInfo", "scope.userPhonenumber"],
      });

      const userInfo = await getUserInfo({});
      const userId = userInfo.userInfo?.id || "";
      const userName = userInfo.userInfo?.name || "";
      const userAvatar = userInfo.userInfo?.avatar || "";

      console.log("🔍 User data:", { userId, userName, userAvatar });

      // Check existing member
      const existingMember = await loadMemberFromSheets(userId);

      if (existingMember && existingMember.phone) {
        setMemberData({
          userId,
          name: userName,
          avatar: userAvatar,
          phone: existingMember.phone,
          followedOA: (userInfo.userInfo as any)?.followedOA || false,
          registeredAt: new Date().toISOString(),
        });
        toast.success(`Chào mừng ${userName || "bạn"} trở lại!`);
      } else {
        // Execute component debug tự động
        console.log("🔍 No existing phone, executing auto component debug...");

        // Delay để SDK sẵn sàng
        await new Promise((resolve) => setTimeout(resolve, 1000));

        await executeComponentDebug(userId, userName, userAvatar);
      }
    } catch (error) {
      console.error("Authorization error:", error);
      toast.error("Có lỗi xảy ra khi kết nối với Zalo");
    } finally {
      setLoading(false);
    }
  };

  // Save phone manually
  const handleSavePhone = async (inputPhone?: string) => {
    const phoneToSave = inputPhone || phone;
    if (!phoneToSave.trim() || phoneToSave.length < 10) {
      toast.error("Vui lòng nhập số điện thoại hợp lệ");
      return;
    }

    if (memberData) {
      setLoading(true);
      const updatedData = { ...memberData, phone: phoneToSave };

      try {
        const { saveMemberInfo } = await import("@/services/sheet.service");
        await saveMemberInfo(updatedData.userId, phoneToSave);
        setMemberData(updatedData);
        setShowPhoneForm(false);
        toast.success("Đã lưu thông tin thành công!");
      } catch (error) {
        console.error("Failed to save to Google Sheets:", error);
        toast.error("Không thể lưu thông tin. Vui lòng thử lại!");
      } finally {
        setLoading(false);
      }
    }
  };

  // Logout hoàn toàn
  const handleLogout = async () => {
    console.log("🔄 Starting complete logout process...");

    // Clear localStorage
    localStorage.removeItem("zalo_access_token");
    localStorage.removeItem("zalo_user_info");
    localStorage.removeItem("zalo_phone_token");
    localStorage.setItem("zalo_force_logout", "true");

    // Clear session data
    setMemberData(null);
    setShowPhoneForm(false);
    setPhone("");
    setForceLogout(true);

    console.log("✅ Complete logout finished");
    toast.success("Đã đăng xuất hoàn toàn khỏi Zalo!");
  };

  // Clear logout flag để có thể kết nối lại
  const handleClearLogout = () => {
    localStorage.removeItem("zalo_force_logout");
    setForceLogout(false);
    toast.success("Đã xóa trạng thái đăng xuất. Có thể kết nối lại Zalo!");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"></div>
        <div>
          <h3 className="font-semibold text-gray-800">Thông tin thành viên</h3>
          <p className="text-sm text-gray-500">
            Kết nối với Zalo để nhận ưu đãi
          </p>
        </div>
      </div>

      {forceLogout ? (
        <div className="text-center">
          <button
            onClick={() => {
              // Xóa cờ forceLogout trước khi đăng nhập lại
              localStorage.removeItem("zalo_force_logout");
              setForceLogout(false);
              handleZaloAuthorize();
            }}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 font-medium"
          >
            Đăng nhập lại với Zalo
          </button>
        </div>
      ) : memberData ? (
        <div className="space-y-3">
          {/* Member info - new layout */}
          <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg border border-green-200">
            {memberData.avatar && (
              <img
                src={memberData.avatar}
                alt="Avatar"
                className="w-20 h-20 rounded-full mb-3 border-2 border-green-300 shadow"
              />
            )}
            <div className="w-full max-w-xs">
              <div className="mb-2">
                <span className="block text-xs text-gray-500 font-medium mb-1">
                  Tên thành viên:
                </span>
                <span className="block text-base font-semibold text-green-800 bg-white rounded px-2 py-1 border border-green-100">
                  {memberData.name || "Chưa có"}
                </span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 font-medium mb-1">
                  Số điện thoại:
                </span>
                <span className="block text-base font-semibold text-green-800 bg-white rounded px-2 py-1 border border-green-100">
                  {memberData.phone || "Chưa có"}
                </span>
              </div>
            </div>
          </div>

          {/* Phone form nếu cần */}
          {showPhoneForm && !memberData.phone && (
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
                  onClick={() => handleSavePhone()}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? "..." : "Lưu"}
                </button>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 text-center">
            Bạn đã kết nối Zalo! Nhận thông báo ưu đãi.
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="w-full mt-2 px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
          >
            Đăng xuất
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
                Đang kết nối & lấy thông tin...
              </>
            ) : (
              <>Kết nối với Zalo (Auto Debug)</>
            )}
          </button>

          <div className="text-xs text-gray-500 mt-2 text-center">
            Một cú nhấp: Kết nối Zalo + Tự động lấy số điện thoại + Lưu thông
            tin
          </div>
        </div>
      )}
    </div>
  );
}
