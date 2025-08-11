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
