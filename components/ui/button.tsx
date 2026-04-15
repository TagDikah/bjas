import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[0.95rem] text-sm font-semibold tracking-[0.01em] transition-all disabled:pointer-events-none disabled:opacity-50 [&_a]:no-underline [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 [&_svg]:text-inherit [&_span]:text-inherit [&_p]:text-inherit outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shadow-[0_12px_28px_rgba(6,12,28,0.16)]",
  {
    variants: {
      variant: {
        default:
          'border-[color:#b5ff28] bg-[#b5ff28] text-[#111111] hover:bg-[#c5ff56]',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border-[color:rgba(255,255,255,0.09)] bg-[#1a1a1d] text-white shadow-none hover:border-[color:rgba(181,255,40,0.5)] hover:bg-[#222226]',
        secondary:
          'border-[color:rgba(255,255,255,0.09)] bg-[#232327] text-white hover:border-[color:rgba(181,255,40,0.3)] hover:bg-[#29292e]',
        ghost:
          'text-white/82 shadow-none hover:bg-white/8 hover:text-white dark:hover:bg-white/10',
        link: 'text-[#b5ff28] underline-offset-4 hover:text-[#d5ff6f] hover:underline shadow-none',
      },
      size: {
        default: 'h-10 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-9 rounded-[0.85rem] gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-11 rounded-[1rem] px-6 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
