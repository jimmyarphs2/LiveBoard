import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-sm font-bold whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-95 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 uppercase tracking-wider",
  {
    variants: {
      variant: {
        default: "bg-primary text-white glow-primary hover:bg-primary/90 hover:shadow-primary/40 shadow-lg",
        outline:
          "border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 backdrop-blur-md",
        secondary:
          "bg-secondary text-white glow-secondary hover:bg-secondary/90 hover:shadow-secondary/40 shadow-lg",
        ghost:
          "text-muted-foreground hover:text-white hover:bg-white/5",
        destructive:
          "bg-destructive/20 text-destructive hover:bg-destructive/30 border border-destructive/20",
        link: "text-primary underline-offset-4 hover:underline",
        accent: "bg-accent text-accent-foreground glow-accent hover:bg-accent/90 shadow-lg font-black",
      },
      size: {
        default:
          "h-11 px-6 gap-2",
        xs: "h-7 px-3 text-[10px] gap-1",
        sm: "h-9 px-4 text-xs gap-1.5",
        lg: "h-14 px-8 text-base gap-2.5",
        icon: "size-11",
        "icon-xs": "size-7",
        "icon-sm": "size-9",
        "icon-lg": "size-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
