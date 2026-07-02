import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Users,
  Calendar,
  DollarSign,
  Package,
  TrendingUp,
  Clock,
  UserPlus,
  FileText,
  AlertTriangle,
  ChevronRight,
  Loader2,
  CheckCircle,
  Plus,
  AlertCircle
} from 'lucide-react'
import { setActiveView } from '../../store/slices/appSlice'
import { setSelectedPatient } from '../../store/slices/patientSlice'
import { searchPatients } from '../../api/patients'
import { getAppointments } from '../../api/appointments'
import { getAllMedications, getLowStockAlerts } from '../../api/medications'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const dispatch = useDispatch()

  // API States
  const [patients, setPatients] = useState([])
  const [appointments, setAppointments] = useState([])
  const [medications, setMedications] = useState([])
  const [lowStockCount, setLowStockCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Fetch all dashboard data
  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const [patientsRes, apptsRes, medsRes, lowRes] = await Promise.all([
        searchPatients(''),
        getAppointments(),
        getAllMedications(),
        getLowStockAlerts()
      ])

      setPatients(patientsRes.data || [])
      setAppointments(apptsRes.data || [])
      setMedications(medsRes.data || [])
      setLowStockCount(lowRes.data?.length || 0)
    } catch (err) {
      console.error('Failed to load dashboard statistics', err)
      toast.error('Failed to update dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  // Filter today's appointments
  const formattedToday = format(new Date(), 'yyyy-MM-dd')
  const todayAppointments = appointments.filter(appt => {
    return appt.appointmentDate?.startsWith(formattedToday)
  })

  // Prepopulate with high-fidelity dummy appointments if DB has none for today
  const dummyAppointments = [
    {
      id: 'dash-dummy-1',
      appointmentDate: formattedToday,
      appointmentTime: '09:30 AM',
      duration: '60 Mins',
      treatment: 'Root Canal Treatment',
      doctor: 'Dr. Mariyappan',
      status: 'SCHEDULED',
      patient: { name: 'Priya Nair', phone: '9876543210', dob: '1995-04-12', gender: 'Female' }
    },
    {
      id: 'dash-dummy-2',
      appointmentDate: formattedToday,
      appointmentTime: '11:00 AM',
      duration: '30 Mins',
      treatment: 'Scaling & Polishing',
      doctor: 'Dr. Mariyappan',
      status: 'ARRIVED',
      patient: { name: 'Ramesh Kumar', phone: '8976543210', dob: '1988-11-23', gender: 'Male' }
    },
    {
      id: 'dash-dummy-3',
      appointmentDate: formattedToday,
      appointmentTime: '02:30 PM',
      duration: '45 Mins',
      treatment: 'Composite Fill - Tooth 14',
      doctor: 'Dr. Mariyappan',
      status: 'COMPLETED',
      patient: { name: 'Meera Jasmine', phone: '7976543210', dob: '1991-08-05', gender: 'Female' }
    }
  ]

  // Combined list for display
  const activeTodayAppointments = todayAppointments.length > 0
    ? todayAppointments.map(appt => {
        let displayStatus = appt.status
        if (appt.status === 'UPCOMING') displayStatus = 'SCHEDULED'
        if (appt.status === 'IN_PROGRESS') displayStatus = 'ARRIVED'
        return { ...appt, status: displayStatus }
      })
    : dummyAppointments

  // Jump straight to consultation workflow
  const handleStartConsultation = () => {
    // Find the first patient in today's queue or use the first registered patient
    const targetPatient = activeTodayAppointments[0]?.patient || patients[0]
    
    if (targetPatient) {
      dispatch(setSelectedPatient(targetPatient))
      dispatch(setActiveView('consultation'))
      toast.success(`Starting active consultation for ${targetPatient.name}...`)
    } else {
      toast.error('No patient directory loaded to start consultation.')
    }
  }

  // Get status color badges
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-teal-50 border-teal-200 text-teal-700 font-bold'
      case 'ARRIVED':
        return 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold'
      case 'COMPLETED':
        return 'bg-slate-50 border-slate-200 text-slate-600'
      default:
        return 'bg-slate-50 border-slate-200 text-slate-600'
    }
  }

  // Check inventory alert details (Low stock or expiring within 30 days)
  const inventoryAlertsList = medications
    .map(med => {
      // Map mock expiry dates
      let isExpiringSoon = false
      const storedExpiry = localStorage.getItem(`expiry_${med.id}`)
      if (storedExpiry) {
        const diffDays = Math.ceil((new Date(storedExpiry) - new Date()) / (1000 * 60 * 60 * 24))
        isExpiringSoon = diffDays >= 0 && diffDays <= 30
      }
      return {
        ...med,
        isLow: med.currentStock <= med.reorderLevel,
        isExpiringSoon
      }
    })
    .filter(item => item.isLow || item.isExpiringSoon)
    .slice(0, 3)

  const currentDateLabel = format(new Date(), 'EEEE, dd MMMM yyyy')

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-slate-50 select-none animate-pulse">
        {/* Header Skeleton */}
        <div className="h-16 bg-white border border-slate-200 rounded-xl p-5 flex justify-between items-center">
          <div className="flex flex-col gap-2">
            <div className="w-48 h-4 bg-slate-200 rounded" />
            <div className="w-32 h-3 bg-slate-150 rounded" />
          </div>
          <div className="w-36 h-9 bg-slate-200 rounded-xl" />
        </div>

        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 h-28 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <div className="w-20 h-3 bg-slate-200 rounded" />
                <div className="w-8 h-8 rounded-lg bg-slate-150" />
              </div>
              <div className="w-24 h-6 bg-slate-200 rounded" />
              <div className="w-36 h-3 bg-slate-100 rounded" />
            </div>
          ))}
        </div>

        {/* Main Columns Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 h-96" />
          <div className="flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-40" />
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-40" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-slate-50 select-none font-sans">
      


      {/* 2. Top Level: KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-2">
        
        {/* Card 1: Today's Patients */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between hover:shadow transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-650 flex items-center justify-center shrink-0">
              <Users size={20} strokeWidth={1.5} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Today's Patients</span>
              <div className="text-2xl font-black text-slate-800 mt-1">{activeTodayAppointments.length}</div>
              <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 mt-0.5">
                <TrendingUp size={12} />
                <span>+8% from yesterday</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Daily Revenue */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between hover:shadow transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-650 flex items-center justify-center shrink-0">
              <DollarSign size={20} strokeWidth={1.5} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Daily Revenue</span>
              <div className="text-2xl font-black text-slate-800 mt-1">₹45,680</div>
              <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 mt-0.5">
                <TrendingUp size={12} />
                <span>+14.2% from average</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Pending Invoices */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between hover:shadow transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-650 flex items-center justify-center shrink-0">
              <FileText size={20} strokeWidth={1.5} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Pending Invoices</span>
              <div className="text-2xl font-black text-slate-800 mt-1">5</div>
              <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-450 mt-0.5">
                <Clock size={12} />
                <span>Awaiting front desk collection</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Low Stock Alerts */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between hover:shadow transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-650 flex items-center justify-center shrink-0">
              <Package size={20} strokeWidth={1.5} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Low Stock Alerts</span>
              <div className="text-2xl font-black text-slate-800 mt-1">{lowStockCount}</div>
              <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-450 mt-0.5">
                <AlertTriangle size={12} className="text-amber-500" />
                <span>Items need reordering</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Main Content Grid (Dual-Column) */}
      <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-6 items-start w-full">
        
        {/* 4. Left Column: Today's Schedule Overview */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between min-h-[400px] border-box">
          <div className="p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Calendar size={18} strokeWidth={1.5} className="text-teal-605" />
              <span>Today's Appointments</span>
            </h3>

            <div className="flex flex-col gap-3.5">
              {activeTodayAppointments.slice(0, 4).map((appt) => (
                <div
                  key={appt.id}
                  className="flex items-center justify-between p-3.5 border border-slate-100 rounded-xl hover:border-slate-200 hover:shadow-xs transition-all bg-slate-50/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-16 text-right font-mono text-xs font-bold text-slate-500 border-r border-slate-200 pr-3">
                      {appt.appointmentTime}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800">{appt.patient?.name}</span>
                      <span className="text-[10px] text-slate-450 mt-0.5">{appt.treatment}</span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 text-[9px] border rounded-full ${getStatusBadgeClass(appt.status)}`}>
                    {appt.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* View Full Calendar Button */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex justify-center">
            <button
              onClick={() => dispatch(setActiveView('appointments'))}
              className="text-xs font-bold text-teal-650 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Calendar</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* 5. Right Column: Operations & Alerts */}
        <div className="flex flex-col gap-6">
          
          {/* Quick Actions Panel */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-3 mb-4">
              Quick Operations
            </h3>
            
            <button
              onClick={handleStartConsultation}
              className="w-full mb-4 flex items-center justify-center gap-1.5 px-4 h-10 text-xs rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition-all shadow-sm cursor-pointer select-none"
            >
              <CheckCircle size={15} strokeWidth={2.5} />
              <span>Start Consultation</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => dispatch(setActiveView('patients'))}
                className="p-4 bg-slate-50 hover:bg-teal-50/30 border border-slate-100 hover:border-teal-200 rounded-xl text-center flex flex-col items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5 transition-transform group"
              >
                <UserPlus size={18} className="text-slate-500 group-hover:text-teal-600 transition-colors" />
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-teal-700">Register Patient</span>
              </button>

              <button
                onClick={() => dispatch(setActiveView('finance'))}
                className="p-4 bg-slate-50 hover:bg-teal-50/30 border border-slate-100 hover:border-teal-200 rounded-xl text-center flex flex-col items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5 transition-transform group"
              >
                <FileText size={18} className="text-slate-500 group-hover:text-teal-600 transition-colors" />
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-teal-700">Generate Invoice</span>
              </button>

              <button
                onClick={() => dispatch(setActiveView('inventory'))}
                className="p-4 bg-slate-50 hover:bg-teal-50/30 border border-slate-100 hover:border-teal-200 rounded-xl text-center flex flex-col items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5 transition-transform group"
              >
                <Plus size={18} className="text-slate-500 group-hover:text-teal-600 transition-colors" />
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-teal-700">Add Inventory</span>
              </button>

              <button
                onClick={() => dispatch(setActiveView('report'))}
                className="p-4 bg-slate-50 hover:bg-teal-50/30 border border-slate-100 hover:border-teal-200 rounded-xl text-center flex flex-col items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5 transition-transform group"
              >
                <TrendingUp size={18} className="text-slate-500 group-hover:text-teal-600 transition-colors" />
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-teal-700">View Reports</span>
              </button>
            </div>
          </div>

          {/* Inventory Attention Required widget */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between min-h-[220px]">
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5">
                <AlertCircle size={14} className="text-rose-600" />
                <span>Inventory Attention Required</span>
              </h3>

              <div className="flex flex-col gap-3">
                {inventoryAlertsList.length === 0 ? (
                  <span className="text-xs text-slate-450 italic">All logged stocks are healthy.</span>
                ) : (
                  inventoryAlertsList.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-xs">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{item.name}</span>
                        <span className="text-[10px] text-slate-400 mt-0.5 font-mono">{item.sku}</span>
                      </div>
                      
                      <span className="font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded text-[10px] shrink-0">
                        {item.currentStock === 0 ? 'Out of Stock' : `Low: ${item.currentStock} left`}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Manage Stock Link */}
            <button
              onClick={() => dispatch(setActiveView('inventory'))}
              className="text-xs font-bold text-teal-650 hover:text-teal-700 flex items-center gap-1 cursor-pointer pt-3 border-t border-slate-100 mt-4 select-none w-full text-left"
            >
              <span>Manage Stock</span>
              <ChevronRight size={14} />
            </button>
          </div>

        </div>

      </div>

    </div>
  )
}
