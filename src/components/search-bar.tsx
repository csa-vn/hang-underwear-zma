import { SearchIcon } from "@/components/vectors";
import { forwardRef, HTMLAttributes, HTMLProps } from "react";

const SearchBar = forwardRef<HTMLInputElement, HTMLProps<HTMLInputElement>>(
  (props, ref) => {
    return (
      <div className="px-2">
        <div className="relative w-full">
          <input
            ref={ref}
            className="w-full h-16 pl-16 pr-4 bg-gray-50 text-xl rounded-2xl outline-none placeholder:text-gray-500 border-2 border-gray-200 focus:border-primary focus:bg-white transition-all"
            placeholder="🔍 Tìm kiếm sản phẩm..."
            style={{ fontSize: "18px" }}
            {...props}
          />
          <SearchIcon className="absolute top-5 left-5 w-6 h-6 text-gray-400" />
        </div>
      </div>
    );
  }
);

export default SearchBar;
