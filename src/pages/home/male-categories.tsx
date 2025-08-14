import Section from "@/components/section";
import { useAtomValue } from "jotai";
import { productsState } from "@/state";
import ProductGrid from "@/components/product-grid";

export default function MaleCategories() {
  const allProducts = useAtomValue(productsState);
  // Lọc sản phẩm có trường gender (giới tính) là 'nam'
  const maleProducts = allProducts.filter(
    (product) =>
      (product.gender || product["giới tính"] || "").toLowerCase() === "nam"
  );
  const topMaleProducts = maleProducts.slice(0, 4);
  return (
    <Section title="Danh mục Nam" viewMoreTo="/category-products/male">
      {topMaleProducts.length > 0 ? (
        <ProductGrid products={topMaleProducts} />
      ) : null}
    </Section>
  );
}
