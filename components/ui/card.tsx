import React from 'react';

export const Card = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`neo-card p-6 ${className}`} {...props} />
);

export const CardHeader = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`flex flex-col space-y-1.5 mb-5 ${className}`} {...props} />
);

export const CardTitle = ({ className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`text-xl font-black tracking-tight text-slate-950 ${className}`} {...props} />
);

export const CardDescription = ({ className = '', ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={`text-xs text-slate-600 font-semibold ${className}`} {...props} />
);

export const CardContent = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`${className}`} {...props} />
);

export const CardFooter = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`flex items-center mt-6 pt-4 border-t-3 border-black ${className}`} {...props} />
);
