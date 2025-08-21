import React, { createContext, useContext, useState, ReactNode } from 'react';
import OrderNotification from './order-notification';

interface OrderNotificationContextType {
  showOrderNotification: (productName: string) => void;
}

const OrderNotificationContext = createContext<OrderNotificationContextType | undefined>(undefined);

export const useOrderNotification = () => {
  const context = useContext(OrderNotificationContext);
  if (!context) {
    throw new Error('useOrderNotification must be used within an OrderNotificationProvider');
  }
  return context;
};

interface OrderNotificationProviderProps {
  children: ReactNode;
}

export const OrderNotificationProvider: React.FC<OrderNotificationProviderProps> = ({ children }) => {
  const [notification, setNotification] = useState<{
    isVisible: boolean;
    productName: string;
  }>({
    isVisible: false,
    productName: ''
  });

  const showOrderNotification = (productName: string) => {
    setNotification({
      isVisible: true,
      productName
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  return (
    <OrderNotificationContext.Provider value={{ showOrderNotification }}>
      {children}
      <OrderNotification
        isVisible={notification.isVisible}
        productName={notification.productName}
        onClose={hideNotification}
      />
    </OrderNotificationContext.Provider>
  );
};
