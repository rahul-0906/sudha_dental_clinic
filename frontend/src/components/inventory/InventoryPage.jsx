import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import {
  Plus,
  Search,
  Edit2,
  Package,
  AlertTriangle,
  AlertCircle,
  X,
  ArrowLeft,
  Loader2,
  CheckCircle,
  TrendingDown
} from 'lucide-react'
import { getAllMedications, createMedication, updateMedication, getLowStockAlerts } from '../../api/medications'
import { setActiveView } from '../../store/slices/appSlice'
import { format, differenceInDays, parseISO, addDays, subDays } from 'date-fns'
import toast from 'react-hot-toast'

// Form fields matching the standard 2-column modal layout
const EMPTY_FORM = {
  name: '',
  sku: '',
  category: 'MEDICINE',
  unit: 'Tablet',
  currentStock: 0,
  reorderLevel: 10,
  unitSellingPrice: '',
  expiryDate: ''
}

// Modal Component for Add/Edit Items
function ManageItemModal({ med, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  // Initialize form with existing item or template SKU
  useEffect(() => {
    if (med) {
      // Map API medication fields
      setForm({
        name: med.name || '',
        sku: med.sku || `SKU-${(med.name || '').substring(0, 3).toUpperCase()}-${med.id || Math.floor(Math.random() * 1000)}`,
        category: med.category || 'MEDICINE',
        unit: med.unit || 'Tablet',
        currentStock: med.currentStock || 0,
        reorderLevel: med.reorderLevel || 10,
        unitSellingPrice: med.unitSellingPrice || '',
        expiryDate: med.expiryDate || ''
      })
    } else {
      const rand = Math.floor(100 + Math.random() * 900)
      setForm({
        ...EMPTY_FORM,
        sku: `SKU-NEW-${rand}`,
        expiryDate: format(new Date(new Date().setMonth(new Date().getMonth() + 12)), 'yyyy-MM-dd')
      })
    }
  }, [med])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Item name is required')
      return
    }
    setSaving(true)
    try {
      // Structure fields matching backend schema
      const apiPayload = {
        name: form.name,
        category: form.category,
        unit: form.unit,
        currentStock: form.currentStock,
        reorderLevel: form.reorderLevel,
        unitCostPrice: parseFloat(form.unitSellingPrice) * 0.7, // simulated cost price
        unitSellingPrice: parseFloat(form.unitSellingPrice) || 0
      }

      if (med) {
        await updateMedication(med.id, apiPayload)
        // Store SKU and Expiry in localStorage to persist mockup details
        localStorage.setItem(`sku_${med.id}`, form.sku)
        localStorage.setItem(`expiry_${med.id}`, form.expiryDate)
        toast.success('Inventory item updated successfully!')
      } else {
        const res = await createMedication(apiPayload)
        const newId = res.data?.id
        if (newId) {
          localStorage.setItem(`sku_${newId}`, form.sku)
          localStorage.setItem(`expiry_${newId}`, form.expiryDate)
        }
        toast.success('New item added to inventory!')
      }
      onSave()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save item details')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 border-box"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100 p-6 transition-all border-box">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-5 select-none border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-850 flex items-center gap-2">
            {med ? <Edit2 size={18} strokeWidth={1.5} className="text-teal-600" /> : <Plus size={18} strokeWidth={1.5} className="text-teal-600" />}
            <span>{med ? 'Manage Item Details' : 'Add New Inventory Item'}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* 2-Column Modal Layout */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            
            {/* Item Name */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Item Name *</label>
              <input
                className="input-field w-full text-xs"
                placeholder="e.g. Amoxicillin 500mg, Composite Resin A2"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            {/* SKU */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SKU Code *</label>
              <input
                className="input-field w-full text-xs font-mono"
                placeholder="e.g. SKU-AMX500"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                required
              />
            </div>

            {/* Category Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category *</label>
              <select
                className="input-field w-full cursor-pointer text-xs"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="MEDICINE">Medicine</option>
                <option value="DENTAL">Dental Consumable</option>
                <option value="EQUIPMENT">Equipment</option>
              </select>
            </div>

            {/* Current Stock */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Stock Quantity *</label>
              <input
                type="number"
                min="0"
                className="input-field w-full text-xs"
                value={form.currentStock}
                onChange={(e) => setForm({ ...form, currentStock: parseInt(e.target.value) || 0 })}
                required
              />
            </div>

            {/* Minimum Threshold (Low Stock Limit) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Minimum Threshold (Alert Level) *</label>
              <input
                type="number"
                min="0"
                className="input-field w-full text-xs"
                value={form.reorderLevel}
                onChange={(e) => setForm({ ...form, reorderLevel: parseInt(e.target.value) || 0 })}
                required
              />
            </div>

            {/* Unit Price */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unit Price (Selling Price ₹) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input-field w-full text-xs"
                placeholder="₹0.00"
                value={form.unitSellingPrice}
                onChange={(e) => setForm({ ...form, unitSellingPrice: e.target.value })}
                required
              />
            </div>

            {/* Expiry Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expiry Date</label>
              <input
                type="date"
                className="input-field w-full text-xs"
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
              />
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-6 border-t border-slate-100 pt-4 select-none">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-2 flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-sm transition-all text-xs"
            >
              {saving && <Loader2 className="animate-spin" size={14} strokeWidth={1.5} />}
              <span>{saving ? 'Saving...' : med ? 'Update Item' : 'Add Item'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default function InventoryPage() {
  const dispatch = useDispatch()
  const [meds, setMeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('ALL') // ALL, LOW, EXPIRING
  const [modalMed, setModalMed] = useState(null)
  const [showItemModal, setShowItemModal] = useState(false)
  const [lowStockCount, setLowStockCount] = useState(0)

  // Load and map items from backend API
  const loadData = async () => {
    setLoading(true)
    try {
      const [allRes, lowRes] = await Promise.all([getAllMedications(), getLowStockAlerts()])
      const itemsList = allRes.data || []
      
      // Map API items to include persistent mock SKUs and Expiry dates
      const mappedList = itemsList.map(item => {
        const storedSku = localStorage.getItem(`sku_${item.id}`)
        const storedExpiry = localStorage.getItem(`expiry_${item.id}`)
        
        // Generate mock expiry dates distributed logically
        let mockExpiry = storedExpiry
        if (!mockExpiry) {
          if (item.currentStock <= item.reorderLevel) {
            // Low stock items expire in 15 days
            mockExpiry = format(addDays(new Date(), 15), 'yyyy-MM-dd')
          } else if (item.currentStock === 0) {
            // Out of stock expired long ago
            mockExpiry = format(subDays(new Date(), 10), 'yyyy-MM-dd')
          } else {
            // Healthy stock expires in 12 months
            mockExpiry = format(addDays(new Date(), 365), 'yyyy-MM-dd')
          }
          localStorage.setItem(`expiry_${item.id}`, mockExpiry)
        }

        return {
          ...item,
          sku: storedSku || `SKU-${item.name.substring(0, 3).toUpperCase()}-${item.id}`,
          expiryDate: mockExpiry
        }
      })

      setMeds(mappedList)
      setLowStockCount(lowRes.data?.length || 0)
    } catch {
      toast.error('Failed to load inventory logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Quick Adjustment of stock directly from list
  const handleQuickAdjustStock = async (item) => {
    const nextQty = window.prompt(`Adjust stock quantity for ${item.name}:`, item.currentStock)
    if (nextQty === null) return
    const parsedQty = parseInt(nextQty)
    if (isNaN(parsedQty) || parsedQty < 0) {
      toast.error('Please enter a valid stock quantity.')
      return
    }

    try {
      const apiPayload = {
        name: item.name,
        category: item.category,
        unit: item.unit,
        currentStock: parsedQty,
        reorderLevel: item.reorderLevel,
        unitCostPrice: item.unitCostPrice,
        unitSellingPrice: item.unitSellingPrice
      }
      await updateMedication(item.id, apiPayload)
      toast.success(`Stock level adjusted to ${parsedQty}!`)
      loadData()
    } catch (err) {
      toast.error('Failed to adjust stock level.')
    }
  }

  // Expiry calculation helper
  const getExpiryStatus = (expiryDateStr) => {
    if (!expiryDateStr) return { label: 'N/A', alert: false, expired: false }
    try {
      const expiry = parseISO(expiryDateStr)
      const today = new Date()
      const diff = differenceInDays(expiry, today)
      
      if (diff < 0) {
        return { label: `Expired (${Math.abs(diff)} days ago)`, alert: true, expired: true }
      }
      if (diff <= 30) {
        return { label: `Expires in ${diff} days`, alert: true, expired: false }
      }
      return { label: format(expiry, 'dd MMM yyyy'), alert: false, expired: false }
    } catch {
      return { label: expiryDateStr, alert: false, expired: false }
    }
  }

  // Filter listings based on search and tabs
  const filteredItems = meds.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.sku.toLowerCase().includes(searchQuery.toLowerCase())
    
    let matchesTab = true
    if (activeFilter === 'LOW') {
      matchesTab = item.currentStock <= item.reorderLevel
    } else if (activeFilter === 'EXPIRING') {
      const { alert } = getExpiryStatus(item.expiryDate)
      matchesTab = alert
    }

    return matchesSearch && matchesTab
  })

  // Get status color badges based on stock level
  const getStockBadge = (item) => {
    if (item.currentStock === 0) {
      return 'bg-red-50 text-red-700 border border-red-200 font-bold'
    }
    if (item.currentStock <= item.reorderLevel) {
      return 'bg-amber-50 text-amber-700 border border-amber-200 font-bold'
    }
    return 'bg-teal-50 text-teal-700 border border-teal-200'
  }

  return (
    <div className="flex-1 p-6 flex flex-col gap-6 bg-slate-50 overflow-y-auto font-sans">
      
      {/* 1. Page Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 shrink-0 select-none bg-white -mx-6 -mt-6 px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch(setActiveView('dashboard'))}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-50 border border-slate-200 bg-white transition-all cursor-pointer flex items-center justify-center shrink-0"
            title="Go Back"
          >
            <ArrowLeft size={18} strokeWidth={1.5} />
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-850">Inventory Management</h1>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
              {meds.length} items logged · {lowStockCount} low stock alerts
            </p>
          </div>
        </div>

        {/* Add New Item */}
        <button
          onClick={() => {
            setModalMed(null)
            setShowItemModal(true)
          }}
          className="flex items-center gap-1.5 px-4 h-9 text-xs rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition-all shadow-sm cursor-pointer select-none"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>Add New Item</span>
        </button>
      </div>

      {/* Low Stock Alert banner */}
      {lowStockCount > 0 && (
        <div className="flex items-center gap-2.5 p-4 bg-amber-50/50 border border-amber-100 rounded-2xl shadow-sm text-xs text-amber-850 select-none shrink-0">
          <AlertTriangle size={16} className="text-amber-600 shrink-0" />
          <span>
            <strong>{lowStockCount} items</strong> are running low on stock and need reordering.
          </span>
        </div>
      )}

      {/* Utility Bar (Search & Filters) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-4 border border-slate-200 rounded-2xl shadow-xs select-none shrink-0">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-450 pointer-events-none" />
          <input
            className="w-full h-8.5 bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 text-xs focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
            placeholder="Search inventory by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Filter Segmented Control pills */}
        <div className="flex items-center gap-1.5">
          {[
            { id: 'ALL', label: 'All Items' },
            { id: 'LOW', label: 'Low Stock' },
            { id: 'EXPIRING', label: 'Expiring Soon' }
          ].map(tab => {
            const isSelected = activeFilter === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`
                  flex items-center gap-1.5 h-8.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border
                  ${isSelected
                    ? 'bg-teal-50 text-teal-700 border-teal-200 shadow-xs'
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-700'
                  }
                `}
              >
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. Main Layout Data Grid wrapper */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col justify-between">
        
        {/* 3. The Inventory Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-450 uppercase tracking-wider select-none">
                <th className="px-6 py-3.5">Item Name & SKU</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Stock Level</th>
                <th className="px-6 py-3.5 text-right">Unit Price</th>
                <th className="px-6 py-3.5">Expiry Date</th>
                <th className="px-6 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4 flex flex-col gap-1.5">
                      <div className="w-40 h-3.5 bg-slate-200 rounded" />
                      <div className="w-20 h-2.5 bg-slate-150 rounded" />
                    </td>
                    <td className="px-6 py-4"><div className="w-16 h-5 bg-slate-200 rounded-full" /></td>
                    <td className="px-6 py-4"><div className="w-14 h-5 bg-slate-200 rounded-full" /></td>
                    <td className="px-6 py-4 text-right"><div className="w-14 h-3.5 bg-slate-200 rounded ml-auto" /></td>
                    <td className="px-6 py-4"><div className="w-24 h-3.5 bg-slate-200 rounded" /></td>
                    <td className="px-6 py-4 text-center"><div className="w-24 h-7 bg-slate-200 rounded mx-auto" /></td>
                  </tr>
                ))
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center text-slate-400 font-medium">
                    <Package size={32} strokeWidth={1.5} className="mx-auto mb-3 opacity-30 text-slate-400" />
                    <span>No inventory items match the criteria.</span>
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const { label: expiryLabel, alert: expiryAlert } = getExpiryStatus(item.expiryDate)
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      
                      {/* Name & SKU */}
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-xs">{item.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5">{item.sku}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-wide">
                          {item.category?.toLowerCase()}
                        </span>
                      </td>

                      {/* Stock Level Badges */}
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${getStockBadge(item)}`}>
                          {item.currentStock} {item.unit || 'Tablets'}
                        </span>
                      </td>

                      {/* Unit Price */}
                      <td className="px-6 py-3.5 text-right whitespace-nowrap font-bold text-slate-800">
                        ₹{(item.unitSellingPrice || 0).toFixed(2)}
                      </td>

                      {/* Expiry Date (alerting within 30 days) */}
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {expiryAlert ? (
                            <>
                              <AlertCircle size={14} className="text-amber-500 shrink-0" />
                              <span className="font-bold text-amber-600 text-xs">
                                {expiryLabel}
                              </span>
                            </>
                          ) : (
                            <span className="text-slate-500 text-xs font-medium">
                              {expiryLabel}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="px-6 py-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setModalMed(item)
                              setShowItemModal(true)
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-slate-650 bg-white border border-slate-250 rounded-lg hover:text-teal-600 hover:border-teal-300 hover:bg-teal-50/50 transition-all cursor-pointer shadow-xs"
                          >
                            <Edit2 size={12} strokeWidth={1.5} />
                            <span>Edit</span>
                          </button>
                          
                          <button
                            onClick={() => handleQuickAdjustStock(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-slate-650 bg-white border border-slate-250 rounded-lg hover:text-teal-600 hover:border-teal-300 hover:bg-teal-50/50 transition-all cursor-pointer shadow-xs"
                            title="Adjust current stock quantity"
                          >
                            <Plus size={12} strokeWidth={1.5} />
                            <span>Adjust</span>
                          </button>
                        </div>
                      </td>

                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* 5. Add/Edit Item Modal (State Toggle) */}
      {showItemModal && (
        <ManageItemModal
          med={modalMed}
          onClose={() => setShowItemModal(false)}
          onSave={loadData}
        />
      )}

    </div>
  )
}
