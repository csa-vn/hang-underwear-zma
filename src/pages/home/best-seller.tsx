import ProductGrid from "@/components/product-grid";
import Section from "@/components/section";
import { useEffect, useState } from "react";
import { fetchSheetData } from "@/services/sheet.service";

export default function BestSeller() {
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const [rawRows, setRawRows] = useState<any[]>([]);

  useEffect(() => {
    fetchSheetData()
      .then((rows) => {
        setRawRows(rows);
        console.log("Raw sheet data:", rows); // Debug log
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

          // Column 17 is "Ảnh Sản Phẩm" based on your header order
          let image = row[17] || defaultImage;

          // Convert Google Drive share links to direct links if needed
          if (image && image.includes("drive.google.com")) {
            const fileIdMatch =
              image.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
              image.match(/\/d\/([a-zA-Z0-9_-]+)/);
            if (fileIdMatch) {
              // Try Google Drive thumbnail format - more reliable for images
              image = `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w400-h400`;
              console.log(`Using Google Drive thumbnail format: ${image}`);
            }
          }

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
            gender: row[16] || "", // Gender column, fallback to empty string
          };
        });
        setProducts(mapped);
      })
      .catch((err) => {
        setError("Error fetching sheet: " + err.message);
      });
  }, []);

  if (error) {
    return (
      <Section title="Best Seller" viewMoreTo="/category-products/best-seller">
        <div style={{ color: "red" }}>{error}</div>
        <pre>{JSON.stringify(rawRows, null, 2)}</pre>
      </Section>
    );
  }

  if (!products.length) {
    return (
      <Section title="Best Seller" viewMoreTo="/category-products/best-seller">
        <div>Loading or no products found.</div>
        <pre>{JSON.stringify(rawRows, null, 2)}</pre>
      </Section>
    );
  }

  // Limit to 4 products
  const bestSellerProducts = products.slice(0, 4);

  return (
    <Section title="Best Seller" viewMoreTo="/category-products/best-seller">
      <ProductGrid products={bestSellerProducts} />
    </Section>
  );
}
