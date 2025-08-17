import Section from "@/components/section";
import { useAtomValue } from "jotai";
import { productsState } from "@/state";
import ProductGrid from "@/components/product-grid";

export default function MaleCategories() {
  const allProducts = useAtomValue(productsState);
  
  // Lọc sản phẩm nam theo tag trong CSV
  const maleProducts = allProducts.filter((product) => {
    const productTags = product.gender || ""; // Tag column is stored in gender field
    const tags = productTags.split(",").map(tag => tag.trim().toLowerCase());
    return tags.includes("nam");
  });
  
  const topMaleProducts = maleProducts.slice(0, 4);
  
  return (
    <Section title="Danh mục Nam" viewMoreTo="/category-products/male">
      {topMaleProducts.length > 0 ? (
        <ProductGrid products={topMaleProducts} />
      ) : null}
    </Section>
  );
}
