import { useNavigate } from "react-router-dom";
import Banners from "./banners";
import SearchBar from "@/components/ui/search-bar";
import FemaleCategories from "./female-categories";
import MaleCategories from "./male-categories";
import ChildrenCategories from "./children-categories";
import SleepSportCategories from "./sleep-sport-categories";
import BestSeller from "./best-seller";
import HorizontalDivider from "@/components/layout/horizontal-divider";

const HomePage: React.FunctionComponent = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-full bg-white">
      {/* Header with larger, clearer search */}
      <div className="bg-white pt-4 pb-4 px-4">
        <SearchBar onClick={() => navigate("/search")} />
        <Banners />
      </div>

      {/* Best Seller section */}
      <div className="px-4 py-4">
        <BestSeller />
      </div>

      {/* Visual separator */}
      <div className="h-4 bg-gray-100 my-6"></div>

      {/* Female Categories section */}
      <div className="px-4 py-4">
        <FemaleCategories />
      </div>

      {/* Visual separator */}
      <div className="h-4 bg-gray-100 my-6"></div>

      {/* Children Categories section */}
      <div className="px-4 py-4">
        <ChildrenCategories />
      </div>

      {/* Visual separator */}
      <div className="h-4 bg-gray-100 my-6"></div>

      {/* Male Categories section */}
      <div className="px-4 py-4">
        <MaleCategories />
      </div>

      {/* Visual separator */}
      <div className="h-4 bg-gray-100 my-6"></div>

      {/* Sleep & Sport Categories section */}
      <div className="px-4 py-4">
        <SleepSportCategories />
      </div>
    </div>
  );
};

export default HomePage;
