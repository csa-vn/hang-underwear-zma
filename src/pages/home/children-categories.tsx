import Section from "@/components/layout/section";
import { useAtomValue } from "jotai";
import { productsState } from "@/state";
import ProductGrid from "@/components/product/product-grid";

export default function ChildrenCategories() {
  const allProducts = useAtomValue(productsState);

  // Lọc sản phẩm trẻ em theo tag trong CSV
  const childrenProducts = allProducts.filter((product) => {
    const productTags = product.gender || ""; // Tag column is stored in gender field
    const tags = productTags.split(",").map((tag) => tag.trim().toLowerCase());
    return tags.includes("trẻ em");
  });

  const topChildrenProducts = childrenProducts.slice(0, 4);

  return (
    <Section title="Danh mục Trẻ em" viewMoreTo="/category-products/children">
      {topChildrenProducts.length > 0 ? (
        <ProductGrid products={topChildrenProducts} />
      ) : null}
    </Section>
  );
}
