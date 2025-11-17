import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const avatarVariants = cva(
  'relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full overflow-hidden',
  {
    variants: {
      size: {
        small: 'h-8 w-8 text-xs',
        medium: 'h-10 w-10 text-sm',
        large: 'h-12 w-12 text-base',
      },
    },
    defaultVariants: {
      size: 'medium',
    },
  }
);

interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof avatarVariants> {
  src?: string;
  name: string;
}

const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ className, src, name, size, ...props }, ref) => {
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('');

    const a11yLabel = `Avatar de ${name}`;

    return (
      <span
        ref={ref}
        className={cn(avatarVariants({ size }), 'bg-gray-200 text-gray-700 font-semibold', className)}
        aria-label={a11yLabel}
        {...props}
      >
        {src ? (
          <img src={src} alt={name} className="h-full w-full object-cover" />
        ) : (
          initials
        )}
      </span>
    );
  }
);
Avatar.displayName = 'Avatar';

export { Avatar };
