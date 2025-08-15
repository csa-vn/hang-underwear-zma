import ProductGrid from "@/components/product-grid";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { productsState } from "@/state";

export interface RelatedProductsProps {
  currentProductId: number;
}

export default function RelatedProducts(props: RelatedProductsProps) {
  const products = useAtomValue(productsState);
  const otherProducts = useMemo(
    () =>
      products
        .filter((product) => product.id !== props.currentProductId)
        .slice(0, 8),
    [products, props.currentProductId]
  );

  return <ProductGrid replace products={otherProducts} />;
}
