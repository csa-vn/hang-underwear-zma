import Section from "@/components/section";
import TransitionLink from "@/components/transition-link";
import { useAtomValue } from "jotai";
import { categoriesState } from "@/state";

export default function FemaleCategories() {
  const categories = useAtomValue(categoriesState);

  // Filter for female categories based on available data
  const femaleCategories = categories.filter(
    (category) =>
      category.name.includes("Đầm") ||
      category.name.includes("Chân váy") ||
      category.name.includes("Blazer") ||
      category.name.includes("Túi xách")
  );

  return (
    <Section title="Danh mục Nữ" viewMoreTo="/categories/female">
      <div className="pt-2.5 pb-4 flex space-x-6 overflow-x-auto px-4">
        {femaleCategories.map((category) => (
          <TransitionLink
            key={category.id}
            className="flex flex-col items-center space-y-2 flex-none basis-[70px] overflow-hidden cursor-pointer"
            to={`/category/${category.id}`}
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
