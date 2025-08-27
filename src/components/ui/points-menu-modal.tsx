import React from "react";
import { useNavigate } from "react-router-dom";

interface PointsMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PointsMenuModal({
  isOpen,
  onClose,
}: PointsMenuModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const menuItems = [
    {
      id: "member-ranks",
      title: "Hạng Thành Viên",
      description: "Xem thông tin các hạng thành viên",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6,2L18,2L22,8L12,22L2,8L6,2M12,9L7.5,7L9,4L15,4L16.5,7L12,9M8.5,7L12,9L15.5,7L12,16L8.5,7Z" />
        </svg>
      ),
      color: "from-cyan-500 to-blue-600",
      bgColor: "bg-cyan-50",
      borderColor: "border-cyan-200",
      route: "/profile/member-ranks",
    },
    {
      id: "points-table",
      title: "Bảng Tích Điểm",
      description: "Cách thức tích và đổi điểm",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
      ),
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      route: "/profile/points-table",
    },
  ];

  const handleNavigate = (route: string) => {
    navigate(route);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 max-w-sm mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-800">Tích Điểm</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Menu Items */}
        <div className="p-4 space-y-3">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.route)}
              className={`w-full ${item.bgColor} border ${item.borderColor} rounded-xl p-4 text-left hover:shadow-md transition-all duration-200 hover:scale-[1.02]`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center text-white shadow-sm`}
                >
                  {item.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-base">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {item.description}
                  </p>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 rounded-b-2xl">
          <p className="text-xs text-gray-500 text-center">
            💡 Tích điểm để nhận ưu đãi hấp dẫn
          </p>
        </div>
      </div>
    </>
  );
}
