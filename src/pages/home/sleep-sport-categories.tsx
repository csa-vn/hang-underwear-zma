import Section from "@/components/section";
import { useAtomValue } from "jotai";
import { categoriesState, productsState } from "@/state";
import ProductGrid from "@/components/product-grid";

export default function SleepSportCategories() {
  const categories = useAtomValue(categoriesState);
  const allProducts = useAtomValue(productsState);
  // Lọc các danh mục Đồ ngủ & Thể thao
  const sleepSportCategories = categories.filter(
    (category) =>
      category.name.includes("Đồ ngủ") ||
      category.name.includes("Đồ lót") ||
      category.name.includes("Thể thao") ||
      category.name.includes("Đồ bơi")
  );
  const sleepSportCategoryIds = sleepSportCategories.map((cat) => cat.id);
  const sleepSportProducts = allProducts.filter((product) =>
    sleepSportCategoryIds.includes(product.category.id)
  );
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
