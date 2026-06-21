import React from 'react';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  barClassName?: string;
}

export const Progress = ({ value = 0, className = '', barClassName = '', ...props }: ProgressProps) => {
  const percentage = Math.min(100, Math.max(0, value));
  return (
    <div className={`relative h-5 w-full overflow-hidden rounded-xl bg-white border-3 border-black shadow-[2px_2px_0px_0px_#000000] ${className}`} {...props}>
      <div
        className={`h-full w-full flex-1 bg-[#00CC66] border-r-3 border-black transition-all duration-500 ease-out ${barClassName}`}
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </div>
  );
};
export default Progress;
