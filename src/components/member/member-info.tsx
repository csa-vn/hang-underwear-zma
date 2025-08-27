import { useState, useEffect } from "react";
import { useEffect as useUpdateEffect } from "react";
// @ts-ignore
import zmp from "zmp-sdk";
import { toast } from "react-hot-toast";
import { authorize, getUserInfo } from "zmp-sdk";
import * as sheetService from "../../services/sheet.service";

interface MemberData {
  userId: string;
  name?: string;
  avatar?: string;
  phone?: string;
  followedOA?: boolean;
  registeredAt?: string;
}

// Helper function để tính hạng thành viên
const getMemberRank = (points: number) => {
  if (points >= 500) {
    return {
      name: "Kim cương",
      color: "from-cyan-500 to-blue-600",
      bgColor: "bg-cyan-50",
      borderColor: "border-cyan-200",
      textColor: "text-cyan-700",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6,2L18,2L22,8L12,22L2,8L6,2M12,9L7.5,7L9,4L15,4L16.5,7L12,9M8.5,7L12,9L15.5,7L12,16L8.5,7Z" />
        </svg>
      ),
    };
  } else if (points >= 200) {
    return {
      name: "Vàng",
      color: "from-yellow-400 to-orange-500",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-700",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5,16L3,5H21L19,16H5M19,3H5A1,1 0 0,0 4,4V6H20V4A1,1 0 0,0 19,3Z" />
        </svg>
      ),
    };
  } else if (points >= 100) {
    return {
      name: "Bạc",
      color: "from-gray-400 to-gray-600",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      textColor: "text-gray-700",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5,16L3,5H21L19,16H5M19,3H5A1,1 0 0,0 4,4V6H20V4A1,1 0 0,0 19,3Z" />
        </svg>
      ),
    };
  } else {
    return {
      name: "Chưa xếp hạng",
      color: "from-gray-300 to-gray-400",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      textColor: "text-gray-600",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
      ),
    };
  }
};

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
  const [userPoints, setUserPoints] = useState(0); // Thêm state cho điểm
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
      if (existingMember) {
        setUserPoints(existingMember.points || 0); // Cập nhật điểm
      }
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
        <div className="space-y-4">
          {/* Modern Member Profile Card */}
          <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative">
                {memberData.avatar ? (
                  <img
                    src={memberData.avatar}
                    alt="Avatar"
                    className="w-16 h-16 rounded-full border-3 border-white/20 shadow-lg"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center border-3 border-white/20">
                    <svg
                      className="w-8 h-8 text-white/80"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
                {/* Online status badge */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 border-2 border-white rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h4 className="text-lg font-bold mb-1">
                  {memberData.name || "Thành viên Zalo"}
                </h4>
                <p className="text-white/80 text-sm">
                  {memberData.phone || "Chưa cập nhật SĐT"}
                </p>
                {memberData.followedOA && (
                  <div className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-white/20 rounded-full text-xs">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Đã theo dõi OA
                  </div>
                )}
              </div>
            </div>

            {/* Decorative pattern */}
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="20" r="8" fill="currentColor" />
                <circle cx="80" cy="50" r="6" fill="currentColor" />
                <circle cx="30" cy="70" r="4" fill="currentColor" />
              </svg>
            </div>
          </div>

          {/* Member Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg
                  className="w-4 h-4 text-emerald-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-emerald-700 font-semibold text-sm">
                Trạng thái
              </p>
              <p className="text-xs text-emerald-600">Hoạt động</p>
            </div>

            <div
              className={`${getMemberRank(userPoints).bgColor} border ${
                getMemberRank(userPoints).borderColor
              } rounded-xl p-3 text-center`}
            >
              <div
                className={`w-8 h-8 bg-gradient-to-r ${
                  getMemberRank(userPoints).color
                } rounded-full flex items-center justify-center mx-auto mb-2 text-white`}
              >
                {getMemberRank(userPoints).icon}
              </div>
              <p
                className={`${
                  getMemberRank(userPoints).textColor
                } font-semibold text-sm`}
              >
                Hạng
              </p>
              <p className={`text-xs ${getMemberRank(userPoints).textColor}`}>
                {getMemberRank(userPoints).name}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zM8 6v1h4V6a2 2 0 10-4 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-blue-700 font-semibold text-sm">Điểm</p>
              <p className="text-xs text-blue-600">{userPoints || 0}</p>
            </div>
          </div>

          {/* Modern Phone Input Form */}
          {showPhoneForm && !memberData.phone && (
            <div className="bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-orange-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">
                    Hoàn tất đăng ký
                  </h4>
                  <p className="text-sm text-gray-600">
                    Nhập số điện thoại để nhận ưu đãi
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="Nhập số điện thoại (VD: 0987654321)"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                    maxLength={11}
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <span className="text-gray-500 text-sm">+84</span>
                  </div>
                </div>

                <button
                  onClick={() => handleSavePhone()}
                  disabled={loading || phone.length < 9}
                  className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-3 px-4 rounded-xl hover:from-orange-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Hoàn tất đăng ký
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Status & Actions */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-600">Đã kết nối Zalo</span>
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-lg text-sm transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                  clipRule="evenodd"
                />
              </svg>
              Đăng xuất
            </button>
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
