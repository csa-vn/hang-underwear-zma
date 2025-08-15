import { Select } from "@/components/lazyloaded";
import { SelectSkeleton } from "@/components/skeleton";
import { useAtom, useAtomValue } from "jotai";
import { Suspense } from "react";
import { selectedSizeState, sizesState } from "@/state";

export default function ProductFilter() {
  const sizes = useAtomValue(sizesState);
  const [size, setSize] = useAtom(selectedSizeState);

  return (
    <div className="flex px-4 py-3 space-x-2 overflow-x-auto">
      <Suspense fallback={<SelectSkeleton width={110} />}>
        <Select
          items={sizes}
          value={size}
          onChange={setSize}
          renderTitle={(selectedSize?: string) =>
            `Kích thước${selectedSize ? `: ${selectedSize}` : ""}`
          }
          renderItemKey={(size: string) => String(size)}
        />
      </Suspense>

      {size !== undefined && (
        <button
          className="bg-primary text-white rounded-full h-8 flex-none px-3"
          onClick={() => {
            setSize(undefined);
          }}
        >
          Xoá bộ lọc
        </button>
      )}
    </div>
  );
}
