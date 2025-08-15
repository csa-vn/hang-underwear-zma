import { Outlet } from "react-router-dom";
import Header from "./header";
import Footer from "./footer";
import { Suspense, useState, useEffect } from "react";
import { PageSkeleton } from "./skeleton";
import { Toaster } from "react-hot-toast";
import { ScrollRestoration } from "./scroll-restoration";
import { OrderNotificationProvider } from "./order-notification-provider";
import UIModeModal, { UIModeChangeButton } from "./ui-mode-selector";
import SimpleProductList from "./simple-product-list";
import { useAtomValue } from "jotai";
import { uiModeState, UIMode } from "@/state";

export default function Layout() {
  const currentUIMode = useAtomValue(uiModeState);
  const [showModeSelector, setShowModeSelector] = useState(false);

  useEffect(() => {
    // Show mode selector if no preference is set
    if (currentUIMode === null) {
      setShowModeSelector(true);
    }
  }, [currentUIMode]);

  const handleModeSelect = (mode: UIMode) => {
    setShowModeSelector(false);
  };

  // Apply simple mode styles
  const isSimpleMode = currentUIMode === "simple";

  // If simple mode, show only the simple product list
  if (isSimpleMode) {
    return (
      <OrderNotificationProvider>
        <div className="w-screen h-screen flex flex-col bg-white">
          {/* Simple header with mode switcher */}
          <div className="bg-white shadow-sm p-4 flex justify-end items-center border-b-2 border-yellow-400">
            <UIModeChangeButton
              currentMode={currentUIMode}
              onModeChange={() => setShowModeSelector(true)}
            />
          </div>

          {/* Simple content */}
          <div className="flex-1 overflow-y-auto">
            <SimpleProductList />
          </div>

          <Toaster
            containerClassName="toast-container"
            containerStyle={{
              top: "calc(50% - 24px)",
            }}
          />
          <ScrollRestoration />

          {/* UI Mode Selector Modal */}
          <UIModeModal isOpen={showModeSelector} onSelect={handleModeSelect} />
        </div>
      </OrderNotificationProvider>
    );
  }

  // Normal mode layout
  return (
    <OrderNotificationProvider>
      <div className="w-screen h-screen flex flex-col bg-background text-foreground">
        <Header />
        <div className="flex-1 overflow-y-auto">
          <Suspense fallback={<PageSkeleton />}>
            <Outlet />
          </Suspense>
        </div>
        <Footer />
        <Toaster
          containerClassName="toast-container"
          containerStyle={{
            top: "calc(50% - 24px)",
          }}
        />
        <ScrollRestoration />

        {/* UI Mode Selector Modal */}
        <UIModeModal isOpen={showModeSelector} onSelect={handleModeSelect} />
      </div>
    </OrderNotificationProvider>
  );
}
