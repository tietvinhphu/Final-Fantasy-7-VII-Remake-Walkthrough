import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva("label inline-flex items-center gap-1.5 rounded-sm border px-2 py-1", {
  variants: {
    tone: {
      neutral: "border-line bg-panel text-muted",
      hazard: "border-hazard/50 bg-hazard-bg text-hazard",
      mako: "border-mako/50 bg-mako-bg text-mako",
      boss: "border-boss/50 bg-boss-bg text-boss",
      quest: "border-quest/50 bg-quest-bg text-quest",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
