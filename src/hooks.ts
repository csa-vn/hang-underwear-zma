import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { MutableRefObject, useLayoutEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { UIMatch, useMatches } from "react-router-dom";
import { cartState, cartTotalState, userState } from "@/state";
import { Cart, CartItem, Product, SelectedOptions } from "@/types";
import { getDefaultOptions, isIdentical } from "@/utils/cart";
import { getConfig } from "@/utils/template";
import { openChat, purchase } from "zmp-sdk";
import { calculatePoints } from "@/utils/points";
import { savePointsTransaction } from "@/services/sheet.service";

export function useRealHeight(
  element: MutableRefObject<HTMLDivElement | null>,
  defaultValue?: number
) {
  const [height, setHeight] = useState(defaultValue ?? 0);
  useLayoutEffect(() => {
    if (element.current && typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver((entries: ResizeObserverEntry[]) => {
        const [{ contentRect }] = entries;
        setHeight(contentRect.height);
      });
      ro.observe(element.current);
      return () => ro.disconnect();
    }
    return () => {};
  }, [element.current]);

  if (typeof ResizeObserver === "undefined") {
    return -1;
  }
  return height;
}

export function useAddToCart(product: Product, editingCartItemId?: number) {
  const [cart, setCart] = useAtom(cartState);
  const user = useAtomValue(userState); // Lấy user state ở đầu hook
  const editing = useMemo(
    () => cart.find((item) => item.id === editingCartItemId),
    [cart, editingCartItemId]
  );

  const [options, setOptions] = useState<SelectedOptions>(
    editing ? editing.options : getDefaultOptions(product)
  );

  function handleReplace(quantity: number, cart: Cart, editing: CartItem) {
    if (quantity === 0) {
      // the user wants to remove this item.
      cart.splice(cart.indexOf(editing), 1);
    } else {
      const existed = cart.find(
        (item) =>
          item.id != editingCartItemId &&
          item.product.id === product.id &&
          isIdentical(item.options, options)
      );
      if (existed) {
        // there's another identical item in the cart; let's remove it and update the quantity in the editing item.
        cart.splice(cart.indexOf(existed), 1);
      }
      cart.splice(cart.indexOf(editing), 1, {
        ...editing,
        options,
        quantity: existed
          ? existed.quantity + quantity // updating the quantity of the identical item.
          : quantity,
      });
    }
  }

  function handleAppend(quantity: number, cart: Cart) {
    const existed = cart.find(
      (item) =>
        item.product.id === product.id && isIdentical(item.options, options)
    );
    if (existed) {
      // merging with another identical item in the cart.
      cart.splice(cart.indexOf(existed), 1, {
        ...existed,
        quantity: existed.quantity + quantity,
      });
    } else {
      // this item is new, appending it to the cart.
      cart.push({
        id: cart.length + 1,
        product,
        options,
        quantity,
      });
    }
  }

  const addToCart = (quantity: number) => {
    // Kiểm tra đăng nhập trước khi thêm vào giỏ hàng
    if (!user?.userInfo?.id) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!", {
        icon: "🔐",
      });
      return;
    }

    setCart((cart) => {
      const res = [...cart];
      if (editing) {
        handleReplace(quantity, res, editing);
      } else {
        handleAppend(quantity, res);
      }
      return res;
    });
  };

  return { addToCart, options, setOptions };
}

export function useCustomerSupport() {
  return () =>
    openChat({
      type: "oa",
      id: getConfig((config) => config.template.oaIDtoOpenChat),
    });
}

export function useToBeImplemented() {
  return () =>
    toast("Chức năng dành cho các bên tích hợp phát triển...", {
      icon: "🛠️",
    });
}

export function useCheckout() {
  const { totalAmount, totalItems } = useAtomValue(cartTotalState);
  const cart = useAtomValue(cartState);
  const setCart = useSetAtom(cartState);
  const user = useAtomValue(userState);

  return async () => {
    // Kiểm tra đăng nhập
    if (!user?.userInfo?.id) {
      toast.error("Vui lòng đăng nhập để đặt hàng!", {
        icon: "🔐",
      });
      return;
    }

    // Kiểm tra giỏ hàng không trống
    if (totalItems === 0) {
      toast.error("Giỏ hàng trống!", {
        icon: "🛒",
      });
      return;
    }

    try {
      // Bỏ qua phần thanh toán thực tế vì chúng ta chỉ test hệ thống tích điểm
      // await purchase({
      //   amount: totalAmount,
      //   desc: "Thanh toán đơn hàng",
      //   method: "",
      // });

      // Tính điểm dựa trên quy tắc
      const pointsEarned = calculatePoints(totalAmount);

      // Tạo ID đơn hàng
      const orderId = `ORDER_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Lấy danh sách tên sản phẩm từ giỏ hàng
      const productNames = cart.map((item) => item.product.name).join(", ");

      toast.success(
        `Thanh toán thành công! Bạn được cộng ${pointsEarned} điểm`,
        {
          icon: "🎉",
          duration: 4000,
        }
      );

      // Lưu thông tin tích điểm và cập nhật thông tin thành viên
      try {
        // Chỉ cần gọi một hàm duy nhất - sẽ cập nhật cả điểm và đơn hàng trong sheet thành viên
        await savePointsTransaction(
          user.userInfo.id,
          orderId,
          totalAmount,
          pointsEarned,
          productNames
        );

        console.log(
          "✅ Đã cập nhật điểm và đơn hàng trong sheet Thông tin thành viên"
        );
      } catch (error) {
        console.warn("⚠️ Cập nhật thông tin thất bại:", error);
        // Không show lỗi cho user, chỉ log
      }

      // Clear giỏ hàng
      setCart([]);
    } catch (error) {
      // Vì đã bỏ purchase() nên không còn lỗi thanh toán nữa
      toast.error("Có lỗi xảy ra khi xử lý đơn hàng!");
      console.warn(error);
    }
  };
}

export function useRouteHandle() {
  const matches = useMatches() as UIMatch<
    undefined,
    {
      title?: string | Function;
      logo?: boolean;
      back?: boolean;
      scrollRestoration?: number;
    }
  >[];
  const lastMatch = matches[matches.length - 1];

  return [lastMatch.handle, lastMatch, matches] as const;
}
