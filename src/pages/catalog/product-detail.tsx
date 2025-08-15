import Button from "@/components/button";
import HorizontalDivider from "@/components/horizontal-divider";
import { useAtomValue } from "jotai";
import { userState } from "@/state";
import { sendOANotification } from "@/services/oa.service";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { productState } from "@/state";
import { formatPrice } from "@/utils/format";
import VariantPicker from "./variant-picker";
import { useEffect, useRef, useState } from "react";
import RelatedProducts from "./related-products";
import { useAddToCart } from "@/hooks";
import toast from "react-hot-toast";
import { Color, Size } from "@/types";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = useAtomValue(productState(Number(id)))!;
  const [selectedColor, setSelectedColor] = useState<Color>();
  const [selectedSize, setSelectedSize] = useState<Size>();

  useEffect(() => {
    setSelectedColor(product.colors?.[0]);
    setSelectedSize(product.sizes?.[0]);
  }, [id]);

  const { addToCart, setOptions } = useAddToCart(product);

  useEffect(() => {
    setOptions({
      size: selectedSize,
      color: selectedColor?.name,
    });
  }, [selectedSize, selectedColor]);

  const user = useAtomValue(userState);
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="w-full px-4">
          <div className="py-2">
            <img
              key={product.id}
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
              style={{
                viewTransitionName: `product-image-${product.id}`,
              }}
            />
          </div>
          {/* Product name: moved above price, bold and larger */}
          <div className="text-xl font-bold text-gray-900 mt-2">
            {product.name}
          </div>
          <div className="text-2xl font-medium text-primary mt-1">
            {formatPrice(product.price)}
          </div>
          {!!product.originalPrice && (
            <div className="text-2xs text-subtitle line-through">
              {formatPrice(product.originalPrice)}
            </div>
          )}
          {/* Share button removed as requested */}
          {/* Đã xóa phần chọn Color và Size */}
        </div>
        {/* Product details as paragraph for accessibility */}
        {product.details && product.details.length > 0 && (
          <>
            <div className="bg-section h-2 w-full"></div>
            <div className="px-4 py-2 text-base text-gray-800">
              {product.details.map((detail, idx) => (
                <p key={idx} style={{ marginBottom: "0.5em" }}>
                  <strong>{detail.title}:</strong> {detail.content}
                </p>
              ))}
              {/* Thêm link shop và địa chỉ */}
              {product.linkShop && (
                <div style={{ marginTop: "1em" }}>
                  <strong>Link shop:</strong>{" "}
                  <a
                    href={product.linkShop}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Tiktok
                  </a>
                </div>
              )}
              {product.address && (
                <div style={{ marginTop: "0.5em" }}>
                  <strong>Địa chỉ:</strong> {product.address}
                </div>
              )}
            </div>
          </>
        )}
        <div className="bg-section h-2 w-full"></div>
        <div className="font-medium py-2 px-4">
          <div className="pt-2 pb-2.5">Sản phẩm khác</div>
          <HorizontalDivider />
        </div>
        <RelatedProducts currentProductId={product.id} />
      </div>

      <HorizontalDivider />
      <div className="flex-none grid grid-cols-2 gap-2 py-3 px-4">
        <Button
          large
          onClick={() => {
            addToCart(1);
            toast.success("Đã thêm vào giỏ hàng");
          }}
        >
          Thêm vào giỏ
        </Button>
        <Button
          large
          primary
          onClick={async () => {
            addToCart(1);
            // Gửi OA
            const userId = user?.userInfo?.id;
            if (userId) {
              await sendOANotification({ userId, productName: product.name });
            }
            navigate("/cart");
          }}
        >
          Mua ngay
        </Button>
      </div>
    </div>
  );
}
