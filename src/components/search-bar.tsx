import { SearchIcon } from "@/components/vectors";
import { useAtomValue } from "jotai";
import { productsState } from "@/state";
import {
  forwardRef,
  HTMLAttributes,
  HTMLProps,
  useState,
  useEffect,
} from "react";
import { useNavigate } from "react-router-dom";

interface SearchBarProps extends HTMLProps<HTMLInputElement> {
  onProductSelect?: (productName: string) => void;
}

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ onProductSelect, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const products = useAtomValue(productsState);
    const navigate = useNavigate();

    // Tạo danh sách gợi ý từ tên sản phẩm
    useEffect(() => {
      const productNames = products.map((p) => p.name).slice(0, 8); // Lấy 8 sản phẩm đầu
      const categories = [
        ...new Set(products.flatMap((p) => p.categories || [])),
      ].slice(0, 5); // 5 category
      setSuggestions([...productNames, ...categories]);
    }, [products]);

    const handleSuggestionClick = (suggestion: string) => {
      if (props.onChange) {
        const event = { currentTarget: { value: suggestion } } as any;
        props.onChange(event);
      }
      onProductSelect?.(suggestion);
      setIsFocused(false);
    };

    const handleProductClick = (productId: number) => {
      navigate(`/product/${productId}`);
      setIsFocused(false);
    };

    // Lọc suggestions dựa trên input
    const filteredSuggestions = props.value
      ? suggestions.filter((s) =>
          s.toLowerCase().includes((props.value as string).toLowerCase())
        )
      : suggestions;

    // Lọc products để hiển thị thumbnail
    const suggestedProducts = products
      .filter(
        (p) =>
          !props.value ||
          p.name.toLowerCase().includes((props.value as string).toLowerCase())
      )
      .slice(0, 6);

    return (
      <div className="px-2 relative">
        <div className="relative w-full">
          <input
            ref={ref}
            className="w-full h-16 pl-16 pr-4 bg-gray-50 text-xl rounded-2xl outline-none placeholder:text-gray-500 border-2 border-gray-200 focus:border-primary focus:bg-white transition-all"
            placeholder="🔍 Tìm kiếm sản phẩm..."
            style={{ fontSize: "18px" }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)} // Delay để cho phép click suggestions
            {...props}
          />
          <SearchIcon className="absolute top-5 left-5 w-6 h-6 text-gray-400" />
        </div>

        {/* Dropdown gợi ý */}
        {isFocused && (
          <div className="absolute top-full left-2 right-2 mt-2 bg-white rounded-2xl shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
            {/* Gợi ý từ khóa */}
            {filteredSuggestions.length > 0 && (
              <div className="p-3">
                <div className="text-sm text-gray-500 mb-2 font-medium">
                  🔥 Từ khóa hot
                </div>
                <div className="flex flex-wrap gap-2">
                  {filteredSuggestions.slice(0, 8).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-primary hover:text-white rounded-full text-sm transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Gợi ý sản phẩm với hình ảnh */}
            {suggestedProducts.length > 0 && (
              <div className="border-t border-gray-100 p-3">
                <div className="text-sm text-gray-500 mb-3 font-medium">
                  🛍️ Sản phẩm gợi ý
                </div>
                <div className="space-y-2">
                  {suggestedProducts.slice(0, 4).map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleProductClick(product.id)}
                      className="flex items-center space-x-3 w-full p-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {product.price?.toLocaleString()}đ
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Không có kết quả */}
            {filteredSuggestions.length === 0 &&
              suggestedProducts.length === 0 &&
              props.value && (
                <div className="p-6 text-center text-gray-500">
                  <SearchIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <div className="text-sm">Không tìm thấy "{props.value}"</div>
                </div>
              )}
          </div>
        )}
      </div>
    );
  }
);

export default SearchBar;
