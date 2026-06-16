import DoctorPanel from './DoctorPanel'
import { Stethoscope } from 'lucide-react'

export default function StaffLayout() {
  return (
    <div className="flex-1 bg-white flex flex-col h-full w-full">
      <div className="p-3 border-b border-slate-200 flex items-center gap-2 shrink-0">
        <Stethoscope size={16} strokeWidth={1.5} className="text-teal-600" />
        <span className="font-semibold text-slate-800 text-sm">DOCTOR WORKSPACE</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        <DoctorPanel />
      </div>
    </div>
  )
}
