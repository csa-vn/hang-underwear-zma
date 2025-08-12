import { atom } from "jotai";
import { atomFamily, unwrap } from "jotai/utils";
import { Cart, Category, Color, Product, Detail } from "@/types";
import { requestWithFallback } from "@/utils/request";
import { getUserInfo } from "zmp-sdk";
import { fetchSheetData } from "@/services/sheet.service";

export const userState = atom(() =>
  getUserInfo({
    avatarType: "normal",
  })
);

export const bannersState = atom(() =>
  requestWithFallback<string[]>("/banners", [])
);

export const tabsState = atom(["Tất cả", "Nam", "Nữ", "Trẻ em"]);

export const selectedTabIndexState = atom(0);

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
    const defaultImage = "https://via.placeholder.com/150";
    let image = row[5] || row[9] || defaultImage;
    if (row[0] === "Áo BOYA lưng lớn") {
      image =
        "https://drive.google.com/uc?export=view&id=1-h_J8tLJOUJWE2JWClwakyKU5niNS6wx";
    }
    // Map details if available
    let details: Detail[] = [];
    if (row[1]) {
      details.push({ title: "Mô tả", content: row[1] });
    }
    if (row[7]) {
      details.push({ title: "Đặc điểm", content: row[7] });
    }
    if (row[8]) {
      details.push({ title: "Size", content: row[8] });
    }
    if (row[10]) {
      details.push({ title: "Màu sắc", content: row[10] });
    }
    if (row[11]) {
      details.push({ title: "Cách giặt", content: row[11] });
    }
    return {
      id: idx + 1,
      name: row[0] || "Sản phẩm không tên",
      price: Number(row[3]) || 0,
      originalPrice: Number(row[4]) || undefined,
      image,
      category: {
        id: idx + 1,
        name: row[8] || "Danh mục chưa xác định",
        image: row[9] || defaultImage,
      },
      details,
      sizes: row[8] ? row[8].split(";") : ["M"],
      colors: row[10]
        ? row[10].split(";").map((name) => ({ name, hex: "#FFC7C7" }))
        : [{ name: "Đỏ", hex: "#FFC7C7" }],
      gender: row[16] || "",
    };
  });
});

export const flashSaleProductsState = atom((get) => get(productsState));

export const bestSellerProductsState = atom(async (get) => {
  const products = await get(productsState);
  // Return first 4 products as best sellers for demo
  // In real app, this would filter by a bestSeller flag or use a separate endpoint
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
