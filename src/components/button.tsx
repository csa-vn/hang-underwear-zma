import { ButtonHTMLAttributes, PropsWithChildren } from "react";

export interface ButtonProps
  extends PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> {
  primary?: boolean;
  small?: boolean;
  large?: boolean;
  accessible?: boolean;
}

export default function Button({
  className,
  primary,
  small,
  large,
  accessible = true,
  ...props
}: ButtonProps) {
  const baseClasses = accessible
    ? "accessible-button transition-all duration-200 focus:ring-4 focus:ring-blue-200 active:scale-95"
    : "text-base font-medium rounded-lg";

  const sizeClasses = large
    ? "px-8 py-4 text-xl"
    : small
    ? "px-4 py-3 text-lg"
    : "px-6 py-3.5 text-lg";

  const colorClasses = primary
    ? "bg-blue-600 text-white hover:bg-blue-700 border-2 border-blue-600"
    : "bg-white text-gray-800 hover:bg-gray-50 border-2 border-gray-300";

  return (
    <button
      className={`${baseClasses} ${colorClasses} ${sizeClasses} disabled:opacity-50 disabled:cursor-not-allowed font-semibold ${
        className ?? ""
      }`}
      {...props}
    />
  );
}
