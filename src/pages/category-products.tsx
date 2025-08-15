import { useParams } from "react-router-dom";
import ProductGrid from "@/components/product-grid";
import Section from "@/components/section";
import { useEffect, useState } from "react";
import { fetchSheetData } from "@/services/sheet.service";

const categoryMap: Record<string, string> = {
  female: "Sản phẩm Nữ",
  male: "Sản phẩm Nam",
  children: "Sản phẩm Trẻ em",
  "sleep-sport": "Đồ ngủ & Thể thao",
  "best-seller": "Best Seller",
};

export default function CategoryProductsPage() {
  const { category } = useParams();
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchSheetData()
      .then((rows) => {
        if (!rows || rows.length < 2) {
          setError("No data or not enough rows returned from sheet.");
          return;
        }
        const header = rows[0];
        const dataRows = rows.slice(1);
        // Map each row to a product object
        const mapped = dataRows.map((row, idx) => {
          // Use a safe base64 placeholder image to prevent infinite loading loops
          const defaultImage =
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik03NSA0MEM4My4yODQzIDQwIDkwIDQ2LjcxNTcgOTAgNTVWOTVDOTAgMTAzLjI4NCA4My4yODQzIDExMCA3NSAxMTBDNjYuNzE1NyAxMTAgNjAgMTAzLjI4NCA2MCA5NVY1NUM2MCA0Ni43MTU3IDY2LjcxNTcgNDAgNzUgNDBaIiBmaWxsPSIjOUI5QjlCIi8+CjxwYXRoIGQ9Ik02MCA3NUg5MCIgc3Ryb2tlPSIjOUI5QjlCIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+";
          // Map to new CSV layout: image at index 8
          let image = row[8] || defaultImage;

          if (image && image.includes("drive.google.com")) {
            const fileIdMatch =
              image.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
              image.match(/\/d\/([a-zA-Z0-9_-]+)/);
            if (fileIdMatch) {
              image = `https://lh3.googleusercontent.com/d/${fileIdMatch[1]}`;
            }
          }

          return {
            id: idx + 1,
            name: row[0],
            image,
            price: Number(row[3]) || 0,
            category: {
              id: idx + 1,
              name: row[5] || "",
              image: defaultImage,
            },
            gender: row[7] || "",
          };
        });
        setProducts(mapped);
      })
      .catch((err) => {
        setError("Error fetching sheet: " + err.message);
      });
  }, []);

  let filteredProducts = products;
  if (category === "female") {
    filteredProducts = products.filter((p) => p.gender === "Nữ");
  }
  if (category === "children") {
    filteredProducts = products.filter((p) => p.gender === "Trẻ em");
  }

  const title = categoryMap[category ?? ""] || "Sản phẩm";

  if (error) {
    return (
      <Section title={title}>
        <div style={{ color: "red" }}>{error}</div>
      </Section>
    );
  }

  return (
    <Section title={title}>
      <ProductGrid products={filteredProducts} />
    </Section>
  );
}
