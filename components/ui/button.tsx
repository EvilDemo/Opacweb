import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive uppercase cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-transparent hover:text-primary border border-primary",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        secondary:
          "paragraph-small-medium border border-white rounded-full py-1 px-2 stroke-white text-white hover:text-gray-300 hover:scale-105  whitespace-nowrap h-8 bg-transparent hover:bg-transparent shadow-xs",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline ",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-full gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-full px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  // If asChild is true, render without animation (for cases like SheetTrigger)
  if (asChild) {
    return (
      <Comp
        data-slot="button"
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </Comp>
    );
  }

  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size }),
        "relative overflow-hidden group [perspective:1000px]",
        className
      )}
      {...props}
    >
      <span
        className={`flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-300 ease-in-out group-hover:-translate-y-[150%] group-hover:opacity-0 group-hover:blur-sm`}
      >
        {children}
      </span>
      <span
        className={`absolute top-full left-0 w-full h-full flex items-center justify-center gap-2 transition-all duration-300 ease-in-out group-hover:-translate-y-full group-hover:opacity-100 opacity-0 blur-sm group-hover:blur-none ${
          variant === "secondary"
            ? "group-hover:bg-white group-hover:text-black group-hover:border-white group-hover:border"
            : variant === "default"
            ? "group-hover:bg-black group-hover:text-white group-hover:border-black group-hover:border"
            : ""
        }`}
      >
        {children}
      </span>
    </Comp>
  );
}

export { Button, buttonVariants };
