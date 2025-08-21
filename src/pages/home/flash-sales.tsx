import ProductGrid from "@/components/product/product-grid";
import Section from "@/components/layout/section";
import { useAtomValue } from "jotai";
import { flashSaleProductsState } from "@/state";

export default function FlashSales() {
  const products = useAtomValue(flashSaleProductsState);

  return (
    <Section title="Flash Sales" viewMoreTo="/flash-sales">
      <ProductGrid products={products} />
    </Section>
  );
}
