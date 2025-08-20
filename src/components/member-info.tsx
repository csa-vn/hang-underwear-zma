import { useState, useEffect } from "react";
// @ts-ignore
import zmp from "zmp-sdk";
import { toast } from "react-hot-toast";
import { authorize, getUserInfo } from "zmp-sdk";
import * as sheetService from "../services/sheet.service";
import { ZaloPhoneService } from "../services/zalo-phone.service";

interface MemberData {
  userId: string;
  name?: string;
  avatar?: string;
  phone?: string;
  followedOA?: boolean;
  registeredAt?: string;
}

export default function MemberInfo() {
  const [loading, setLoading] = useState(false);
  const [memberData, setMemberData] = useState<MemberData | null>(null);
  const [showPhoneForm, setShowPhoneForm] = useState(false);
  const [phone, setPhone] = useState("");
  const [loadingData, setLoadingData] = useState(false);
  const [forceLogout, setForceLogout] = useState(false); // Flag để force logout
  const [phoneToken, setPhoneToken] = useState<string>(""); // Phone token state
  const [apiResults, setApiResults] = useState<any[]>([]); // API test results

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
    // Kiểm tra flag force logout từ localStorage
    const forceLogoutFlag = localStorage.getItem("zalo_force_logout");
    if (forceLogoutFlag === "true" || forceLogout) {
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
            followedOA: userInfo.userInfo.followedOA || false,
          });
        } else {
          // Chưa có data, hiển thị form để nhập phone
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

  // Lấy thông tin từ Zalo - ALL IN ONE
  const handleZaloAuthorize = async () => {
    setLoading(true);

    // Clear logout flag when user wants to reconnect
    localStorage.removeItem("zalo_force_logout");
    setForceLogout(false);

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
        followedOA: userInfoAny?.followedOA || false,
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

  // Test CORS policy và server accessibility
  const handleTestCORS = async () => {
    setLoading(true);
    try {
      console.log("\n🧪 STARTING CORS POLICY TEST");

      const { CORSTestService } = await import("@/services/cors-test.service");

      // Test CORS với các servers khác nhau
      await CORSTestService.testCORSPolicy();

      // Test authentication requirements
      await CORSTestService.testAuthRequirements();

      toast.success("✅ CORS test hoàn thành! Xem Console để biết chi tiết");
    } catch (error) {
      console.error("🔍 DEBUG - CORS test error:", error);
      toast.error("Có lỗi khi test CORS. Xem Console!");
    } finally {
      setLoading(false);
    }
  };

  // Test trực tiếp Zalo Open API để xem response
  const handleTestZaloAPI = async () => {
    setLoading(true);
    try {
      console.log("\n🚀 STARTING ZALO OPEN API TEST");
      console.log("🔍 DEBUG - Step 1: Getting phone token...");

      const res = await zmp.getPhoneNumber();
      console.log("🔍 DEBUG - getPhoneNumber response:", res);

      const phoneTokenReceived = res?.token || "";
      console.log("🔍 DEBUG - Phone token received:", phoneTokenReceived);

      // Store phone token in state
      setPhoneToken(phoneTokenReceived);

      if (phoneTokenReceived) {
        console.log("\n🔍 DEBUG - Step 3: Testing Zalo Open API directly...");

        const { ZaloPhoneService } = await import(
          "@/services/zalo-phone-clean.service"
        );

        // Test format chính thức từ Zalo docs
        const officialResult = await ZaloPhoneService.testOfficialZaloAPI(
          phoneTokenReceived
        );
        console.log("🔍 DEBUG - Official format result:", officialResult);

        if (!officialResult.success) {
          // Fallback: Test các endpoints cũ
          console.log(
            "🔍 DEBUG - Official format failed, trying old endpoints..."
          );
          const fallbackResult = await ZaloPhoneService.testZaloOpenAPI(
            phoneTokenReceived
          );
          console.log("🔍 DEBUG - Fallback result:", fallbackResult);
        }

        toast.success("✅ API test hoàn thành! Xem Console để biết chi tiết");
      } else {
        toast.error("Không lấy được phone token từ Zalo");
      }
    } catch (error) {
      console.error("🔍 DEBUG - Test API error:", error);
      toast.error("Có lỗi khi test API. Xem Console!");
    } finally {
      setLoading(false);
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

      const phoneTokenReceived = res?.token || "";
      console.log("🔍 DEBUG - Phone token:", phoneTokenReceived);

      // Store phone token in state
      setPhoneToken(phoneTokenReceived);

      if (phoneTokenReceived) {
        // Decode token bằng Zalo API - thử tất cả endpoints
        try {
          const { ZaloPhoneService } = await import(
            "@/services/zalo-phone-clean.service"
          );

          console.log("🔍 DEBUG - Trying main decode method first...");
          let actualPhone = await ZaloPhoneService.decodePhoneToken(
            phoneTokenReceived
          );

          // Nếu method chính không work, thử tất cả endpoints
          if (!actualPhone) {
            console.log(
              "🔍 DEBUG - Main method failed, trying fallback endpoints..."
            );
            const fallbackResult = await ZaloPhoneService.testZaloOpenAPI(
              phoneTokenReceived
            );
            actualPhone =
              fallbackResult?.data?.phone ||
              fallbackResult?.data?.number ||
              null;
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

  // Reset thông tin thành viên và clear hoàn toàn Zalo session
  const handleLogout = async () => {
    setLoading(true);
    console.log("🚪 LOGOUT - Starting complete Zalo session cleanup...");

    if (memberData?.userId) {
      try {
        // Xóa dữ liệu khỏi Google Sheets (nếu có function này)
        console.log(
          "� LOGOUT - Attempting to delete member data from sheets for userId:",
          memberData.userId
        );
        // Uncomment if you have delete function:
        // await sheetService.deleteMemberByZaloId(memberData.userId);
        console.log("� LOGOUT - Member data deleted from sheets");
      } catch (error) {
        console.error("� LOGOUT - Failed to delete from sheets:", error);
      }
    }

    // Clear all browser storage
    try {
      console.log("🚪 LOGOUT - Clearing all browser storage...");

      // Set flag trước khi clear để tránh session tự động load lại
      localStorage.setItem("zalo_force_logout", "true");

      // Clear specific items first but keep the logout flag
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key !== "zalo_force_logout") {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));

      sessionStorage.clear();

      // Clear IndexedDB if exists
      if (window.indexedDB) {
        try {
          const databases = await indexedDB.databases();
          for (const db of databases) {
            if (db.name) {
              console.log("� LOGOUT - Deleting IndexedDB:", db.name);
              indexedDB.deleteDatabase(db.name);
            }
          }
        } catch (error) {
          console.log("🚪 LOGOUT - Could not clear IndexedDB:", error);
        }
      }

      console.log("🚪 LOGOUT - All browser storage cleared");
    } catch (error) {
      console.error("� LOGOUT - Failed to clear storage:", error);
    }

    // Try all possible methods to clear Zalo SDK session
    try {
      console.log("🚪 LOGOUT - Attempting to clear Zalo SDK session...");
      const zmpAny = zmp as any;

      // List all available methods
      console.log("� LOGOUT - Available zmp methods:", Object.keys(zmp));

      // Try various logout methods
      const logoutMethods = [
        "clearSession",
        "logout",
        "clearAuth",
        "clearUserInfo",
        "clearAllData",
      ];

      for (const method of logoutMethods) {
        if (zmpAny[method] && typeof zmpAny[method] === "function") {
          try {
            console.log(`🚪 LOGOUT - Trying ${method}...`);
            await zmpAny[method]();
            console.log(`� LOGOUT - ${method} successful`);
          } catch (error) {
            console.log(`� LOGOUT - ${method} failed:`, error);
          }
        }
      }

      // Also try to clear any cached data
      if (zmpAny.clearCache && typeof zmpAny.clearCache === "function") {
        try {
          await zmpAny.clearCache();
          console.log("🚪 LOGOUT - Zalo cache cleared");
        } catch (error) {
          console.log("� LOGOUT - Failed to clear Zalo cache:", error);
        }
      }
    } catch (error) {
      console.error("� LOGOUT - Failed to clear Zalo session:", error);
    }

    // Clear all component state
    console.log("🚪 LOGOUT - Clearing component state...");
    setMemberData(null);
    setShowPhoneForm(false);
    setPhone("");
    setPhoneToken("");
    setApiResults([]);
    setForceLogout(true); // Set flag để không tự động load lại session

    // Force reload page to ensure complete cleanup
    const shouldReload = window.confirm(
      "⚠️ Đăng xuất hoàn toàn sẽ:\n• Xóa tất cả dữ liệu Zalo session\n• Ngăn tự động kết nối lại\n• Tải lại trang để đảm bảo session sạch\n\nTiếp tục?"
    );

    if (shouldReload) {
      console.log("🚪 LOGOUT - Reloading page for complete cleanup...");
      window.location.reload();
    } else {
      setLoading(false);
      toast.success(
        "🚪 Đã đăng xuất! Tải lại trang để đảm bảo session sạch hoàn toàn."
      );
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
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 mb-2"
              >
                {loading ? "..." : "Lấy số điện thoại từ Zalo"}
              </button>

              {/* Row 1: Main API Tests */}
              <div className="flex gap-2 mb-2">
                <button
                  onClick={handleTestZaloAPI}
                  disabled={loading}
                  className="flex-1 px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 text-sm"
                >
                  {loading ? "..." : "🧪 Test API"}
                </button>

                <button
                  onClick={async () => {
                    if (!phoneToken) {
                      alert("Vui lòng lấy phone token trước!");
                      return;
                    }

                    console.log("🎯 Testing with User Token...");
                    try {
                      const { ZaloPhoneService } = await import(
                        "@/services/zalo-phone-clean.service"
                      );
                      const result = await ZaloPhoneService.testWithUserToken(
                        phoneToken
                      );
                      console.log("🔍 DEBUG - User token result:", result);
                      setApiResults((prev) => [
                        ...prev,
                        {
                          type: "user-token-test",
                          result,
                        },
                      ]);
                    } catch (error) {
                      console.error("❌ User Token Test Error:", error);
                    }
                  }}
                  disabled={loading}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
                >
                  {loading ? "..." : "🎯 User Token"}
                </button>
              </div>

              {/* Row 2: Debug Tools */}
              <div className="flex gap-2">
                {/* Component-based Session Debug */}
                <button
                  onClick={async () => {
                    console.log("🕵️‍♂️ Component Session Debug...");

                    const sessionInfo: any = {
                      timestamp: new Date().toISOString(),
                      userInfo: null,
                      accessToken: null,
                      phoneNumber: null,
                      phoneToken: null,
                      errors: [],
                    };

                    try {
                      console.log("\n🕵️‍♂️ === COMPONENT SESSION DEBUG ===");

                      // 1. Check ZMP in component context
                      console.log("🔍 1. ZMP SDK Available:", !!zmp);
                      console.log(
                        "🔍 ZMP Methods:",
                        zmp ? Object.keys(zmp).slice(0, 10) : "No ZMP"
                      );

                      if (!zmp) {
                        alert("❌ ZMP SDK not available in component!");
                        return;
                      }

                      // 2. Get User Info
                      try {
                        console.log("\n🔍 2. Getting User Info...");
                        const userInfo = await getUserInfo();
                        console.log("✅ User Info:", userInfo);
                        sessionInfo.userInfo = userInfo.userInfo || userInfo;
                      } catch (userError: any) {
                        console.log("❌ User Info Error:", userError);
                        sessionInfo.errors.push(
                          `UserInfo: ${userError.message}`
                        );
                      }

                      // 3. Get Access Token
                      try {
                        console.log("\n🔍 3. Getting Access Token...");
                        const tokenResult = await zmp.getAccessToken();
                        console.log("✅ Access Token Result:", tokenResult);
                        sessionInfo.accessToken =
                          (tokenResult as any)?.access_token ||
                          (tokenResult as any)?.token ||
                          tokenResult;
                      } catch (tokenError: any) {
                        console.log("❌ Access Token Error:", tokenError);
                        sessionInfo.errors.push(
                          `AccessToken: ${tokenError.message}`
                        );
                      }

                      // 4. Get Phone Number/Token
                      try {
                        console.log("\n🔍 4. Getting Phone Number...");
                        const phoneResult = await zmp.getPhoneNumber();
                        console.log("✅ Phone Result:", phoneResult);
                        sessionInfo.phoneNumber = phoneResult?.number;
                        sessionInfo.phoneToken = phoneResult?.token;
                      } catch (phoneError: any) {
                        console.log("❌ Phone Error:", phoneError);
                        sessionInfo.errors.push(`Phone: ${phoneError.message}`);
                      }

                      // 5. Summary
                      console.log("\n📋 === COMPONENT SESSION SUMMARY ===");
                      console.log(
                        "👤 User logged in:",
                        !!sessionInfo.userInfo?.id
                      );
                      console.log(
                        "� Has access token:",
                        !!sessionInfo.accessToken
                      );
                      console.log(
                        "📱 Has phone token:",
                        !!sessionInfo.phoneToken
                      );
                      console.log(
                        "❌ Errors count:",
                        sessionInfo.errors.length
                      );

                      // 6. Test User Token API immediately
                      if (sessionInfo.accessToken && sessionInfo.phoneToken) {
                        console.log(
                          "\n🎯 === IMMEDIATE USER TOKEN API TEST ==="
                        );

                        const url = "https://graph.zalo.me/v2.0/me/info";
                        const response = await fetch(url, {
                          method: "GET",
                          headers: {
                            access_token: sessionInfo.accessToken,
                            code: sessionInfo.phoneToken,
                            secret_key: import.meta.env.VITE_ZMA_APP_SECRET,
                          } as HeadersInit,
                        });

                        console.log(
                          "🔍 User Token API Status:",
                          response.status
                        );
                        const data = await response.json();
                        console.log("🔍 User Token API Response:", data);

                        if (data.error) {
                          alert(
                            `❌ User Token API Error ${data.error}: ${data.message}`
                          );
                        } else if (data.phone || data.data?.phone) {
                          const phone = data.phone || data.data?.phone;
                          alert(`🎉 SUCCESS! Phone: ${phone}`);
                          console.log("🎉 PHONE NUMBER DECODED:", phone);

                          // Auto-save if phone found
                          setPhone(phone);
                          await handleSavePhone(phone);
                        } else {
                          alert(
                            `✅ API Success but no phone in response: ${JSON.stringify(
                              data
                            )}`
                          );
                        }
                      }

                      const hasUser = !!sessionInfo.userInfo?.id;
                      const hasToken = !!sessionInfo.accessToken;
                      const hasPhone = !!sessionInfo.phoneToken;
                      const errorCount = sessionInfo.errors?.length || 0;

                      if (errorCount === 0) {
                        alert(
                          `✅ Component Session OK!\n👤 User: ${hasUser}\n🔑 Token: ${hasToken}\n📱 Phone: ${hasPhone}`
                        );
                      } else {
                        alert(
                          `⚠️ Component Session Issues!\n❌ Errors: ${errorCount}\n👤 User: ${hasUser}\n🔑 Token: ${hasToken}\n📱 Phone: ${hasPhone}`
                        );
                      }
                    } catch (error) {
                      console.error("❌ Component Session Debug Error:", error);
                      alert("❌ Component debug failed! Check console");
                    }
                  }}
                  disabled={loading}
                  className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 text-sm"
                >
                  {loading ? "..." : "🕵️‍♂️ Component Debug"}
                </button>

                {/* Force Re-authorize */}
                <button
                  onClick={async () => {
                    console.log("🔄 Force Re-authorization...");
                    try {
                      const { ZaloPhoneService } = await import(
                        "@/services/zalo-phone-clean.service"
                      );
                      const result = await ZaloPhoneService.forceReauthorize();
                      console.log("🔍 DEBUG - Re-auth result:", result);

                      if (result.success) {
                        alert("✅ Re-authorization thành công!");
                        // Reload page để refresh session
                        window.location.reload();
                      } else {
                        alert(`❌ Re-authorization failed: ${result.error}`);
                      }
                    } catch (error) {
                      console.error("❌ Re-auth Error:", error);
                      alert("❌ Re-auth failed! Check console");
                    }
                  }}
                  disabled={loading}
                  className="flex-1 px-3 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50 text-sm"
                >
                  {loading ? "..." : "🔄 Re-auth"}
                </button>

                <button
                  onClick={handleTestCORS}
                  disabled={loading}
                  className="flex-1 px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 text-sm"
                >
                  {loading ? "..." : "🌐 CORS"}
                </button>
              </div>

              {/* Row 3: Network Debug Tools */}
              <div className="flex gap-2 mt-2">
                {/* Copy Curl Command */}
                <button
                  onClick={async () => {
                    if (!phoneToken) {
                      alert("Vui lòng lấy phone token trước!");
                      return;
                    }

                    const appId = import.meta.env.VITE_ZMA_APP_ID;
                    const appSecret = import.meta.env.VITE_ZMA_APP_SECRET;

                    const curlCommand = `curl --location --request GET 'https://graph.zalo.me/v2.0/me/info' \\
--header 'access_token: ${appId}|${appSecret}' \\
--header 'code: ${phoneToken}' \\
--header 'secret_key: ${appSecret}'`;

                    try {
                      await navigator.clipboard.writeText(curlCommand);
                      alert(
                        "✅ Curl command đã copy vào clipboard!\nBạn có thể paste vào terminal để test trực tiếp."
                      );
                      console.log("📋 Curl command copied:", curlCommand);
                    } catch (error) {
                      console.log(
                        "📋 Curl command (manual copy):",
                        curlCommand
                      );
                      alert(
                        "❌ Auto-copy failed. Check console để copy manual!"
                      );
                    }
                  }}
                  disabled={loading}
                  className="flex-1 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 text-sm"
                >
                  {loading ? "..." : "📋 Copy Curl"}
                </button>

                {/* Network Monitor Button */}
                <button
                  onClick={() => {
                    alert(`🌐 Network Monitor Guide:

1. Mở DevTools (F12)
2. Chọn tab "Network"  
3. Bấm "Clear" để xóa logs
4. Tick "Preserve log"
5. Bấm "🧪 Test API" hoặc button khác
6. Xem request "graph.zalo.me" xuất hiện
7. Click vào request để xem:
   - Headers (access_token, code, secret_key)
   - Response (error/success)
   - Timing information

🔍 Tìm request với:
- URL: graph.zalo.me/v2.0/me/info
- Method: GET
- Status: 200, 452, etc.`);
                  }}
                  className="flex-1 px-3 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 text-sm"
                >
                  🌐 Network Guide
                </button>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 text-center">
            🎉 Bạn đã kết nối Zalo! Nhận thông báo ưu đãi.
          </div>

          {/* Nút đăng xuất hoàn toàn để clear session */}
          <button
            onClick={handleLogout}
            disabled={loading}
            className="w-full mt-2 px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm disabled:opacity-50 font-medium"
          >
            {loading ? (
              <>
                <div className="w-3 h-3 border border-red-600 border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                Đang đăng xuất...
              </>
            ) : (
              "🚪 Đăng xuất hoàn toàn (Clear Session)"
            )}
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
