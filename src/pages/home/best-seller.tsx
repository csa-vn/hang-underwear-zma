import ProductGrid from "@/components/product-grid";
import Section from "@/components/section";

// Mock data for Best Seller products
const bestSellerProducts = [
  {
    id: 1001,
    name: "Áo len ",
    image: "https://stc-zmp.zadn.vn/zaui-fashion/category/ao-len.webp",
    price: 199000,
    category: {
      id: 1001,
      name: "",
      image: "https://stc-zmp.zadn.vn/zaui-fashion/category/ao-len.webp",
    },
  },
  {
    id: 1002,
    name: "Đầm ",
    image: "https://stc-zmp.zadn.vn/zaui-fashion/category/dam.webp",
    price: 249000,
    category: {
      id: 1002,
      name: "",
      image: "https://stc-zmp.zadn.vn/zaui-fashion/category/dam.webp",
    },
  },
  {
    id: 1003,
    name: "Quần short ",
    image: "https://stc-zmp.zadn.vn/zaui-fashion/category/quan-short.webp",
    price: 99000,
    category: {
      id: 1003,
      name: "",
      image: "https://stc-zmp.zadn.vn/zaui-fashion/category/quan-short.webp",
    },
  },
  {
    id: 1004,
    name: "Áo phông ",
    image: "https://stc-zmp.zadn.vn/zaui-fashion/category/ao-phong.webp",
    price: 129000,
    category: {
      id: 1004,
      name: "",
      image: "https://stc-zmp.zadn.vn/zaui-fashion/category/ao-phong.webp",
    },
  },
];

export default function BestSeller() {
  return (
    <Section title="Best Seller" viewMoreTo="/category-products/best-seller">
      <ProductGrid products={bestSellerProducts} />
    </Section>
  );
}
