import { Outlet } from "react-router-dom";
import Header from "./header";
import Footer from "./footer";
import { Suspense } from "react";
import { PageSkeleton } from "./skeleton";
import { Toaster } from "react-hot-toast";
import { ScrollRestoration } from "./scroll-restoration";
import { OrderNotificationProvider } from "./order-notification-provider";

export default function Layout() {
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
      </div>
    </OrderNotificationProvider>
  );
}
