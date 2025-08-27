import { useAtomValue } from "jotai";
import { userState } from "@/state";
import pointsCover from "@/static/points-cover.png";
import Barcode from "./barcode";
import { useState, useEffect } from "react";
import { getMemberByZaloId } from "@/services/sheet.service";

export default function Points() {
  const user = useAtomValue(userState);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(false);
  const [forceLogout, setForceLogout] = useState(
    () => localStorage.getItem("zalo_force_logout") === "true"
  );

  // Listen for localStorage changes và custom events
  useEffect(() => {
    const handleStorageChange = () => {
      setForceLogout(localStorage.getItem("zalo_force_logout") === "true");
    };

    const handleForceLogoutChanged = () => {
      setForceLogout(localStorage.getItem("zalo_force_logout") === "true");
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("forceLogoutChanged", handleForceLogoutChanged);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "forceLogoutChanged",
        handleForceLogoutChanged
      );
    };
  }, []);

  // Kiểm tra kỹ hơn: user phải có userInfo và id không rỗng
  // VÀ không bị force logout
  const isLoggedIn =
    !forceLogout &&
    user &&
    user.userInfo &&
    user.userInfo.id &&
    user.userInfo.id.trim() !== "";

  // Load điểm từ Google Sheet khi đã đăng nhập
  useEffect(() => {
    console.log(
      "🎯 [Points] isLoggedIn:",
      isLoggedIn,
      "forceLogout:",
      forceLogout,
      "userId:",
      user?.userInfo?.id
    );

    if (isLoggedIn && user.userInfo?.id) {
      setLoading(true);
      console.log("📊 [Points] Loading points for user:", user.userInfo.id);
      getMemberByZaloId(user.userInfo.id)
        .then((memberData) => {
          console.log("📊 [Points] Member data received:", memberData);
          if (memberData) {
            setUserPoints(memberData.points || 0);
            console.log("📊 [Points] Set user points:", memberData.points || 0);
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("❌ [Points] Lỗi khi lấy điểm:", error);
          setLoading(false);
        });
    } else {
      // Clear điểm khi đăng xuất hoặc bị force logout
      console.log(
        "🧹 [Points] Clearing points - not logged in or force logout"
      );
      setUserPoints(0);
    }
  }, [isLoggedIn, user?.userInfo?.id, forceLogout]);

  return (
    <div
      className="rounded-lg bg-primary text-white p-8 pt-6 bg-cover text-center"
      style={{
        backgroundImage: `url(${pointsCover})`,
      }}
    >
      {isLoggedIn ? (
        <>
          {/* Điểm tích lũy */}
          <div className="text-xl font-medium opacity-95">
            {loading ? "..." : `${userPoints} điểm`}
          </div>
          <div className="opacity-95 text-2xs">HSD: 02/12/2024</div>
          <div className="bg-white rounded-lg mt-2 py-2.5 space-y-2.5 flex flex-col items-center">
            <div className="text-2xs text-subtitle text-center">
              Quét mã để tích điểm
            </div>
            <Barcode />
          </div>
        </>
      ) : (
        <div className="text-center text-white opacity-75 py-4">
          Đăng nhập để xem điểm tích lũy
        </div>
      )}
    </div>
  );
}
