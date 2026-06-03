import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-blanco-primary text-white",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        success: "border-transparent bg-blanco-success text-white",
        warning: "border-transparent bg-blanco-warning text-white",
        destructive: "border-transparent bg-blanco-danger text-white",
        outline: "text-foreground",
        purple: "border-transparent bg-blanco-purple text-white",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
