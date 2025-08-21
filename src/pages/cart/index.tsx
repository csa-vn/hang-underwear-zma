import CartList from "./cart-list";
import CartSummary from "./cart-summary";
import HorizontalDivider from "@/components/layout/horizontal-divider";
import { useAtomValue } from "jotai";
import { cartState } from "@/state";
import { EmptyBoxIcon } from "@/components/common/vectors";
import SelectAll from "./select-all";
import { getUserInfo } from "zmp-sdk/apis";
export default function CartPage() {
  const cart = useAtomValue(cartState);

  if (!cart.length) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center space-y-8">
        <EmptyBoxIcon />
        <div className="text-2xs text-inactive text-center">
          Không có sản phẩm trong giỏ hàng
        </div>
      </div>
    );
  }
  return (
    <div className="w-full h-full flex flex-col">
      <SelectAll />
      <HorizontalDivider />
      <CartList />
      <HorizontalDivider />
      <CartSummary />
    </div>
  );
}
