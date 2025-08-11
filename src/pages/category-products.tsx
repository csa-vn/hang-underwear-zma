import { useParams } from "react-router-dom";
import ProductGrid from "@/components/product-grid";
import Section from "@/components/section";

// Mock product data
const mockProducts = [
  { id: 1, name: "Áo len nữ", category: "female", image: "https://stc-zmp.zadn.vn/zaui-fashion/category/ao-len.webp", price: 189000 },
  { id: 2, name: "Đầm dạ hội", category: "female", image: "https://stc-zmp.zadn.vn/zaui-fashion/category/dam.webp", price: 259000 },
  { id: 3, name: "Quần short nam", category: "male", image: "https://stc-zmp.zadn.vn/zaui-fashion/category/quan-short.webp", price: 99000 },
  { id: 4, name: "Áo phông nam", category: "male", image: "https://stc-zmp.zadn.vn/zaui-fashion/category/ao-phong.webp", price: 129000 },
  { id: 5, name: "Bé trai - áo thun", category: "children", image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=400&fit=crop&crop=center", price: 79000 },
  { id: 6, name: "Bé gái - váy", category: "children", image: "https://images.unsplash.com/photo-1518882174711-1de40238921f?w=400&h=400&fit=crop&crop=center", price: 99000 },
  { id: 7, name: "Đồ ngủ nữ", category: "sleep-sport", image: "https://images.unsplash.com/photo-1571513722275-4b8c78bc8de6?w=400&h=400&fit=crop&crop=center", price: 159000 },
  { id: 8, name: "Đồ thể thao nam", category: "sleep-sport", image: "https://images.unsplash.com/photo-1506629905607-21e6d4b2df5e?w=400&h=400&fit=crop&crop=center", price: 199000 }
];

const categoryMap: Record<string, string> = {
  female: "Sản phẩm Nữ",
  male: "Sản phẩm Nam",
  children: "Sản phẩm Trẻ em",
  "sleep-sport": "Đồ ngủ & Thể thao"
};

export default function CategoryProductsPage() {
  const { category } = useParams();
  const products = mockProducts.filter((p) => p.category === category);
  const title = categoryMap[category ?? ""] || "Sản phẩm";

  return (
    <Section title={title}>
      <ProductGrid products={products} />
    </Section>
  );
}
