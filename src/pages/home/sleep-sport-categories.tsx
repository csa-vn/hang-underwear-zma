import Section from "@/components/section";
import TransitionLink from "@/components/transition-link";

export default function SleepSportCategories() {
  // Custom sleep and sport categories for underwear store
  const sleepSportCategories = [
    {
      id: 101,
      name: "Đồ ngủ",
      image:
        "https://images.unsplash.com/photo-1571513722275-4b8c78bc8de6?w=400&h=400&fit=crop&crop=center",
    },
    {
      id: 102,
      name: "Đồ lót",
      image:
        "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop&crop=center",
    },
    {
      id: 103,
      name: "Thể thao",
      image:
        "https://images.unsplash.com/photo-1506629905607-21e6d4b2df5e?w=400&h=400&fit=crop&crop=center",
    },
    {
      id: 104,
      name: "Đồ bơi",
      image:
        "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop&crop=center",
    },
  ];

  return (
    <Section title="Đồ ngủ & Thể thao" viewMoreTo="/categories/sleep-sport">
      <div className="pt-2.5 pb-4 flex space-x-6 overflow-x-auto px-4">
        {sleepSportCategories.map((category) => (
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
