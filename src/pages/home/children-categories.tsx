import Section from "@/components/section";
import TransitionLink from "@/components/transition-link";

export default function ChildrenCategories() {
  // Custom children categories for underwear store
  const childrenCategories = [
    {
      id: 201,
      name: "Bé trai",
      image:
        "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=400&fit=crop&crop=center",
    },
    {
      id: 202,
      name: "Bé gái",
      image:
        "https://images.unsplash.com/photo-1518882174711-1de40238921f?w=400&h=400&fit=crop&crop=center",
    },
    {
      id: 203,
      name: "Đồ ngủ trẻ em",
      image:
        "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop&crop=center",
    },
    {
      id: 204,
      name: "Phụ kiện trẻ em",
      image:
        "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=400&fit=crop&crop=center",
    },
  ];

  return (
    <Section title="Danh mục Trẻ em" viewMoreTo="/categories/children">
      <div className="pt-2.5 pb-4 flex space-x-6 overflow-x-auto px-4">
        {childrenCategories.map((category) => (
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
