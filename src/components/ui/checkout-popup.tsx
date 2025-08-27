import React from "react";

interface CheckoutPopupProps {
  isOpen: boolean;
  type: "loading" | "success" | "error";
  message?: string;
  pointsEarned?: number;
  onClose?: () => void;
}

export function CheckoutPopup({
  isOpen,
  type,
  message,
  pointsEarned,
  onClose,
}: CheckoutPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl">
        {/* Loading State */}
        {type === "loading" && (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Đang xử lý thanh toán...
            </h3>
            <p className="text-sm text-gray-600">Vui lòng chờ trong giây lát</p>
          </div>
        )}

        {/* Success State */}
        {type === "success" && (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              🎉 Thanh toán thành công!
            </h3>
            {pointsEarned && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm font-medium text-yellow-800">
                  🎁 Bạn được cộng{" "}
                  <span className="font-bold">{pointsEarned} điểm</span>
                </p>
              </div>
            )}
            <p className="text-sm text-gray-600 mb-4">
              {message || "Đơn hàng của bạn đã được xử lý thành công!"}
            </p>
            <button
              onClick={onClose}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Hoàn tất
            </button>
          </div>
        )}

        {/* Error State */}
        {type === "error" && (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
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
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Có lỗi xảy ra
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {message || "Vui lòng thử lại sau!"}
            </p>
            <button
              onClick={onClose}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Đóng
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
