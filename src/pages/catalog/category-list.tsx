import CategoryTabs from "@/components/product/category-tabs";
import SearchBar from "@/components/ui/search-bar";
import ProductGrid from "@/components/product/product-grid";
import { useAtomValue } from "jotai";
import { useNavigate } from "react-router-dom";
import { filteredProductsState } from "@/state";

export default function CategoryListPage() {
  const navigate = useNavigate();
  const filteredProducts = useAtomValue(filteredProductsState);

  return (
    <>
      <div className="py-2">
        <SearchBar onClick={() => navigate("/search")} />
      </div>
      <CategoryTabs />

      {/* Luôn hiển thị sản phẩm được lọc theo tab, bỏ đi các ô tròn danh mục */}
      <ProductGrid products={filteredProducts} className="pt-4 pb-[13px]" />
    </>
  );
}
