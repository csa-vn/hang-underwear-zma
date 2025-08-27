import Button from "@/components/ui/button";
import { CustomerSupportIcon } from "@/components/common/vectors";
import { CheckoutPopup } from "@/components/ui/checkout-popup";
import { useCheckout, useCustomerSupport } from "@/hooks";
import { useAtomValue } from "jotai";
import { cartTotalState } from "@/state";
import { formatPrice } from "@/utils/format";

export default function CartSummary() {
  const { totalItems, totalAmount } = useAtomValue(cartTotalState);
  const contact = useCustomerSupport();
  const { checkoutState, startCheckout, closePopups } = useCheckout();

  return (
    <>
      <div className="flex-none flex items-center py-3 px-4 space-x-2">
        <div className="space-y-1 flex-1">
          <div className="text-2xs text-subtitle">Tổng cộng ({totalItems})</div>
          <div className="text-sm font-medium text-primary">
            {formatPrice(totalAmount)}
          </div>
        </div>
        <Button className="w-10 h-10 !p-2" onClick={contact}>
          <CustomerSupportIcon />
        </Button>
        <Button
          primary
          onClick={startCheckout}
          disabled={totalItems === 0 || checkoutState.isProcessing}
        >
          {checkoutState.isProcessing ? "Đang xử lý..." : "Mua ngay"}
        </Button>
      </div>

      {/* Checkout Popups */}
      <CheckoutPopup isOpen={checkoutState.isProcessing} type="loading" />

      <CheckoutPopup
        isOpen={checkoutState.showSuccess}
        type="success"
        pointsEarned={checkoutState.pointsEarned}
        onClose={closePopups}
      />

      <CheckoutPopup
        isOpen={checkoutState.showError}
        type="error"
        message={checkoutState.errorMessage}
        onClose={closePopups}
      />
    </>
  );
}
