import { useParams } from "react-router-dom";
import ProductGrid from "@/components/product-grid";
import Section from "@/components/section";

// Mock product data
const mockProducts = [
  {
    id: 1,
    name: "Áo len nữ",
    category: {
      id: 1,
      name: "Áo len",
      image: "https://stc-zmp.zadn.vn/zaui-fashion/category/ao-len.webp",
    },
    image: "https://stc-zmp.zadn.vn/zaui-fashion/category/ao-len.webp",
    price: 189000,
  },
  {
    id: 2,
    name: "Đầm dạ hội",
    category: {
      id: 3,
      name: "Đầm",
      image: "https://stc-zmp.zadn.vn/zaui-fashion/category/dam.webp",
    },
    image: "https://stc-zmp.zadn.vn/zaui-fashion/category/dam.webp",
    price: 259000,
  },
  {
    id: 3,
    name: "Quần short nam",
    category: {
      id: 7,
      name: "Quần short",
      image: "https://stc-zmp.zadn.vn/zaui-fashion/category/quan-short.webp",
    },
    image: "https://stc-zmp.zadn.vn/zaui-fashion/category/quan-short.webp",
    price: 99000,
  },
  {
    id: 4,
    name: "Áo phông nam",
    category: {
      id: 4,
      name: "Áo phông",
      image: "https://stc-zmp.zadn.vn/zaui-fashion/category/ao-phong.webp",
    },
    image: "https://stc-zmp.zadn.vn/zaui-fashion/category/ao-phong.webp",
    price: 129000,
  },
  {
    id: 5,
    name: "Bé trai - áo thun",
    category: {
      id: 201,
      name: "Bé trai",
      image:
        "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=400&fit=crop&crop=center",
    },
    image:
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=400&fit=crop&crop=center",
    price: 79000,
  },
  {
    id: 6,
    name: "Bé gái - váy",
    category: {
      id: 202,
      name: "Bé gái",
      image:
        "https://images.unsplash.com/photo-1518882174711-1de40238921f?w=400&h=400&fit=crop&crop=center",
    },
    image:
      "https://images.unsplash.com/photo-1518882174711-1de40238921f?w=400&h=400&fit=crop&crop=center",
    price: 99000,
  },
  {
    id: 7,
    name: "Đồ ngủ nữ",
    category: {
      id: 101,
      name: "Đồ ngủ",
      image:
        "https://images.unsplash.com/photo-1571513722275-4b8c78bc8de6?w=400&h=400&fit=crop&crop=center",
    },
    image:
      "https://images.unsplash.com/photo-1571513722275-4b8c78bc8de6?w=400&h=400&fit=crop&crop=center",
    price: 159000,
  },
  {
    id: 8,
    name: "Đồ thể thao nam",
    category: {
      id: 103,
      name: "Thể thao",
      image:
        "https://images.unsplash.com/photo-1506629905607-21e6d4b2df5e?w=400&h=400&fit=crop&crop=center",
    },
    image:
      "https://images.unsplash.com/photo-1506629905607-21e6d4b2df5e?w=400&h=400&fit=crop&crop=center",
    price: 199000,
  },
  {
    id: 9,
    name: "Best Seller 1",
    category: {
      id: 1001,
      name: "Best Seller",
      image: "https://stc-zmp.zadn.vn/zaui-fashion/category/ao-len.webp",
    },
    image: "https://stc-zmp.zadn.vn/zaui-fashion/category/ao-len.webp",
    price: 199000,
  },
  {
    id: 10,
    name: "Best Seller 2",
    category: {
      id: 1002,
      name: "Best Seller",
      image: "https://stc-zmp.zadn.vn/zaui-fashion/category/dam.webp",
    },
    image: "https://stc-zmp.zadn.vn/zaui-fashion/category/dam.webp",
    price: 249000,
  },
  {
    id: 1001,
    name: "Áo len Best Seller",
    image: "https://stc-zmp.zadn.vn/zaui-fashion/category/ao-len.webp",
    price: 199000,
    category: {
      id: 1001,
      name: "Best Seller",
      image: "https://stc-zmp.zadn.vn/zaui-fashion/category/ao-len.webp",
    },
  },
  {
    id: 1002,
    name: "Đầm Best Seller",
    image: "https://stc-zmp.zadn.vn/zaui-fashion/category/dam.webp",
    price: 249000,
    category: {
      id: 1002,
      name: "Best Seller",
      image: "https://stc-zmp.zadn.vn/zaui-fashion/category/dam.webp",
    },
  },
  {
    id: 1003,
    name: "Quần short Best Seller",
    image: "https://stc-zmp.zadn.vn/zaui-fashion/category/quan-short.webp",
    price: 99000,
    category: {
      id: 1003,
      name: "Best Seller",
      image: "https://stc-zmp.zadn.vn/zaui-fashion/category/quan-short.webp",
    },
  },
  {
    id: 1004,
    name: "Áo phông Best Seller",
    image: "https://stc-zmp.zadn.vn/zaui-fashion/category/ao-phong.webp",
    price: 129000,
    category: {
      id: 1004,
      name: "Best Seller",
      image: "https://stc-zmp.zadn.vn/zaui-fashion/category/ao-phong.webp",
    },
  },
];

const categoryMap: Record<string, string> = {
  female: "Sản phẩm Nữ",
  male: "Sản phẩm Nam",
  children: "Sản phẩm Trẻ em",
  "sleep-sport": "Đồ ngủ & Thể thao",
  "best-seller": "Best Seller",
};

export default function CategoryProductsPage() {
  const { category } = useParams();
  // Map route param to possible category names
  const categoryNameMap: Record<string, string[]> = {
    female: ["Áo len", "Đầm"],
    male: ["Áo phông", "Quần short"],
    children: ["Bé trai", "Bé gái"],
    "sleep-sport": ["Đồ ngủ", "Thể thao"],
    "best-seller": ["Best Seller"],
  };
  const products = mockProducts.filter((p) => {
    if (!category) return false;
    // For best-seller, match exactly
    if (category === "best-seller") {
      return p.category.name === "Best Seller";
    }
    // For other categories, match by route param to category name
    // Map route param to category name
    const routeToCategoryName: Record<string, string[]> = {
      female: ["Áo len", "Đầm"],
      male: ["Áo phông", "Quần short"],
      children: ["Bé trai", "Bé gái"],
      "sleep-sport": ["Đồ ngủ", "Thể thao"],
    };
    const names = routeToCategoryName[category];
    return names ? names.includes(p.category.name) : false;
  });
  const title = categoryMap[category ?? ""] || "Sản phẩm";

  console.log("DEBUG: category param from useParams()", category);
  console.log("DEBUG: filtered products", products);

  return (
    <Section title={title}>
      <ProductGrid products={products} />
    </Section>
  );
}
