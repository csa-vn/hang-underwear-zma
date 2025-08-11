import ProductGrid from "@/components/product-grid";
import Section from "@/components/section";
import { useAtomValue } from "jotai";
import { bestSellerProductsState } from "@/state";

export default function BestSeller() {
  const bestSellerProducts = useAtomValue(bestSellerProductsState);

  return (
    <Section title="Best Seller" viewMoreTo="/best-seller">
      <ProductGrid products={bestSellerProducts} />
    </Section>
  );
}
