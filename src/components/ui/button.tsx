'use client'

import * as React from 'react'
import { clsx } from 'clsx'

import styles from './button.module.css'

type ButtonVariant =
  | 'default'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive'
  | 'link'

type ButtonSize = 'default' | 'sm' | 'lg' | 'icon'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const VARIANT_CLASSNAMES: Record<ButtonVariant, string> = {
  default: styles.variantDefault,
  secondary: styles.variantSecondary,
  outline: styles.variantOutline,
  ghost: styles.variantGhost,
  destructive: styles.variantDestructive,
  link: styles.variantLink,
}

const SIZE_CLASSNAMES: Record<ButtonSize, string> = {
  default: styles.sizeDefault,
  sm: styles.sizeSm,
  lg: styles.sizeLg,
  icon: styles.sizeIcon,
}

type ButtonVariantOptions = {
  variant?: ButtonVariant
  size?: ButtonSize
}

export const buttonVariants = ({
  variant = 'default',
  size = 'default',
}: ButtonVariantOptions = {}) =>
  clsx(styles.buttonBase, VARIANT_CLASSNAMES[variant], SIZE_CLASSNAMES[size])

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        data-variant={variant}
        data-size={size}
        className={clsx(buttonVariants({ variant, size }), className)}
        {...props}
      />
    )
  },
)

Button.displayName = 'Button'

export { Button }
