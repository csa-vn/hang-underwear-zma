import Section from "@/components/layout/section";
import { useAtomValue } from "jotai";
import { productsState } from "@/state";
import ProductGrid from "@/components/product/product-grid";

export default function SleepSportCategories() {
  const allProducts = useAtomValue(productsState);

  // Lọc sản phẩm đồ thể thao theo tag trong CSV
  const sleepSportProducts = allProducts.filter((product) => {
    const productTags = product.gender || ""; // Tag column is stored in gender field
    const tags = productTags.split(",").map((tag) => tag.trim().toLowerCase());
    return tags.includes("đồ thể thao");
  });

  const topSleepSportProducts = sleepSportProducts.slice(0, 4);

  return (
    <Section
      title="Đồ ngủ & Thể thao"
      viewMoreTo="/category-products/sleep-sport"
    >
      <ProductGrid products={topSleepSportProducts} />
    </Section>
  );
}
