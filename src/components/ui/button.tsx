import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Butang Nadi §7.1 — radius 12px (bukan pil), min-h 50px, font 15.5px/600.
// Varian utama: primary (maroon) · ghost (atas terang) · ghost-dark (atas obsidian).
// Varian LAMA (gold/outline/dark/white) dikekalkan sebagai ALIAS semasa peralihan
// supaya pemanggil sedia ada tidak pecah — dibuang di M8.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold transition-all active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white hover:bg-primary-dark",
        // Alias → maroon (CTA utama Nadi = maroon, bukan emas)
        gold: "bg-primary text-white hover:bg-primary-dark",
        ghost: "border border-[#C9CCD2] bg-transparent text-ink hover:border-ink",
        // Alias → ghost
        outline: "border border-[#C9CCD2] bg-transparent text-ink hover:border-ink",
        "ghost-dark":
          "border border-[#3A4250] bg-transparent text-[#F7F3EB] hover:border-accent hover:text-accent",
        // Alias → ghost-dark
        dark: "border border-[#3A4250] bg-transparent text-[#F7F3EB] hover:border-accent hover:text-accent",
        white: "border border-[#3A4250] bg-transparent text-[#F7F3EB] hover:border-accent hover:text-accent",
      },
      size: {
        sm: "h-10 px-4 text-sm",
        md: "min-h-[50px] px-6 text-[15.5px]",
        lg: "min-h-[54px] px-8 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
