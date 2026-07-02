import { useState } from 'react'
import {
  Printer,
  X,
  CreditCard,
  ClipboardCheck,
  FileText,
  DollarSign,
  Loader2,
  Send
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function CheckoutSummaryModal({
  isOpen,
  onClose,
  onFinalize,
  patient,
  duration,
  treatments = [],
  prescriptions = []
}) {
  // Financial Estimator States
  const [consultationFee, setConsultationFee] = useState(500)
  // Auto-calculate procedure fee estimate (e.g. ₹750 per treatment, default 0 if none)
  const initialProcedureFee = treatments.length > 0 ? treatments.length * 750 : 0
  const [procedureFee, setProcedureFee] = useState(initialProcedureFee)
  const [isFinalizing, setIsFinalizing] = useState(false)

  if (!isOpen) return null

  // Calculate estimated total
  const estimatedTotal = Number(consultationFee || 0) + Number(procedureFee || 0)

  // Handle finalize submission
  const handleFinalize = async () => {
    setIsFinalizing(true)
    try {
      await onFinalize({
        consultationFee,
        procedureFee,
        estimatedTotal
      })
    } catch (err) {
      toast.error('Failed to finalize checkout.')
    } finally {
      setIsFinalizing(false)
    }
  }

  // Handle printing action simulation
  const handlePrintRx = () => {
    toast.success('🖨️ Sending Rx to printer...')
  }

  // Get current date string
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })

  // Format frequency to 1-0-1 shorthand
  const getFrequencyShorthand = (freq) => {
    return `${freq.morning ? '1' : '0'}-${freq.afternoon ? '1' : '0'}-${freq.night ? '1' : '0'}`
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full flex flex-col overflow-hidden max-h-[90vh] border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <ClipboardCheck size={18} strokeWidth={1.5} className="text-teal-600" />
            <span>Consultation Summary</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            disabled={isFinalizing}
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Patient Context Banner */}
        <div className="bg-slate-50 border-b border-slate-200/60 px-6 py-3 flex justify-between items-center text-xs">
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-slate-400 uppercase tracking-wide text-[9px]">Patient Name</span>
            <span className="font-bold text-slate-800">{patient?.name || 'Walk-in Patient'}</span>
          </div>
          <div className="flex flex-col items-end gap-0.5 md:items-start">
            <span className="font-semibold text-slate-400 uppercase tracking-wide text-[9px]">Date</span>
            <span className="font-bold text-slate-700">{currentDate}</span>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="font-semibold text-slate-400 uppercase tracking-wide text-[9px]">Duration</span>
            <span className="font-bold text-slate-700 font-mono">{duration}</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            
            {/* Left Column: Clinical Handoff */}
            <div className="flex flex-col gap-5">
              {/* Treatments summary */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Treatments Performed</span>
                {treatments.length === 0 ? (
                  <span className="text-xs text-slate-500 italic">No treatments recorded.</span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {treatments.map((treatment, idx) => (
                      <span
                        key={idx}
                        className="bg-teal-50/50 border border-teal-100 text-teal-800 text-[11px] font-semibold px-2 py-0.5 rounded-lg"
                      >
                        {treatment}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Prescription summary */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Prescription (Rx)</span>
                {prescriptions.length === 0 ? (
                  <span className="text-xs text-slate-500 italic">No medications prescribed.</span>
                ) : (
                  <ul className="flex flex-col gap-1.5">
                    {prescriptions.map((item, idx) => (
                      <li key={idx} className="text-xs text-slate-700 flex items-start gap-1.5">
                        <span className="text-teal-600 font-bold shrink-0 mt-0.5">·</span>
                        <div className="flex-1">
                          <span className="font-bold text-slate-800">{item.name}</span>
                          <span className="text-slate-500 text-[11px] ml-1">
                            ({item.dosage} · {getFrequencyShorthand(item.frequency)} · {item.durationValue} {item.durationUnit})
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Print Rx ghost button */}
              {prescriptions.length > 0 && (
                <button
                  type="button"
                  onClick={handlePrintRx}
                  className="btn-ghost text-xs self-start px-3 h-8 flex items-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 font-bold text-slate-700"
                  disabled={isFinalizing}
                >
                  <Printer size={14} strokeWidth={1.5} />
                  <span>Print Rx</span>
                </button>
              )}
            </div>

            {/* Right Column: Financial Estimate */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col gap-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                <CreditCard size={12} />
                <span>Financial Estimate</span>
              </span>

              {/* Consultation Fee Input */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-600">Consultation Fee (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(Math.max(0, parseInt(e.target.value) || 0))}
                    className="input-field w-full pl-7 h-9 text-xs bg-white border border-slate-205 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    disabled={isFinalizing}
                  />
                </div>
              </div>

              {/* Procedure Fees Input */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-600">Procedure Fees (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={procedureFee}
                    onChange={(e) => setProcedureFee(Math.max(0, parseInt(e.target.value) || 0))}
                    className="input-field w-full pl-7 h-9 text-xs bg-white border border-slate-205 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    disabled={isFinalizing}
                  />
                </div>
              </div>

              {/* Separator line */}
              <div className="w-full h-px bg-slate-200 my-1" />

              {/* Estimated Total */}
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Estimated Total</span>
                <span className="text-xl font-extrabold text-slate-800 flex items-center">
                  <span>₹</span>
                  <span>{estimatedTotal.toLocaleString('en-IN')}</span>
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-100 p-4 flex justify-end gap-3 bg-slate-50 rounded-b-2xl shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-xs h-9 px-4 font-bold disabled:opacity-50"
            disabled={isFinalizing}
          >
            Back to Edit
          </button>
          
          <button
            type="button"
            onClick={handleFinalize}
            className="btn-primary text-xs h-9 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg flex items-center gap-1.5 font-bold shadow-sm transition-all disabled:opacity-50"
            disabled={isFinalizing}
          >
            {isFinalizing ? (
              <Loader2 className="animate-spin text-white" size={14} strokeWidth={1.5} />
            ) : (
              <Send size={16} strokeWidth={1.5} />
            )}
            <span>Send to Billing Queue</span>
          </button>
        </div>

      </div>
    </div>
  )
}
