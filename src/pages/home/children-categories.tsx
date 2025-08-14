import Section from "@/components/section";
import { useAtomValue } from "jotai";
import { categoriesState, productsState } from "@/state";
import ProductGrid from "@/components/product-grid";

export default function ChildrenCategories() {
  const categories = useAtomValue(categoriesState);
  const allProducts = useAtomValue(productsState);
  // Lọc các danh mục trẻ em
  // Lọc sản phẩm trẻ em theo nhiều tiêu chí
  const childrenCategoryIds = categories
    .filter((category) =>
      ["bé trai", "bé gái", "trẻ em", "kid", "children"].some((kw) =>
        category.name.toLowerCase().includes(kw)
      )
    )
    .map((cat) => cat.id);

  const childrenProducts = allProducts.filter(
    (product) =>
      childrenCategoryIds.includes(product.category.id) ||
      (product.gender || product["giới tính"] || "").toLowerCase() === "trẻ em"
  );
  const topChildrenProducts = childrenProducts.slice(0, 4);
  return (
    <Section title="Danh mục Trẻ em" viewMoreTo="/category-products/children">
      {topChildrenProducts.length > 0 ? (
        <ProductGrid products={topChildrenProducts} />
      ) : null}
    </Section>
  );
}
