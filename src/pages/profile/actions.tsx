import React from "react";
import { useNavigate } from "react-router-dom";
import {
  OrderHistoryIcon,
  PackageIcon,
  ProfileIcon,
} from "@/components/common/vectors";
import { useToBeImplemented } from "@/hooks";

// Star icon for points system
const StarIcon = ({ active }: { active?: boolean }) => (
  <svg
    className="w-5 h-5"
    fill={active ? "var(--primary)" : "none"}
    stroke={active ? "none" : "#6F7071"}
    viewBox="0 0 20 20"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export default function ProfileActions() {
  const navigate = useNavigate();
  const toBeImplemented = useToBeImplemented();

  return (
    <div className="bg-white rounded-lg p-4 grid grid-cols-4 gap-3 border-[0.5px] border-black/15 justify-items-center">
      {[
        {
          label: "Thông tin tài khoản",
          icon: ProfileIcon,
          onClick: toBeImplemented,
        },
        {
          label: "Theo dõi đơn hàng",
          icon: PackageIcon,
          onClick: toBeImplemented,
        },
        {
          label: "Lịch sử mua hàng",
          icon: OrderHistoryIcon,
          onClick: toBeImplemented,
        },
        {
          label: "Tích Điểm",
          icon: StarIcon,
          onClick: () => navigate("/profile/points-info"),
        },
      ].map((action) => (
        <div
          key={action.label}
          className="flex flex-col gap-2 items-center cursor-pointer hover:opacity-80 transition-opacity"
          onClick={action.onClick}
        >
          <div className="w-10 h-10 rounded-full bg-[#EBEFF7] flex items-center justify-center">
            <action.icon active />
          </div>
          <div className="text-2xs text-center leading-tight">
            {action.label}
          </div>
        </div>
      ))}
    </div>
  );
}
