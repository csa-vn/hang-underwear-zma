import { useNavigate } from "react-router-dom";
import Banners from "./banners";
import SearchBar from "../../components/search-bar";
import Category from "./category";
import FlashSales from "./flash-sales";
import HorizontalDivider from "@/components/horizontal-divider";
import CategoryTabs from "@/components/category-tabs";

const HomePage: React.FunctionComponent = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-full bg-white">
      {/* Header with larger, clearer search */}
      <div className="bg-white pt-4 pb-4 px-4">
        <SearchBar onClick={() => navigate("/search")} />
        <Banners />
      </div>

      {/* Main content with larger spacing */}
      <div className="bg-white space-y-6 px-4">
        <CategoryTabs />
        <Category />
      </div>

      {/* Visual separator */}
      <div className="h-4 bg-gray-100 my-6"></div>

      {/* Flash sales section */}
      <div className="px-4">
        <FlashSales />
      </div>
    </div>
  );
};

export default HomePage;
