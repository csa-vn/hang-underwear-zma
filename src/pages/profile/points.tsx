import { useAtomValue } from "jotai";
import { userState } from "@/state";
import pointsCover from "@/static/points-cover.png";
import Barcode from "./barcode";

export default function Points() {
  const user = useAtomValue(userState);

  return (
    <div
      className="rounded-lg bg-primary text-white p-8 pt-6 bg-cover text-center"
      style={{
        backgroundImage: `url(${pointsCover})`,
      }}
    >
      {/* Thông tin thành viên */}
      <div className="mb-4">
        {user?.userInfo?.avatar && (
          <img
            src={user.userInfo.avatar}
            alt="Avatar"
            className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-white"
          />
        )}
        <div className="text-lg font-medium opacity-95">
          {user?.userInfo?.name || "Thành viên"}
        </div>
        <div className="text-xs opacity-75">
          ID: {user?.userInfo?.id?.slice(-8) || "********"}
        </div>
      </div>

      {/* Điểm tích lũy */}
      <div className="text-xl font-medium opacity-95">20 điểm</div>
      <div className="opacity-95 text-2xs">HSD: 02/12/2024</div>
      <div className="bg-white rounded-lg mt-2 py-2.5 space-y-2.5 flex flex-col items-center">
        <div className="text-2xs text-subtitle text-center">
          Quét mã để tích điểm
        </div>
        <Barcode />
      </div>
    </div>
  );
}
