import ProductFilter from "./product-filter";
import HorizontalDivider from "@/components/layout/horizontal-divider";
import ProductGrid from "@/components/product/product-grid";
import { useAtomValue } from "jotai";
import { filteredProductsState } from "@/state";

export default function ProductListPage() {
  const products = useAtomValue(filteredProductsState);

  return (
    <>
      <ProductFilter />
      <HorizontalDivider />
      <ProductGrid products={products} className="pt-4 pb-[13px]" />
    </>
  );
}
