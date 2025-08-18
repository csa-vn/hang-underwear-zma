import { atom } from "jotai";
import { atomFamily, unwrap } from "jotai/utils";
import { Cart, Category, Color, Product, Detail } from "@/types";
import { requestWithFallback } from "@/utils/request";
import { getUserInfo } from "zmp-sdk";
import { fetchSheetData } from "@/services/sheet.service";

export const userState = atom(() =>
  getUserInfo({
    avatarType: "normal",
  }).then((result) => {
    // Fix cho development mode - thêm fallback name
    if (result?.userInfo && !result.userInfo.name) {
      result.userInfo.name = `User_${result.userInfo.id?.slice(-4) || "XXXX"}`;
    }
    return result;
  })
);

export const bannersState = atom(() =>
  requestWithFallback<string[]>("/banners", [])
);

export const tabsState = atom(["Tất cả"]);

// Function to shorten category names for tabs
const shortenCategoryName = (name: string): string => {
  const shortenMap: Record<string, string> = {
    "Áo len": "Áo len",
    Blazer: "Blazer",
    Đầm: "Đầm",
    "Áo phông": "Áo phông",
    "Áo gi lê": "Gi lê",
    "Chân váy": "Chân váy",
    "Quần short": "Short",
    "Quần bo": "Quần bo",
    "Túi xách": "Túi",
    "Phụ kiện": "P.kiện",
    "Quần dài": "Quần dài",
    "Áo sơ mi": "Sơ mi",
    "Quần jeans": "Jeans",
    "Áo khoác": "Khoác",
    "Váy ngắn": "Váy",
    "Quần âu": "Âu",
    "Đồ bộ": "Bộ",
    "Đồ ngủ": "Ngủ",
    "Thể thao": "T.thao",
  };

  return (
    shortenMap[name] || (name.length > 8 ? name.substring(0, 6) + ".." : name)
  );
};

// Dynamic tabs based on actual product categories
export const dynamicTabsState = atom(async (get) => {
  // Danh sách tab cố định theo yêu cầu
  const tabList = ["Quần", "Áo", "Học sinh", "Nữ", "Nam", "Đồ ngủ & Thể thao"];
  return ["Tất cả", ...tabList];
});

// Keep original category names for filtering
export const fullCategoryNamesState = atom(async (get) => {
  const products = await get(productsState);
  const categories = [...new Set(products.map((p) => p.category.name))].filter(
    Boolean
  );
  return ["Tất cả", ...categories.sort()];
});

export const selectedTabIndexState = atom(0);

// Real categories with images from actual products
export const realCategoriesState = atom(async (get) => {
  const products = await get(productsState);
  const categoryMap = new Map<
    string,
    { name: string; image: string; id: number }
  >();

  products.forEach((product) => {
    const categoryName = product.category.name;
    if (categoryName && !categoryMap.has(categoryName)) {
      categoryMap.set(categoryName, {
        name: categoryName,
        image: product.image, // Use product image as category image
        id: categoryMap.size + 1,
      });
    }
  });

  return Array.from(categoryMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
});

export const categoriesState = atom(() =>
  requestWithFallback<Category[]>("/categories", [])
);

export const categoriesStateUpwrapped = unwrap(
  categoriesState,
  (prev) => prev ?? []
);

export const productsState = atom(async () => {
  const rows = await fetchSheetData();
  if (!rows || rows.length < 2) return [];
  const header = rows[0];
  const dataRows = rows.slice(1);
  return dataRows.map((row, idx) => {
    // Use a safe base64 placeholder image to prevent infinite loading loops
    const defaultImage =
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik03NSA0MEM4My4yODQzIDQwIDkwIDQ2LjcxNTcgOTAgNTVWOTVDOTAgMTAzLjI4NCA4My4yODQzIDExMCA3NSAxMTBDNjYuNzE1NyAxMTAgNjAgMTAzLjI4NCA2MCA5NVY1NUM2MCA0Ni43MTU3IDY2LjcxNTcgNDAgNzUgNDBaIiBmaWxsPSIjOUI5QjlCIi8+CjxwYXRoIGQ9Ik02MCA3NUg5MCIgc3Ryb2tlPSIjOUI5QjlCIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+";

    // New CSV layout:
    // 0: Tên sản phẩm
    // 1: Mô tả sản phẩm
    // 2: Combo
    // 3: Giá
    // 4: Ưu đãi
    // 5: Phù hợp với
    // 6: Liên hệ
    // 7: Tag (contains gender in current data)
    // 8: Ảnh Sản Phẩm
    // 9: Ảnh Mô Tả
    // 10: Best Seller

    // Map image to new index 8
    let image = row[8] || defaultImage;

    // Convert Google Drive share links to direct links if needed
    if (image && image.includes("drive.google.com")) {
      const fileIdMatch =
        image.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
        image.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (fileIdMatch) {
        image = `https://lh3.googleusercontent.com/d/${fileIdMatch[1]}`;
      }
    }

    // Map details from the available columns
    let details: Detail[] = [];
    if (row[1]) {
      details.push({ title: "Mô tả", content: row[1] });
    }
    if (row[4]) {
      details.push({ title: "Ưu đãi", content: row[4] });
    }
    if (row[5]) {
      details.push({ title: "Phù hợp với", content: row[5] });
    }
    if (row[9]) {
      details.push({ title: "Ảnh mô tả", content: row[9] });
    }

    return {
      id: idx + 1,
      name: row[0] || "Sản phẩm không tên",
      price: Number(row[3]) || 0,
      originalPrice: undefined,
      image,
      category: {
        id: idx + 1,
        // No explicit category column in new CSV; use 'Phù hợp với' as fallback
        name: row[5] || "Danh mục chưa xác định",
        image: defaultImage,
      },
      details,
      sizes: ["M"],
      colors: [{ name: "Đỏ", hex: "#FFC7C7" }],
      gender: row[7] || "",
      linkShop: "",
      address: "",
    };
  });
});

// Filtered products based on selected category tab
export const filteredProductsState = atom(async (get) => {
  const products = await get(productsState);
  const tabs = await get(dynamicTabsState);
  const selectedIndex = get(selectedTabIndexState);

  if (selectedIndex === 0 || tabs[selectedIndex] === "Tất cả") {
    return products; // Show all products
  }

  const selectedTab = tabs[selectedIndex];

  // Lọc sản phẩm theo tag trong CSV (hỗ trợ multi-tag)
  return products.filter((product) => {
    const productTags = product.gender || ""; // Tag column is stored in gender field
    const tags = productTags.split(",").map((tag) => tag.trim().toLowerCase());

    // Handle special case for "Đồ ngủ & Thể thao"
    if (selectedTab === "Đồ ngủ & Thể thao") {
      return tags.includes("đồ thể thao");
    }

    // Convert tab name to lowercase for comparison
    return tags.includes(selectedTab.toLowerCase());
  });
});

export const flashSaleProductsState = atom((get) => get(productsState));

export const bestSellerProductsState = atom(async (get) => {
  const products = await get(productsState);
  return products.slice(0, 4);
});

export const recommendedProductsState = atom((get) => get(productsState));

export const sizesState = atom(["S", "M", "L", "XL"]);

export const selectedSizeState = atom<string | undefined>(undefined);

export const colorsState = atom<Color[]>([
  {
    name: "Đỏ",
    hex: "#FFC7C7",
  },
  {
    name: "Xanh dương",
    hex: "#DBEBFF",
  },
  {
    name: "Xanh lá",
    hex: "#D1F0DB",
  },
  {
    name: "Xám",
    hex: "#D9E2ED",
  },
]);

export const selectedColorState = atom<Color | undefined>(undefined);

export const productState = atomFamily((id: number) =>
  atom(async (get) => {
    const products = await get(productsState);
    return products.find((product) => product.id === id);
  })
);

export const cartState = atom<Cart>([]);

export const selectedCartItemIdsState = atom<number[]>([]);

export const checkoutItemsState = atom((get) => {
  const ids = get(selectedCartItemIdsState);
  const cart = get(cartState);
  return cart.filter((item) => ids.includes(item.id));
});

export const cartTotalState = atom((get) => {
  const items = get(checkoutItemsState);
  return {
    totalItems: items.length,
    totalAmount: items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    ),
  };
});

export const keywordState = atom("");

export const searchResultState = atom(async (get) => {
  const keyword = get(keywordState);
  const products = await get(productsState);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return products.filter((product) =>
    product.name.toLowerCase().includes(keyword.toLowerCase())
  );
});

// UI Mode states for elderly-friendly interface
export type UIMode = "simple" | "normal" | null;

export const uiModeState = atom<UIMode>(
  localStorage.getItem("ui-mode") as UIMode
);

export const setUIModeState = atom(null, (get, set, mode: UIMode) => {
  set(uiModeState, mode);
  if (mode) {
    localStorage.setItem("ui-mode", mode);
  } else {
    localStorage.removeItem("ui-mode");
  }
});
