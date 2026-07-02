import { useState, useEffect, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  ArrowLeft,
  Search,
  Plus,
  Trash2,
  Loader2,
  Activity,
  Thermometer,
  Heart,
  Sparkles,
  Check,
  FileText,
  AlertCircle
} from 'lucide-react'
import { searchMedications } from '../../api/medications'
import { setActiveView } from '../../store/slices/appSlice'
import toast from 'react-hot-toast'
import CheckoutSummaryModal from './CheckoutSummaryModal'

export default function ActiveConsultation() {
  const dispatch = useDispatch()
  const selectedPatient = useSelector((state) => state.patient.selectedPatient)

  // Live Timer State
  const [secondsElapsed, setSecondsElapsed] = useState(0)

  // Clinical Documentation States
  const [chiefComplaint, setChiefComplaint] = useState('')
  const [vitals, setVitals] = useState({
    bp: '',
    temp: '',
    pulse: ''
  })
  const [clinicalNotes, setClinicalNotes] = useState('')
  const [selectedTreatments, setSelectedTreatments] = useState([])
  const [customTreatment, setCustomTreatment] = useState('')

  // Rx Builder States
  const [medicationsList, setMedicationsList] = useState([]) // prescribed items
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  // Action States
  const [isSaving, setIsSaving] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)

  const dropdownRef = useRef(null)
  const debounceRef = useRef(null)

  // Standard treatments predefined list
  const availableTreatments = [
    'Composite Fill',
    'Scaling & Polishing',
    'Root Canal Therapy',
    'Tooth Extraction',
    'Crown Installation',
    'Dental Implant',
    'Fluoride Application'
  ]

  // Start live consultation timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Format seconds to hh:mm:ss
  const formatTime = (secs) => {
    const h = String(Math.floor(secs / 3600)).padStart(2, '0')
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0')
    const s = String(secs % 60).padStart(2, '0')
    return `${h}:${m}:${s}`
  }

  // Handle clicking outside the medication search dropdown to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Perform medication search with debouncing
  const performSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([])
      setSearchLoading(false)
      return
    }
    setSearchLoading(true)
    try {
      const res = await searchMedications(query)
      setSearchResults(res.data || [])
    } catch (err) {
      console.error('Error searching medications:', err)
    } finally {
      setSearchLoading(false)
    }
  }, [])

  const handleSearchChange = (val) => {
    setSearchQuery(val)
    setShowDropdown(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      performSearch(val)
    }, 300)
  }

  // Add medication to active Rx list
  const addMedication = (med) => {
    // Check if already added
    if (medicationsList.some((item) => item.medicationId === med.id || item.name.toLowerCase() === med.name.toLowerCase())) {
      toast.error('This medication is already added to the prescription.')
      return
    }

    const newItem = {
      medicationId: med.id || null, // null for custom additions
      name: med.name,
      dosage: '500mg', // Default dosage
      frequency: { morning: true, afternoon: false, night: true }, // Default frequency (1-0-1)
      durationValue: '5', // Default duration
      durationUnit: 'Days' // Default unit
    }

    setMedicationsList((prev) => [...prev, newItem])
    setSearchQuery('')
    setSearchResults([])
    setShowDropdown(false)
    toast.success(`${med.name} added to prescription.`)
  }

  // Add custom medication not present in search results
  const addCustomMedication = () => {
    if (!searchQuery.trim()) return
    const customMed = {
      id: null,
      name: searchQuery.trim()
    }
    addMedication(customMed)
  }

  // Remove medication from active Rx list
  const removeMedication = (index) => {
    setMedicationsList((prev) => {
      const updated = [...prev]
      const removed = updated.splice(index, 1)
      toast.success(`${removed[0].name} removed from prescription.`)
      return updated
    })
  }

  // Update medication properties inside Rx list
  const updateMedicationField = (index, field, value) => {
    setMedicationsList((prev) => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        [field]: value
      }
      return updated
    })
  }

  // Toggle frequency parts (morning, afternoon, night)
  const toggleFrequency = (index, timeOfDay) => {
    setMedicationsList((prev) => {
      const updated = [...prev]
      const freq = { ...updated[index].frequency }
      freq[timeOfDay] = !freq[timeOfDay]
      updated[index] = {
        ...updated[index],
        frequency: freq
      }
      return updated
    })
  }

  // Format frequency to clinical shorthand e.g. "1-0-1"
  const getFrequencyShorthand = (freq) => {
    return `${freq.morning ? '1' : '0'}-${freq.afternoon ? '1' : '0'}-${freq.night ? '1' : '0'}`
  }

  // Toggle treatment selection
  const toggleTreatment = (treatment) => {
    setSelectedTreatments((prev) => {
      if (prev.includes(treatment)) {
        return prev.filter((t) => t !== treatment)
      } else {
        return [...prev, treatment]
      }
    })
  }

  // Add custom treatment tag
  const addCustomTreatment = (e) => {
    e.preventDefault()
    const trimmed = customTreatment.trim()
    if (!trimmed) return
    if (selectedTreatments.includes(trimmed)) {
      toast.error('Treatment already added.')
      return
    }
    setSelectedTreatments((prev) => [...prev, trimmed])
    setCustomTreatment('')
    toast.success(`Procedure "${trimmed}" added.`)
  }

  // Simulate Save Draft Action
  const handleSaveDraft = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1200))
    setIsSaving(false)
    toast.success('Consultation draft saved successfully!')
    dispatch(setActiveView('patients'))
  }

  // Open checkout handoff modal
  const handleCheckout = () => {
    setShowCheckoutModal(true)
  }

  // Simulate Checkout/Finalize Action from Handoff Modal
  const handleFinalizeCheckout = async (financialData) => {
    // Simulate API request to save checkout/invoice
    await new Promise((resolve) => setTimeout(resolve, 1850))
    toast.success('Consultation handoff completed and sent to billing!')
    dispatch(setActiveView('patients'))
  }

  // Handle Back arrow navigation click
  const handleBackClick = () => {
    if (chiefComplaint || clinicalNotes || medicationsList.length > 0) {
      if (window.confirm('You have unsaved changes. Are you sure you want to go back?')) {
        dispatch(setActiveView('patients'))
      }
    } else {
      dispatch(setActiveView('patients'))
    }
  }

  // Calculate age from DOB helper
  const getAge = (dobString) => {
    if (!dobString) return 'N/A'
    try {
      const today = new Date()
      const birth = new Date(dobString)
      let age = today.getFullYear() - birth.getFullYear()
      const m = today.getMonth() - birth.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--
      }
      return `${age} Yrs`
    } catch {
      return 'N/A'
    }
  }

  // Render Patient Demographics summary or fallback fallback
  const pName = selectedPatient?.name || 'Walk-in Patient'
  const pAge = selectedPatient?.dob ? getAge(selectedPatient.dob) : 'N/A'
  const pGender = selectedPatient?.gender || 'Female'

  return (
    <div className="w-full h-screen overflow-y-auto bg-slate-50 flex flex-col font-sans select-none antialiased">
      
      {/* 1. Immersive Sticky Header (The Control Bar) */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm px-6 py-3 flex items-center justify-between shrink-0">
        
        {/* Left: Patient demographic summary */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackClick}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-50 border border-slate-200 bg-white transition-all cursor-pointer flex items-center justify-center shrink-0"
            title="Go back to Patients"
            disabled={isSaving || isCheckingOut}
          >
            <ArrowLeft size={18} strokeWidth={1.5} />
          </button>
          
          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-slate-850 flex items-center gap-2 leading-tight">
              {pName}
            </h2>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold mt-0.5">
              <span>{pAge}</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full" />
              <span>{pGender}</span>
              {selectedPatient?.phone && (
                <>
                  <span className="w-1 h-1 bg-slate-300 rounded-full" />
                  <span className="font-medium text-slate-400">{selectedPatient.phone}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Center: Live consultation timer */}
        <div className="flex items-center gap-2.5 bg-slate-100/80 border border-slate-200 px-4 py-1.5 rounded-full shadow-inner select-none">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[12px] font-bold text-slate-700 tracking-wider font-mono">
            {formatTime(secondsElapsed)}
          </span>
        </div>

        {/* Right: Checkout and Draft action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveDraft}
            disabled={isSaving || isCheckingOut}
            className="btn-secondary h-9 text-xs px-4 flex items-center gap-2 cursor-pointer font-bold disabled:opacity-50 disabled:pointer-events-none"
          >
            {isSaving ? (
              <Loader2 className="animate-spin text-slate-400" size={14} strokeWidth={1.5} />
            ) : (
              <FileText size={14} strokeWidth={1.5} />
            )}
            <span>Save Draft</span>
          </button>

          <button
            onClick={handleCheckout}
            disabled={isSaving || isCheckingOut}
            className="btn-primary h-9 text-xs px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg flex items-center gap-2 cursor-pointer font-bold shadow-sm transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {isCheckingOut ? (
              <Loader2 className="animate-spin text-white" size={14} strokeWidth={1.5} />
            ) : (
              <Check size={14} strokeWidth={1.5} />
            )}
            <span>End & Checkout</span>
          </button>
        </div>
      </header>

      {/* 2. Dual-Column Clinical Layout */}
      <main className="flex-1 w-full overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-6 p-6 max-w-7xl mx-auto items-start">
          
          {/* 3. Left Column: Clinical Documentation */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
            
            {/* Chief Complaint */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle size={14} className="text-teal-600" strokeWidth={1.5} />
                <span>Chief Complaint</span>
              </label>
              <textarea
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="Describe patient's primary complaints and symptoms..."
                rows={2}
                className="input-field w-full"
                disabled={isSaving || isCheckingOut}
              />
            </div>

            {/* Vitals Quick-Log */}
            <div className="flex flex-col gap-2.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Activity size={14} className="text-teal-600" strokeWidth={1.5} />
                <span>Vitals Quick-Log</span>
              </label>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold text-slate-400">BP (mmHg)</span>
                  <div className="relative">
                    <Activity size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={vitals.bp}
                      onChange={(e) => setVitals((prev) => ({ ...prev, bp: e.target.value }))}
                      placeholder="e.g. 120/80"
                      className="input-field w-full pl-8 h-9 text-xs"
                      disabled={isSaving || isCheckingOut}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold text-slate-400">Temp (°F)</span>
                  <div className="relative">
                    <Thermometer size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      step="0.1"
                      value={vitals.temp}
                      onChange={(e) => setVitals((prev) => ({ ...prev, temp: e.target.value }))}
                      placeholder="e.g. 98.6"
                      className="input-field w-full pl-8 h-9 text-xs"
                      disabled={isSaving || isCheckingOut}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold text-slate-400">Pulse (bpm)</span>
                  <div className="relative">
                    <Heart size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      value={vitals.pulse}
                      onChange={(e) => setVitals((prev) => ({ ...prev, pulse: e.target.value }))}
                      placeholder="e.g. 72"
                      className="input-field w-full pl-8 h-9 text-xs"
                      disabled={isSaving || isCheckingOut}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Clinical Notes & Diagnosis */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={14} className="text-teal-600" strokeWidth={1.5} />
                <span>Clinical Notes & Diagnosis</span>
              </label>
              <textarea
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                placeholder="Log clinical notes, details of dental examination, oral hygiene remarks, and diagnosis..."
                rows={6}
                className="input-field w-full min-h-[120px]"
                disabled={isSaving || isCheckingOut}
              />
            </div>

            {/* Treatments Performed */}
            <div className="flex flex-col gap-2.5 border-t border-slate-100 pt-5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-teal-600" strokeWidth={1.5} />
                <span>Treatments Performed Today</span>
              </label>
              
              {/* Preset Treatment Badges */}
              <div className="flex flex-wrap gap-2">
                {availableTreatments.map((treatment) => {
                  const isSelected = selectedTreatments.includes(treatment)
                  return (
                    <button
                      key={treatment}
                      type="button"
                      onClick={() => !isSaving && !isCheckingOut && toggleTreatment(treatment)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer select-none ${
                        isSelected
                          ? 'bg-teal-50 border-teal-200 text-teal-700 shadow-sm font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                      disabled={isSaving || isCheckingOut}
                    >
                      {treatment}
                    </button>
                  )
                })}
              </div>

              {/* Add Custom Treatment form */}
              <form onSubmit={addCustomTreatment} className="flex gap-2 items-center mt-2">
                <input
                  type="text"
                  placeholder="Or enter custom procedure..."
                  value={customTreatment}
                  onChange={(e) => setCustomTreatment(e.target.value)}
                  className="flex-1 h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  disabled={isSaving || isCheckingOut}
                />
                <button
                  type="submit"
                  disabled={isSaving || isCheckingOut}
                  className="btn-secondary h-9 px-3 flex items-center gap-1 text-xs border border-slate-250 bg-slate-50 hover:bg-slate-100 transition-colors font-bold disabled:opacity-50"
                >
                  <Plus size={14} strokeWidth={1.5} />
                  <span>Add</span>
                </button>
              </form>
            </div>
          </div>

          {/* 4. Right Column: E-Prescription (Rx) Builder */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
              <span className="text-teal-600 font-extrabold text-base tracking-normal">Rx</span>
              <span>Prescription Builder</span>
            </h3>

            {/* Search/Add Medicine Area */}
            <div className="relative" ref={dropdownRef}>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Search medications in inventory..."
                    className="w-full h-9 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                    disabled={isSaving || isCheckingOut}
                  />
                  {searchLoading && (
                    <Loader2 size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={addCustomMedication}
                  disabled={isSaving || isCheckingOut || !searchQuery.trim()}
                  className="btn-secondary h-9 px-3 text-xs bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold transition-all flex items-center gap-1 shrink-0 disabled:opacity-50"
                  title="Add custom item"
                >
                  <Plus size={14} strokeWidth={1.5} />
                  <span>Add</span>
                </button>
              </div>

              {/* Autocomplete Dropdown */}
              {showDropdown && searchQuery.trim() && (
                <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-56 overflow-y-auto overflow-x-hidden">
                  {searchResults.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-400 flex flex-col gap-1 items-center justify-center">
                      <span>No direct inventory matches.</span>
                      <button
                        type="button"
                        onClick={addCustomMedication}
                        className="text-[11px] text-teal-655 hover:underline hover:text-teal-705 font-bold mt-1"
                      >
                        Add "{searchQuery}" as a custom medicine
                      </button>
                    </div>
                  ) : (
                    searchResults.map((med) => (
                      <div
                        key={med.id}
                        onClick={() => addMedication(med)}
                        className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between border-b border-slate-100 last:border-0"
                      >
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-slate-850 truncate">{med.name}</span>
                          <span className="text-[10px] text-slate-450 mt-0.5">
                            Category: {med.category} · Stock: {med.currentStock} {med.unit || 'Tablets'}
                          </span>
                        </div>
                        <Plus size={14} className="text-teal-600 shrink-0 ml-2" />
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Active Rx List */}
            <div className="flex flex-col gap-3 max-h-[450px] overflow-y-auto pr-1">
              {medicationsList.length === 0 ? (
                // Empty State
                <div className="flex flex-col items-center justify-center py-14 text-slate-400 gap-2 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-400">
                    <Plus size={16} strokeWidth={1.5} />
                  </div>
                  <span className="text-xs font-medium text-slate-500">No medications prescribed yet.</span>
                </div>
              ) : (
                medicationsList.map((item, idx) => (
                  // Individual Medication Card
                  <div
                    key={idx}
                    className="p-4 border border-slate-200 rounded-xl bg-white flex flex-col gap-3 relative shadow-xs hover:border-slate-300 transition-all"
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-4 pr-6">
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-slate-800 break-words">{item.name}</span>
                        {!item.medicationId && (
                          <span className="text-[9px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-full w-max mt-0.5 uppercase tracking-wide">
                            Custom entry
                          </span>
                        )}
                      </div>
                      
                      {/* Delete Icon */}
                      <button
                        type="button"
                        onClick={() => removeMedication(idx)}
                        className="absolute top-3.5 right-3 text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                        title="Remove medicine"
                        disabled={isSaving || isCheckingOut}
                      >
                        <Trash2 size={14} strokeWidth={1.5} />
                      </button>
                    </div>

                    {/* Dosage Dropdown */}
                    <div className="grid grid-cols-2 gap-3 items-center">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Dosage</span>
                        <select
                          value={item.dosage}
                          onChange={(e) => updateMedicationField(idx, 'dosage', e.target.value)}
                          className="input-field text-xs py-1 h-8 bg-white border border-slate-200 rounded-lg focus:border-teal-500 cursor-pointer"
                          disabled={isSaving || isCheckingOut}
                        >
                          <option value="500mg">500mg</option>
                          <option value="250mg">250mg</option>
                          <option value="100mg">100mg</option>
                          <option value="650mg">650mg</option>
                          <option value="5ml">5ml (1 tsp)</option>
                          <option value="10ml">10ml (2 tsp)</option>
                          <option value="1 drop">1 drop</option>
                          <option value="Apply thin layer">Apply thin layer</option>
                        </select>
                      </div>

                      {/* Duration */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Duration</span>
                        <div className="flex gap-1.5">
                          <input
                            type="number"
                            min="1"
                            value={item.durationValue}
                            onChange={(e) => updateMedicationField(idx, 'durationValue', e.target.value)}
                            className="input-field text-xs py-1 h-8 bg-white border border-slate-200 rounded-lg focus:border-teal-500 w-14 text-center"
                            disabled={isSaving || isCheckingOut}
                          />
                          <select
                            value={item.durationUnit}
                            onChange={(e) => updateMedicationField(idx, 'durationUnit', e.target.value)}
                            className="input-field text-xs py-1 h-8 bg-white border border-slate-200 rounded-lg focus:border-teal-500 flex-1 cursor-pointer"
                            disabled={isSaving || isCheckingOut}
                          >
                            <option value="Days">Days</option>
                            <option value="Weeks">Weeks</option>
                            <option value="Months">Months</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Frequency Segmented Control */}
                    <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Frequency</span>
                        <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded-md font-mono">
                          {getFrequencyShorthand(item.frequency)}
                        </span>
                      </div>

                      <div className="bg-slate-100 p-0.5 rounded-lg flex w-full">
                        <button
                          type="button"
                          onClick={() => toggleFrequency(idx, 'morning')}
                          disabled={isSaving || isCheckingOut}
                          className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                            item.frequency.morning
                              ? 'bg-white text-teal-750 shadow-xs border border-slate-200/50'
                              : 'text-slate-455 hover:text-slate-700'
                          }`}
                        >
                          Morning
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleFrequency(idx, 'afternoon')}
                          disabled={isSaving || isCheckingOut}
                          className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                            item.frequency.afternoon
                              ? 'bg-white text-teal-750 shadow-xs border border-slate-200/50'
                              : 'text-slate-455 hover:text-slate-700'
                          }`}
                        >
                          Afternoon
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleFrequency(idx, 'night')}
                          disabled={isSaving || isCheckingOut}
                          className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                            item.frequency.night
                              ? 'bg-white text-teal-750 shadow-xs border border-slate-200/50'
                              : 'text-slate-455 hover:text-slate-700'
                          }`}
                        >
                          Night
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>

      {showCheckoutModal && (
        <CheckoutSummaryModal
          isOpen={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
          onFinalize={handleFinalizeCheckout}
          patient={selectedPatient}
          duration={formatTime(secondsElapsed)}
          treatments={selectedTreatments}
          prescriptions={medicationsList}
        />
      )}
    </div>
  )
}
