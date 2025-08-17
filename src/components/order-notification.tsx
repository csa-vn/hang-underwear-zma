import React, { useEffect, useState } from "react";

interface OrderNotificationProps {
  isVisible: boolean;
  productName: string;
  onClose: () => void;
  autoCloseDelay?: number;
}

const OrderNotification: React.FC<OrderNotificationProps> = ({
  isVisible,
  productName,
  onClose,
  autoCloseDelay = 3000,
}) => {
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsShowing(true);
      const timer = setTimeout(() => {
        setIsShowing(false);
        setTimeout(onClose, 300); // Wait for animation to finish
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isVisible, autoCloseDelay, onClose]);

  if (!isVisible && !isShowing) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg transform transition-all duration-300 z-50 max-w-sm ${
        isShowing ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
      style={{ minWidth: "280px" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-white rounded-full p-1 mr-3">
            <svg
              className="w-6 h-6 text-green-500"
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
          <div>
            <div className="font-semibold text-lg">Đã Thêm Vào Giỏ Hàng</div>
            <div className="text-sm opacity-90">
              {productName} đã được thêm vào giỏ hàng
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            setIsShowing(false);
            setTimeout(onClose, 300);
          }}
          className="ml-2 text-white hover:text-gray-200 text-xl font-bold"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default OrderNotification;
