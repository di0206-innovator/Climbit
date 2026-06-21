import React from 'react';

export const Card = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`glass-card rounded-2xl p-6 ${className}`} {...props} />
);

export const CardHeader = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`flex flex-col space-y-1.5 mb-4 ${className}`} {...props} />
);

export const CardTitle = ({ className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`text-xl font-bold tracking-tight text-white ${className}`} {...props} />
);

export const CardDescription = ({ className = '', ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={`text-sm text-slate-400 ${className}`} {...props} />
);

export const CardContent = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`${className}`} {...props} />
);

export const CardFooter = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`flex items-center mt-6 pt-4 border-t border-slate-800 ${className}`} {...props} />
);
