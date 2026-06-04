import React from 'react';
import { UserCog, Stethoscope } from 'lucide-react';

const iconContainerClass = "bg-white text-teal-600 p-3.5 border border-slate-200 rounded-2xl flex items-center justify-center w-max shadow-sm";

export function StaffIcon({ className = '', size = 28, ...props }) {
  return (
    <div className={`${iconContainerClass} ${className}`} {...props}>
      <UserCog size={size} strokeWidth={1.5} />
    </div>
  );
}

export function DoctorIcon({ className = '', size = 28, ...props }) {
  return (
    <div className={`${iconContainerClass} ${className}`} {...props}>
      <Stethoscope size={size} strokeWidth={1.5} />
    </div>
  );
}
