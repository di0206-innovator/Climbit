import React from 'react';
import Link from 'next/link';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
}

export const Button = React.forwardRef<HTMLElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', href, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090d16]';

    const variants = {
      primary: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/10 glow-btn',
      secondary: 'bg-[#151f32] hover:bg-[#1f2d47] text-emerald-400 border border-emerald-500/15',
      outline: 'bg-transparent border border-slate-700 hover:bg-[#101726] text-slate-200 hover:border-slate-500',
      ghost: 'bg-transparent hover:bg-emerald-950/20 text-slate-400 hover:text-emerald-400',
      danger: 'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/10',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-7 py-3 text-base',
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
