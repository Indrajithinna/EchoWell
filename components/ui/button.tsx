import { ButtonHTMLAttributes, forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className = '',
    variant = 'default',
    size = 'default',
    isLoading = false,
    children,
    disabled,
    ...props
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      default: 'bg-calm-500 text-white hover:bg-calm-600 focus:ring-calm-500',
      outline: 'border-2 border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
      ghost: 'hover:bg-gray-100 focus:ring-gray-500',
      destructive: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
    }

    const sizes = {
      default: 'px-4 py-2 text-sm',
      sm: 'px-3 py-1.5 text-xs',
      lg: 'px-6 py-3 text-base',
      icon: 'p-2',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export { Button }
