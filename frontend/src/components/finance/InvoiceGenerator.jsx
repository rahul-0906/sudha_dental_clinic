import { useState, useEffect } from 'react'
import {
  ArrowLeft,
  CheckCircle,
  Printer,
  Plus,
  Trash2,
  AlertCircle,
  CreditCard,
  Percent,
  Check
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function InvoiceGenerator({ onCancel, patients = [] }) {
  // Select patient
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [invoiceNumber, setInvoiceNumber] = useState('')

  // Line items state (populated with dummy data based on clinical handoff)
  const [lineItems, setLineItems] = useState([
    { id: 1, description: 'Consultation Fee', qty: 1, unitPrice: 500 },
    { id: 2, description: 'Composite Fill - Tooth 14', qty: 1, unitPrice: 1500 }
  ])

  // Discount input state
  const [discount, setDiscount] = useState(200)

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState('UPI') // Cash, UPI, Card
  const [amountTendered, setAmountTendered] = useState(1800) // matches default total
  const [paymentNotes, setPaymentNotes] = useState('UPI Ref: 19283746')
  const [isCompleting, setIsCompleting] = useState(false)

  // Auto-generate invoice number on mount
  useEffect(() => {
    const rand = Math.floor(1000 + Math.random() * 9000)
    setInvoiceNumber(`INV-2026-${rand}`)
  }, [])

  // Update selected patient info
  useEffect(() => {
    if (selectedPatientId && patients.length > 0) {
      const found = patients.find(p => String(p.id) === String(selectedPatientId))
      setSelectedPatient(found || null)
    } else {
      setSelectedPatient(null)
    }
  }, [selectedPatientId, patients])

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0)
  const grandTotal = Math.max(0, subtotal - Number(discount || 0))

  // Sync amount tendered with grand total when totals change
  useEffect(() => {
    setAmountTendered(grandTotal)
  }, [grandTotal])

  // Handle adding a new blank item line
  const handleAddItem = () => {
    const newItem = {
      id: Date.now(),
      description: '',
      qty: 1,
      unitPrice: 0
    }
    setLineItems(prev => [...prev, newItem])
  }

  // Handle editing a line item field
  const handleEditItem = (id, field, value) => {
    setLineItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          [field]: field === 'description' ? value : (parseInt(value) || 0)
        }
      }
      return item
    }))
  }

  // Handle removing a line item
  const handleRemoveItem = (id) => {
    if (lineItems.length === 1) {
      toast.error('An invoice must have at least one line item.')
      return
    }
    setLineItems(prev => prev.filter(item => item.id !== id))
  }

  // Trigger simulated print action
  const handlePrint = () => {
    if (!selectedPatientId) {
      toast.error('Please select a patient before printing.')
      return
    }
    toast.success('🖨️ Opening browser print dialog...')
    window.print()
  }

  // Complete Payment Submission
  const handleCompleteTransaction = async () => {
    if (!selectedPatientId) {
      toast.error('Please select a patient to complete the transaction.')
      return
    }
    if (amountTendered <= 0) {
      toast.error('Please enter a valid amount tendered.')
      return
    }

    setIsCompleting(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsCompleting(false)
    toast.success('Transaction logged successfully! Patient folder updated.')
    if (onCancel) onCancel() // return to invoice ledger list
  }

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })

  return (
    <div className="flex-1 p-6 flex flex-col gap-6 bg-slate-50 overflow-y-auto no-print">
      
      {/* 1. Page Header (Control Bar) */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 shrink-0 select-none bg-white -mx-6 -mt-6 px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-50 border border-slate-200 bg-white transition-all cursor-pointer flex items-center justify-center shrink-0"
            title="Go Back"
          >
            <ArrowLeft size={18} strokeWidth={1.5} />
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-850">Generate Invoice</h1>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Finance / Payment Desk</p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="btn-secondary h-9 text-xs px-4 font-bold"
            disabled={isCompleting}
          >
            Cancel
          </button>
          
          <button
            onClick={handlePrint}
            className="btn-primary h-9 text-xs px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg flex items-center gap-2 cursor-pointer font-bold shadow-sm transition-all"
            disabled={isCompleting}
          >
            <Printer size={14} strokeWidth={1.5} />
            <span>Record Payment & Print</span>
          </button>
        </div>
      </div>

      {/* 2. Dual Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-6 items-start max-w-7xl mx-auto w-full flex-1">
        
        {/* 3. Left Column: Printable Invoice Draft Sheet */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col gap-6 border-box min-h-[600px] printable-sheet">
          
          {/* Clinic Header Block */}
          <div className="flex justify-between items-start border-b border-slate-100 pb-6">
            <div className="flex flex-col">
              <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                <span>Sudha Dental Clinic</span>
              </h2>
              <span className="text-[11px] text-slate-450 mt-1.5 font-medium max-w-xs leading-normal">
                12A Sankarankovil Road, Sankarankovil, Tamil Nadu<br />
                Ph: +91 89765 43210 · Email: info@sudhaclinic.com
              </span>
            </div>
            <div className="text-right flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Invoice Code</span>
              <span className="text-sm font-extrabold text-slate-700 font-mono">{invoiceNumber}</span>
              <span className="text-[10px] text-slate-400 mt-2 block font-bold">DATE OF VISIT</span>
              <span className="text-xs font-semibold text-slate-600">{currentDate}</span>
            </div>
          </div>

          {/* Patient Details & Selector Row */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Billing To (Patient) *</label>
              {patients.length > 0 ? (
                <select
                  required
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="input-field py-1 h-9 text-xs bg-white border border-slate-200 rounded-lg cursor-pointer"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>
                  ))}
                </select>
              ) : (
                <span className="text-xs text-slate-500 font-medium">Loading patients list...</span>
              )}
            </div>
            
            <div className="flex flex-col gap-0.5 justify-center">
              {selectedPatient ? (
                <>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Patient Demographics</span>
                  <div className="text-xs text-slate-700 mt-1 font-semibold">
                    Gender: {selectedPatient.gender || 'Female'} · Age:{' '}
                    {selectedPatient.dob
                      ? `${new Date().getFullYear() - new Date(selectedPatient.dob).getFullYear()} Yrs`
                      : 'N/A'}
                  </div>
                  <div className="text-[11px] text-slate-450 mt-0.5">Ph: {selectedPatient.phone}</div>
                </>
              ) : (
                <span className="text-xs text-slate-400 italic flex items-center gap-1">
                  <AlertCircle size={12} /> Select patient to load demographic metadata
                </span>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-150 rounded-xl overflow-hidden mt-2">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-450 border-b border-slate-150 select-none">
                  <th className="p-3 w-[50%]">Item Description</th>
                  <th className="p-3 text-center w-[12%]">Qty</th>
                  <th className="p-3 text-right w-[18%]">Unit Price (₹)</th>
                  <th className="p-3 text-right w-[15%]">Total (₹)</th>
                  <th className="p-3 text-center w-[5%]"></th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/20 text-slate-700">
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleEditItem(item.id, 'description', e.target.value)}
                        placeholder="e.g. Dental Service Description"
                        className="w-full bg-transparent px-2 py-1 outline-none text-xs text-slate-800 font-medium hover:bg-slate-50 focus:bg-slate-100 rounded focus:border focus:border-teal-500/20 transition-all"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => handleEditItem(item.id, 'qty', e.target.value)}
                        className="w-12 bg-transparent py-1 outline-none text-xs text-slate-800 font-bold text-center hover:bg-slate-50 focus:bg-slate-100 rounded"
                      />
                    </td>
                    <td className="p-2 text-right">
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => handleEditItem(item.id, 'unitPrice', e.target.value)}
                        className="w-20 bg-transparent py-1 outline-none text-xs text-slate-800 font-bold text-right hover:bg-slate-50 focus:bg-slate-100 rounded pr-1"
                      />
                    </td>
                    <td className="p-2 text-right font-bold text-slate-800 select-none">
                      ₹{(item.qty * item.unitPrice).toLocaleString()}
                    </td>
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-slate-350 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
                        title="Remove row"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Line Item Controls */}
          <button
            type="button"
            onClick={handleAddItem}
            className="btn-secondary h-8 self-start text-[11px] px-3 flex items-center gap-1 bg-white hover:bg-slate-50 border border-slate-200 font-bold text-slate-700"
          >
            <Plus size={12} strokeWidth={1.5} />
            <span>Add Item Line</span>
          </button>

          {/* Financial Summary */}
          <div className="w-64 self-end flex flex-col gap-2.5 mt-4 border-t border-slate-100 pt-4">
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span className="font-semibold">Subtotal</span>
              <span className="font-bold text-slate-750">₹{subtotal.toLocaleString()}</span>
            </div>

            {/* Discount input row */}
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span className="font-semibold flex items-center gap-1">
                <Percent size={11} className="text-slate-400" />
                <span>Discount (₹)</span>
              </span>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-20 text-right px-1.5 py-0.5 border border-slate-200 rounded focus:border-teal-500 outline-none text-xs font-bold text-slate-800"
              />
            </div>

            <div className="w-full h-px bg-slate-200 my-1" />

            <div className="flex justify-between items-center text-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-450">Grand Total</span>
              <span className="text-lg font-black text-teal-700">₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>

        </div>

        {/* 4. Right Column: Payment Collection (Sticky Control panel) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-5 sticky top-20 border-box">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-1.5">
            <CreditCard size={14} className="text-teal-605" />
            <span>Log Payment Details</span>
          </h3>

          {/* Payment Method Segmented Control */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Payment Method</label>
            <div className="bg-slate-100 p-0.5 rounded-lg flex w-full border border-slate-200">
              {['Cash', 'UPI', 'Card'].map((method) => {
                const isSelected = paymentMethod === method
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white text-teal-700 shadow-sm border border-slate-200/50 font-bold'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {method}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Amount Tendered */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Amount Tendered (₹)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
              <input
                type="number"
                min="0"
                value={amountTendered}
                onChange={(e) => setAmountTendered(Math.max(0, parseInt(e.target.value) || 0))}
                className="input-field w-full pl-7 h-9 text-xs focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                disabled={isCompleting}
              />
            </div>
            {amountTendered < grandTotal && amountTendered > 0 && (
              <div className="text-[10px] text-amber-600 bg-amber-50 border border-amber-100 px-2 py-1 rounded flex items-center gap-1.5 font-medium mt-1 leading-normal select-none">
                <AlertCircle size={12} className="shrink-0" />
                <span>Partial payment recorded. Remaining ₹{(grandTotal - amountTendered).toLocaleString()} will be logged as patient due.</span>
              </div>
            )}
          </div>

          {/* Payment Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Payment Notes</label>
            <textarea
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              placeholder="e.g. Transaction Reference ID, Bank details..."
              rows={2}
              className="input-field w-full text-xs"
              disabled={isCompleting}
            />
          </div>

          {/* Action Block - Complete Transaction */}
          <button
            type="button"
            onClick={handleCompleteTransaction}
            disabled={isCompleting || !selectedPatientId}
            className="w-full mt-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-10 flex items-center justify-center gap-2 font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none text-xs"
          >
            {isCompleting ? (
              <Loader2 className="animate-spin text-white" size={16} strokeWidth={1.5} />
            ) : (
              <CheckCircle size={16} strokeWidth={1.5} />
            )}
            <span>{isCompleting ? 'Processing...' : 'Complete Transaction'}</span>
          </button>
        </div>

      </div>
      
    </div>
  )
}
