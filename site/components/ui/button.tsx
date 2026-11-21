import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** Nút theo kiểu shadcn/ui (chép vào dự án, không phụ thuộc Radix). Dùng được cho cả <button> và <a>. */
export const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-md border px-4 font-sans text-sm font-bold no-underline transition-colors disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-hazard-fill bg-hazard-fill text-on-hazard hover:brightness-110 active:brightness-95",
        outline: "border-line bg-panel text-fg hover:border-hazard hover:text-hazard",
        ghost: "border-transparent bg-transparent text-fg hover:bg-panel-2",
      },
      size: {
        default: "",
        sm: "min-h-9 px-3 text-[0.8125rem]",
        icon: "size-11 px-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
