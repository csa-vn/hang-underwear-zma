import { useEffect, useState } from "react";
import { showOAWidget, getUserInfo, followOA, unfollowOA } from "zmp-sdk";
import { toast } from "react-hot-toast";

export default function FollowOAWidget() {
  const [followStatus, setFollowStatus] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const oaId = import.meta.env.VITE_OFFICIAL_ACCOUNT_ID;

  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        const userInfo = await getUserInfo();
        const isFollowed = userInfo?.userInfo?.followedOA || false;
        setFollowStatus(isFollowed);

        console.log("🔍 DEBUG - OA Follow Status:", isFollowed);
      } catch (error) {
        console.error("Error checking follow status:", error);
        setFollowStatus(false);
      } finally {
        setLoading(false);
      }
    };

    checkFollowStatus();
  }, []);

  // Show OA Widget as fallback
  useEffect(() => {
    if (followStatus === false && oaId) {
      console.log("🔍 DEBUG - Showing fallback OA Widget for OA ID:", oaId);

      showOAWidget({
        id: "oaWidget",
        oaId: oaId,
        guidingText: "Hoặc nhấn để theo dõi trực tiếp",
        color: "#10B981",
        callback: (data: any) => {
          console.log("🔍 DEBUG - OA Widget callback:", data);
          if (data.success) {
            console.log("✅ User đã follow OA qua widget!");
            setFollowStatus(true);
            toast.success("🎉 Đã theo dõi OA thành công qua widget!");
          }
        },
      });
    }
  }, [followStatus, oaId]);

  // Handle follow OA
  const handleFollowOA = async () => {
    if (!oaId) {
      toast.error("Không tìm thấy ID Official Account");
      return;
    }

    setActionLoading(true);
    try {
      console.log("🔍 DEBUG - Following OA:", oaId);

      await followOA({
        id: oaId,
      });

      setFollowStatus(true);
      toast.success("🎉 Đã theo dõi Official Account thành công!");
      console.log("✅ Follow OA success");
    } catch (error) {
      console.error("❌ Follow OA error:", error);
      toast.error("Không thể theo dõi OA. Vui lòng thử lại!");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle unfollow OA
  const handleUnfollowOA = async () => {
    if (!oaId) {
      toast.error("Không tìm thấy ID Official Account");
      return;
    }

    setActionLoading(true);
    try {
      console.log("🔍 DEBUG - Unfollowing OA:", oaId);

      await unfollowOA({
        id: oaId,
      });

      setFollowStatus(false);
      toast.success("Đã hủy theo dõi Official Account");
      console.log("✅ Unfollow OA success");
    } catch (error) {
      console.error("❌ Unfollow OA error:", error);
      toast.error("Không thể hủy theo dõi OA. Vui lòng thử lại!");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              followStatus ? "bg-green-100" : "bg-gray-100"
            }`}
          >
            <span
              className={`text-lg ${
                followStatus ? "text-green-600" : "text-gray-400"
              }`}
            >
              {followStatus ? "✓" : "○"}
            </span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {followStatus ? "Đã theo dõi OA" : "Theo dõi Official Account"}
            </div>
            <div className="text-xs text-gray-500">
              {followStatus
                ? "🎉 Bạn sẽ nhận được thông báo ưu đãi mới nhất"
                : "💡 Nhận thông báo về các đặc quyền ưu đãi"}
            </div>
          </div>
        </div>

        <button
          onClick={followStatus ? handleUnfollowOA : handleFollowOA}
          disabled={actionLoading || !oaId}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
            followStatus
              ? "bg-red-100 text-red-600 hover:bg-red-200"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {actionLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              <span>...</span>
            </div>
          ) : followStatus ? (
            "Hủy theo dõi"
          ) : (
            "Theo dõi"
          )}
        </button>
      </div>

      {/* Fallback OA Widget nếu API không hoạt động */}
      {!followStatus && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-400 mb-2">
            Hoặc sử dụng widget Zalo:
          </div>
          <div id="oaWidget" className="w-full" />
        </div>
      )}
    </div>
  );
}
