import Section from "@/components/layout/section";
import TransitionLink from "@/components/layout/transition-link";
import { useAtomValue } from "jotai";
import { productsState } from "@/state";

export default function Category() {
  // Lấy tất cả sản phẩm
  const products = useAtomValue(productsState);

  // Tạo danh sách category theo tag đầu tiên
  const categoryMap = new Map();
  products.forEach((product) => {
    const tags = (product.gender || "")
      .split(",")
      .map((t) => t.trim().toLowerCase());
    const firstTag = tags[0];
    if (firstTag && !categoryMap.has(firstTag)) {
      categoryMap.set(firstTag, {
        id: categoryMap.size + 1,
        name: firstTag.charAt(0).toUpperCase() + firstTag.slice(1),
        image: product.image,
      });
    }
  });
  const categories = Array.from(categoryMap.values());

  return (
    <Section title="Danh mục sản phẩm" viewMoreTo="/categories">
      <div className="pt-2.5 pb-4 flex space-x-6 overflow-x-auto px-4">
        {categories.map((category) => (
          <TransitionLink
            key={category.id}
            className="flex flex-col items-center space-y-2 flex-none basis-[70px] overflow-hidden cursor-pointer"
            to={`/category/${category.name}`}
          >
            <img
              src={category.image}
              className="w-[70px] h-[70px] object-cover rounded-full border-[0.5px] border-black/15"
              alt={category.name}
            />
            <div className="text-center text-sm w-full line-clamp-2 text-subtitle">
              {category.name}
            </div>
          </TransitionLink>
        ))}
      </div>
    </Section>
  );
}
