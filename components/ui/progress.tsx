import React from 'react';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  barClassName?: string;
}

export const Progress = ({ value = 0, className = '', barClassName = '', ...props }: ProgressProps) => {
  const percentage = Math.min(100, Math.max(0, value));
  return (
    <div className={`relative h-2 w-full overflow-hidden rounded-full bg-slate-800 ${className}`} {...props}>
      <div
        className={`h-full w-full flex-1 bg-emerald-500 transition-all duration-500 ease-out ${barClassName}`}
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </div>
  );
};
export default Progress;
