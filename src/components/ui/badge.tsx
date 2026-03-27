import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border border-transparent px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest transition-all",
  {
    variants: {
      variant: {
        default: "bg-primary/20 text-primary border-primary/20 glow-primary",
        secondary:
          "bg-secondary/20 text-secondary border-secondary/20 glow-secondary",
        destructive:
          "bg-destructive/20 text-destructive border-destructive/20",
        outline:
          "border-white/10 text-muted-foreground bg-white/5 backdrop-blur-md",
        ghost:
          "hover:bg-white/5 text-muted-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        accent: "bg-accent/20 text-accent border-accent/20 glow-accent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
