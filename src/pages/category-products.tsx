import { useParams } from "react-router-dom";
import ProductGrid from "@/components/product/product-grid";
import Section from "@/components/layout/section";
import { useAtomValue } from "jotai";
import { productsState } from "@/state";

const categoryMap: Record<string, string> = {
  female: "Sản phẩm Nữ",
  male: "Sản phẩm Nam",
  children: "Sản phẩm Trẻ em",
  "sleep-sport": "Đồ ngủ & Thể thao",
  "best-seller": "Best Seller",
};

export default function CategoryProductsPage() {
  const { category } = useParams();
  const products = useAtomValue(productsState);

  let filteredProducts = products;
  let title = "Sản phẩm";

  // Handle hardcoded categories from home page using tag filtering
  if (category === "female") {
    filteredProducts = products.filter((product) => {
      const productTags = product.gender || "";
      const tags = productTags
        .split(",")
        .map((tag) => tag.trim().toLowerCase());
      return tags.includes("nữ");
    });
    title = categoryMap[category];
  } else if (category === "male") {
    filteredProducts = products.filter((product) => {
      const productTags = product.gender || "";
      const tags = productTags
        .split(",")
        .map((tag) => tag.trim().toLowerCase());
      return tags.includes("nam");
    });
    title = categoryMap[category];
  } else if (category === "children") {
    filteredProducts = products.filter((product) => {
      const productTags = product.gender || "";
      const tags = productTags
        .split(",")
        .map((tag) => tag.trim().toLowerCase());
      return tags.includes("trẻ em");
    });
    title = categoryMap[category];
  } else if (category === "sleep-sport") {
    filteredProducts = products.filter((product) => {
      const productTags = product.gender || "";
      const tags = productTags
        .split(",")
        .map((tag) => tag.trim().toLowerCase());
      return tags.includes("đồ thể thao");
    });
    title = categoryMap[category];
  } else if (category === "best-seller") {
    // Keep all products for best seller (could add specific logic later)
    filteredProducts = products;
    title = categoryMap[category];
  } else if (category) {
    // Handle real category names from the sheet
    const decodedCategory = decodeURIComponent(category);
    filteredProducts = products.filter(
      (p) => p.category.name === decodedCategory
    );
    title = decodedCategory;
  }

  return (
    <Section title={title}>
      <ProductGrid products={filteredProducts} />
    </Section>
  );
}
