import { Product } from "@/types";
import { formatPrice } from "@/utils/format";
import TransitionLink from "./transition-link";
import { useState } from "react";
import { useOrderNotification } from "./order-notification-provider";
import Button from "./button";
import { useAtom } from "jotai";
import { cartState } from "@/state";
import { getDefaultOptions } from "@/utils/cart";

export interface ProductItemProps {
  product: Product;
  /**
   * Whether to replace the current page when user clicks on this product item. Default behavior is to push a new page to the history stack.
   * This prop should be used when navigating to a new product detail from a current product detail page (related products, etc.)
   */
  replace?: boolean;
}

export default function ProductItem(props: ProductItemProps) {
  const [selected, setSelected] = useState(false);
  const { showOrderNotification } = useOrderNotification();
  const [cart, setCart] = useAtom(cartState);

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to product detail
    e.stopPropagation();
    
    // Get default options for the product
    const options = getDefaultOptions(props.product);
    
    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(item => 
      item.product.id === props.product.id &&
      item.options.size === options.size &&
      item.options.color === options.color
    );
    
    if (existingItemIndex >= 0) {
      // Update quantity if item already exists
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      // Add new item to cart
      const newCartItem = {
        id: Date.now(), // Simple ID generation
        product: props.product,
        options: options,
        quantity: 1
      };
      setCart([...cart, newCartItem]);
    }
    
    // Show order notification
    showOrderNotification(props.product.name);
  };

  return (
    <div className="flex flex-col cursor-pointer group">
      <TransitionLink
        className="flex flex-col"
        to={`/product/${props.product.id}`}
        replace={props.replace}
        onClick={() => setSelected(true)}
      >
        {({ isTransitioning }) => (
          <>
            <img
              src={props.product.image}
              className="w-full aspect-square object-cover rounded-t-lg"
              style={{
                viewTransitionName:
                  isTransitioning && selected // only animate the "clicked" product item in related products list
                    ? `product-image-${props.product.id}`
                    : undefined,
              }}
              alt={props.product.name}
            />
            <div className="py-2">
              <div className="text-3xs text-subtitle truncate">
                {props.product.category.name}
              </div>
              <div className="text-xs h-9 line-clamp-2">{props.product.name}</div>
              <div className="mt-0.5 text-sm font-medium">
                {formatPrice(props.product.price)}
              </div>
              <div className="text-3xs text-subtitle line-through">
                {formatPrice(props.product.price)}
              </div>
            </div>
          </>
        )}
      </TransitionLink>
      
      {/* Buy Now Button */}
      <div className="px-2 pb-2">
        <Button
          onClick={handleBuyNow}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
        >
          Mua ngay
        </Button>
      </div>
    </div>
  );
}
