import Section from "@/components/section";
import { useAtomValue } from "jotai";
import { productsState } from "@/state";
import ProductGrid from "@/components/product-grid";

export default function FemaleCategories() {
  const allProducts = useAtomValue(productsState);

  // Lọc sản phẩm nữ theo tag trong CSV
  const femaleProducts = allProducts.filter((product) => {
    const productTags = product.gender || ""; // Tag column is stored in gender field
    const tags = productTags.split(",").map((tag) => tag.trim().toLowerCase());
    return tags.includes("nữ");
  });

  // Giới hạn số lượng sản phẩm hiển thị (ví dụ: 4 sản phẩm)
  const topFemaleProducts = femaleProducts.slice(0, 4);

  return (
    <Section title="Danh mục Nữ" viewMoreTo="/category-products/female">
      <ProductGrid products={topFemaleProducts} />
    </Section>
  );
}
