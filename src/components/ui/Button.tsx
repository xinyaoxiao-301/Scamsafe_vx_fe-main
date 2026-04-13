import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary'
    fullWidth?: boolean
  }
>

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { children, className, variant = 'primary', fullWidth = false, type = 'button', ...props },
  ref,
) {
  const classes = ['button', `button--${variant}`, fullWidth ? 'button--full' : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <button ref={ref} className={classes} type={type} {...props}>
      {children}
    </button>
  )
})
