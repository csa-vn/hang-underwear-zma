import { ReactNode } from "react";

export interface TabsProps<T> {
  items: T[];
  value: T;
  onChange: (item: T) => void;
  renderLabel: (item: T) => ReactNode;
}

export default function Tabs<T>(props: TabsProps<T>) {
  return (
    <div className="border-b-[0.5px] border-black/10 overflow-x-auto scrollbar-hide">
      <div className="flex h-11 min-w-max">
        {props.items.map((item, i) => (
          <div
            key={i}
            className="h-full flex flex-col px-4 cursor-pointer flex-shrink-0 min-w-max"
            onClick={() => props.onChange(item)}
          >
            <div className="flex-1 flex items-center justify-center">
              <span
                className={"font-medium whitespace-nowrap ".concat(
                  item === props.value ? "" : "text-inactive"
                )}
              >
                {props.renderLabel(item)}
              </span>
            </div>
            {props.value === item && (
              <div className="bg-tabIndicator h-[1.5px] rounded-t-sm -mt-px" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
