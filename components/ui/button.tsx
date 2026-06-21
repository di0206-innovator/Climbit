import React from 'react';
import Link from 'next/link';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
}

export const Button = React.forwardRef<HTMLElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', href, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-100 disabled:opacity-50 disabled:pointer-events-none outline-none focus-visible:ring-3 focus-visible:ring-black border-3 border-black text-slate-950 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none';

    const variants = {
      primary: 'bg-[#00CC66] hover:bg-[#00E572] shadow-[3px_3px_0px_0px_#000000]',
      secondary: 'bg-[#FFD53D] hover:bg-[#FFE066] shadow-[3px_3px_0px_0px_#000000]',
      outline: 'bg-white hover:bg-slate-50 shadow-[3px_3px_0px_0px_#000000]',
      ghost: 'bg-transparent hover:bg-black/5 border-transparent hover:border-black shadow-none active:translate-x-0 active:translate-y-0',
      danger: 'bg-[#FF5A60] hover:bg-[#FF757A] text-white shadow-[3px_3px_0px_0px_#000000]',
    };

    const sizes = {
      sm: 'px-4 py-2 text-xs',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-7 py-3.5 text-base',
    };

    const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    if (href) {
      // Omit button-only attributes to prevent warnings on anchor elements
      const linkProps = { ...props } as Record<string, unknown>;
      delete linkProps.type;
      return (
        <Link
          href={href}
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={classes}
          {...(linkProps as unknown as Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>)}
        />
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={classes}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
export default Button;
