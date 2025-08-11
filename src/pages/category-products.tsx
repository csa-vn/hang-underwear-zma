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
          const defaultImage = "https://via.placeholder.com/150";
          const image = row[5] || row[9] || defaultImage;
          return {
            id: idx + 1,
            name: row[0],
            image,
            price: Number(row[3]) || 0,
            category: {
              id: idx + 1,
              name: row[8] || "",
              image: row[9] || defaultImage,
            },
            gender: row[16] || "",
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
  // You can add more filters for other categories as needed

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
