import Layout from "@/components/layout/layout";
import CartPage from "@/pages/cart";
import ProductListPage from "@/pages/catalog/product-list";
import CategoryListPage from "@/pages/catalog/category-list";
import ProductDetailPage from "@/pages/catalog/product-detail";
import HomePage from "@/pages/home";
import ProfilePage from "@/pages/profile";
import SearchPage from "@/pages/search";
import { createBrowserRouter } from "react-router-dom";
import { getBasePath } from "@/utils/zma";
import CategoryProductsPage from "@/pages/category-products";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <HomePage />,
          handle: {
            logo: true,
          },
        },
        {
          path: "/categories",
          element: <CategoryListPage />,
          handle: {
            title: "Danh mục sản phẩm",
            back: false,
          },
        },
        {
          path: "/cart",
          element: <CartPage />,
          handle: {
            title: "Giỏ hàng",
          },
        },
        {
          path: "/profile",
          element: <ProfilePage />,
          handle: {
            logo: true,
          },
        },
        {
          path: "/flash-sales",
          element: <ProductListPage />,
          handle: {
            title: "Flash Sales",
          },
        },
        {
          path: "/category/:id",
          element: <ProductListPage />,
          handle: {
            title: ({ categories, params }) =>
              categories.find((c) => c.id === Number(params.id))?.name,
          },
        },
        {
          path: "/product/:id",
          element: <ProductDetailPage />,
          handle: {
            scrollRestoration: 0, // when user selects another product in related products, scroll to the top of the page
          },
        },
        {
          path: "/search",
          element: <SearchPage />,
          handle: {
            title: "Tìm kiếm",
          },
        },
        {
          path: "/category-products/:category",
          element: <CategoryProductsPage />,
          handle: {
            title: ({ params }) => {
              const map = {
                female: "Sản phẩm Nữ",
                male: "Sản phẩm Nam",
                children: "Sản phẩm Trẻ em",
                "sleep-sport": "Đồ ngủ & Thể thao",
                "best-seller": "Best Seller",
              };
              // If it's a predefined category, use the map, otherwise decode and use as-is
              return (
                map[params.category] ||
                decodeURIComponent(params.category) ||
                "Sản phẩm"
              );
            },
          },
        },
      ],
    },
  ],
  { basename: getBasePath() }
);

export default router;
