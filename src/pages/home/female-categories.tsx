import Section from "@/components/section";
import TransitionLink from "@/components/transition-link";
import { useAtomValue } from "jotai";
import { categoriesState, productsState } from "@/state";
import { useEffect, useState } from "react";
import ProductGrid from "@/components/product-grid";

export default function FemaleCategories() {
  const categories = useAtomValue(categoriesState);
  const allProducts = useAtomValue(productsState);
  // Lọc các sản phẩm thuộc danh mục nữ
  const femaleCategories = categories.filter(
    (category) =>
      category.name.includes("Đầm") ||
      category.name.includes("Chân váy") ||
      category.name.includes("Blazer") ||
      category.name.includes("Túi xách")
  );

  // Lọc sản phẩm nữ theo đúng id danh mục nữ
  const femaleCategoryIds = femaleCategories.map((cat) => cat.id);
  const femaleProducts = allProducts.filter((product) =>
    femaleCategoryIds.includes(product.category.id)
  );

  // Giới hạn số lượng sản phẩm hiển thị (ví dụ: 4 sản phẩm)
  const topFemaleProducts = femaleProducts.slice(0, 4);

  return (
    <Section title="Danh mục Nữ" viewMoreTo="/category-products/female">
      <ProductGrid products={topFemaleProducts} />
    </Section>
  );
}
