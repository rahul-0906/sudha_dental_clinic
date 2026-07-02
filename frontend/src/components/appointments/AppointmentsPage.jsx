import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Loader2,
  CheckCircle,
  Clock,
  User,
  Activity,
  UserCheck,
  Search,
  ArrowLeft
} from 'lucide-react'
import { setActiveView } from '../../store/slices/appSlice'
import { getAppointments, createAppointment, updateAppointmentStatus } from '../../api/appointments'
import { searchPatients } from '../../api/patients'
import { format, addDays, subDays } from 'date-fns'
import toast from 'react-hot-toast'

export default function AppointmentsPage() {
  const dispatch = useDispatch()

  // API states
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Selected date state (defaults to today)
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Filters State
  const [doctorFilter, setDoctorFilter] = useState('Dr. Mariyappan')
  const [statusFilter, setStatusFilter] = useState({
    SCHEDULED: true,
    ARRIVED: true,
    COMPLETED: true,
    CANCELLED: false
  })

  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [newBooking, setNewBooking] = useState({
    patientId: '',
    appointmentDate: format(new Date(), 'yyyy-MM-dd'),
    appointmentTime: '09:00 AM',
    duration: '30 Mins',
    treatment: '',
    doctor: 'Dr. Mariyappan',
    location: 'Sankarankovil'
  })

  // Load appointments
  const loadAppointments = async () => {
    setLoading(true)
    try {
      const res = await getAppointments()
      setAppointments(res.data || [])
    } catch (err) {
      toast.error('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  // Load patients list for dropdown selector
  const loadPatients = async () => {
    try {
      const res = await searchPatients('')
      setPatients(res.data || [])
    } catch (err) {
      console.error('Failed to load patients', err)
    }
  }

  useEffect(() => {
    loadAppointments()
    loadPatients()
  }, [])

  // Handle new appointment submission
  const handleScheduleSubmit = async (e) => {
    e.preventDefault()
    if (!newBooking.patientId) {
      toast.error('Please select a patient')
      return
    }
    setSubmitting(true)
    try {
      // Map frontend fields to backend expected model structure
      const apiPayload = {
        patientId: newBooking.patientId,
        doctor: newBooking.doctor,
        appointmentDate: newBooking.appointmentDate,
        appointmentTime: newBooking.appointmentTime,
        treatment: newBooking.treatment || 'General Consultation',
        location: newBooking.location,
        status: 'UPCOMING' // default status mapped as SCHEDULED
      }
      await createAppointment(apiPayload)
      toast.success('Appointment booked successfully!')
      setShowBookingModal(false)
      // Reset form
      setNewBooking({
        patientId: '',
        appointmentDate: format(selectedDate, 'yyyy-MM-dd'),
        appointmentTime: '09:00 AM',
        duration: '30 Mins',
        treatment: '',
        doctor: 'Dr. Mariyappan',
        location: 'Sankarankovil'
      })
      loadAppointments()
    } catch (err) {
      toast.error('Failed to book appointment')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle status update
  const handleStatusChange = async (apptId, nextStatus) => {
    try {
      await updateAppointmentStatus(apptId, nextStatus)
      toast.success(`Appointment status updated to ${nextStatus.toLowerCase()}!`)
      loadAppointments()
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  // Left Sidebar Mini-Calendar Helpers
  const year = selectedDate.getFullYear()
  const month = selectedDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayIndex = new Date(year, month, 1).getDay()

  const calendarDays = []
  // Pad previous month days
  const prevMonthDaysCount = new Date(year, month, 0).getDate()
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarDays.push({
      day: prevMonthDaysCount - i,
      isCurrentMonth: false,
      date: new Date(year, month - 1, prevMonthDaysCount - i)
    })
  }
  // Populate current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const isToday = new Date().toDateString() === new Date(year, month, i).toDateString()
    calendarDays.push({
      day: i,
      isCurrentMonth: true,
      isToday,
      date: new Date(year, month, i)
    })
  }

  // Predefined 30-minute increment daily timeline slots
  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
    '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM'
  ]

  // Create list of fallback/dummy appointments combined with DB appointments
  const formattedSelectedDate = format(selectedDate, 'yyyy-MM-dd')
  
  // Custom dummy data to guarantee layout demonstration
  const dummyAppointments = [
    {
      id: 'dummy-1',
      appointmentDate: formattedSelectedDate,
      appointmentTime: '09:30 AM',
      duration: '60 Mins',
      treatment: 'Root Canal Treatment',
      doctor: 'Dr. Mariyappan',
      status: 'SCHEDULED',
      patient: { name: 'Priya Nair', phone: '9876543210' }
    },
    {
      id: 'dummy-2',
      appointmentDate: formattedSelectedDate,
      appointmentTime: '11:00 AM',
      duration: '30 Mins',
      treatment: 'Scaling & Polishing',
      doctor: 'Dr. Mariyappan',
      status: 'ARRIVED',
      patient: { name: 'Ramesh Kumar', phone: '8976543210' }
    },
    {
      id: 'dummy-3',
      appointmentDate: formattedSelectedDate,
      appointmentTime: '02:30 PM',
      duration: '45 Mins',
      treatment: 'Composite Fill - Tooth 14',
      doctor: 'Dr. Mariyappan',
      status: 'COMPLETED',
      patient: { name: 'Meera Jasmine', phone: '7976543210' }
    }
  ]

  // Combine database entries with dummies for rendering
  const allAvailableAppointments = [
    ...appointments.map(appt => {
      // Map API statuses (UPCOMING -> SCHEDULED, IN_PROGRESS -> ARRIVED)
      let displayStatus = appt.status
      if (appt.status === 'UPCOMING') displayStatus = 'SCHEDULED'
      if (appt.status === 'IN_PROGRESS') displayStatus = 'ARRIVED'
      return {
        ...appt,
        status: displayStatus,
        duration: appt.duration || '30 Mins'
      }
    }),
    ...dummyAppointments
  ]

  // Filter list by selected date, assigned doctor, and checked statuses
  const dailyTimelineAppointments = allAvailableAppointments.filter(appt => {
    const isSameDate = appt.appointmentDate?.startsWith(formattedSelectedDate)
    const matchesDoc = doctorFilter === 'All Doctors' || appt.doctor === doctorFilter
    const matchesStatus = statusFilter[appt.status] === true
    return isSameDate && matchesDoc && matchesStatus
  })

  // Date Navigator formatted title
  const dateNavigatorLabel = () => {
    const todayStr = format(new Date(), 'yyyy-MM-dd')
    if (formattedSelectedDate === todayStr) {
      return `Today, ${format(selectedDate, 'dd MMM yyyy')}`
    }
    return format(selectedDate, 'EEEE, dd MMM yyyy')
  }

  // Get status color styling classes
  const getStatusClasses = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100/50'
      case 'ARRIVED':
        return 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100/50'
      case 'COMPLETED':
        return 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100/50'
      case 'CANCELLED':
        return 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100/50'
      default:
        return 'bg-slate-50 border-slate-200 text-slate-600'
    }
  }

  return (
    <div className="flex-1 p-6 flex flex-col gap-6 bg-slate-50 overflow-y-auto font-sans">
      
      {/* 1. Page Header & Navigation Controls */}
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
            <h1 className="text-base font-bold text-slate-850">Appointments</h1>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Clinical Schedule Scheduler</p>
          </div>
        </div>

        {/* Date Navigator Pill control */}
        <div className="flex items-center bg-slate-100/80 border border-slate-200 rounded-full p-1 gap-1 shadow-inner select-none">
          <button
            onClick={() => setSelectedDate(prev => subDays(prev, 1))}
            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-white rounded-full transition-all cursor-pointer"
            title="Previous Day"
          >
            <ChevronLeft size={16} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => setSelectedDate(new Date())}
            className="px-3 py-1 font-bold text-xs text-slate-700 bg-white shadow-xs rounded-full cursor-pointer hover:bg-slate-50"
            title="Reset to today"
          >
            {dateNavigatorLabel()}
          </button>
          <button
            onClick={() => setSelectedDate(prev => addDays(prev, 1))}
            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-white rounded-full transition-all cursor-pointer"
            title="Next Day"
          >
            <ChevronRight size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* New Booking launcher trigger */}
        <button
          onClick={() => {
            setNewBooking(prev => ({ ...prev, appointmentDate: format(selectedDate, 'yyyy-MM-dd') }))
            setShowBookingModal(true)
          }}
          className="flex items-center gap-1.5 px-4 h-9 text-xs rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition-all shadow-sm cursor-pointer select-none"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>New Booking</span>
        </button>
      </div>

      {/* 2. Main Layout Dual-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start max-w-7xl mx-auto w-full flex-1">
        
        {/* 3. Left Column: Mini-Calendar & Filters Sidebar */}
        <aside className="bg-white border border-slate-200 rounded-2xl p-5 sticky top-6 flex flex-col gap-5 border-box">
          
          {/* Interactive Mini Calendar */}
          <div className="flex flex-col select-none">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800">
                {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
            </div>
            
            {/* Week Headers */}
            <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 mb-1.5">
              <span>Su</span>
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
            </div>

            {/* Monthly Grid */}
            <div className="grid grid-cols-7 text-center gap-y-1 text-xs">
              {calendarDays.map((d, idx) => {
                const isSelected = selectedDate.toDateString() === d.date.toDateString()
                return (
                  <div key={idx} className="flex justify-center">
                    <button
                      onClick={() => setSelectedDate(d.date)}
                      className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-teal-600 text-white shadow-xs'
                          : d.isCurrentMonth
                            ? 'text-slate-700 hover:bg-slate-50'
                            : 'text-slate-300'
                      }`}
                    >
                      {d.day}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Status Filter checkboxes */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status Filters</span>
            <div className="flex flex-col gap-2.5 mt-1 select-none">
              {Object.keys(statusFilter).map((status) => (
                <label key={status} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-650 hover:text-slate-800">
                  <input
                    type="checkbox"
                    checked={statusFilter[status]}
                    onChange={() => setStatusFilter(prev => ({ ...prev, [status]: !prev[status] }))}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
                  />
                  <span>
                    {status.charAt(0) + status.slice(1).toLowerCase()}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Provider Filter Doctor Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Doctor Provider</label>
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="h-8.5 w-full bg-slate-50 border border-slate-200 rounded-lg text-xs px-2.5 text-slate-750 focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              <option value="All Doctors">All Doctors</option>
              <option value="Dr. Mariyappan">Dr. Mariyappan</option>
            </select>
          </div>
          
        </aside>

        {/* 4. Right Column: The Daily Timeline */}
        <div className="flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden border-box">
          {loading ? (
            <div className="flex flex-col gap-0.5 divide-y divide-slate-100">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="grid grid-cols-[80px_1fr] min-h-[80px] animate-pulse">
                  <div className="p-3 border-r border-slate-100 text-right pr-4 font-mono text-[11px] text-slate-250 select-none">
                    09:00 AM
                  </div>
                  <div className="p-3 bg-slate-50/10 flex items-center justify-center">
                    <div className="w-[85%] h-12 bg-slate-100 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-slate-100">
              {timeSlots.map((slot) => {
                // Find all appointments matching this timeslot start time
                const slotAppointments = dailyTimelineAppointments.filter(appt => {
                  return appt.appointmentTime === slot
                })

                return (
                  <div key={slot} className="grid grid-cols-[80px_1fr] min-h-[85px] hover:bg-slate-50/10 transition-colors">
                    {/* Left Side (Time indicator) */}
                    <div className="text-xs font-semibold text-slate-500 text-right pr-4 py-3 border-r border-slate-100 font-mono select-none">
                      {slot}
                    </div>

                    {/* Right Side (Drop Zone / Card Container) */}
                    <div className="p-3 flex flex-wrap gap-3 items-start relative min-h-full">
                      {slotAppointments.length === 0 ? (
                        <div className="text-[10px] text-slate-300 italic absolute inset-0 flex items-center pl-4 select-none pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
                          Empty Slot
                        </div>
                      ) : (
                        slotAppointments.map((appt) => (
                          // 5. Appointment Card
                          <div
                            key={appt.id}
                            className={`w-full sm:max-w-md rounded-lg border p-3 flex flex-col gap-1.5 cursor-pointer transition-all shadow-xs hover:shadow-md select-none border-box ${getStatusClasses(appt.status)}`}
                          >
                            <div className="flex justify-between items-start">
                              <span className="text-xs font-extrabold text-slate-800 tracking-tight">
                                {appt.patient?.name}
                              </span>
                              
                              {/* Status update controller inline */}
                              <select
                                value={appt.status}
                                onChange={(e) => handleStatusChange(appt.id, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="h-5.5 bg-white border border-slate-200 rounded text-[9px] px-1 font-bold focus:outline-none cursor-pointer text-slate-700"
                              >
                                <option value="SCHEDULED">SCHEDULED</option>
                                <option value="ARRIVED">ARRIVED</option>
                                <option value="COMPLETED">COMPLETED</option>
                                <option value="CANCELLED">CANCELLED</option>
                              </select>
                            </div>

                            <div className="flex justify-between items-center text-[10px] opacity-80 mt-0.5">
                              <span className="font-semibold">{appt.treatment}</span>
                              <div className="flex items-center gap-1 font-mono text-[9px] font-bold">
                                <Clock size={10} />
                                <span>{appt.appointmentTime} ({appt.duration})</span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>

      {/* 6. The "New Booking" Modal (State Toggle) */}
      {showBookingModal && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowBookingModal(false)}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100 p-6 transition-all border-box">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5 select-none border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-850 flex items-center gap-2">
                <CalendarIcon size={18} strokeWidth={1.5} className="text-teal-650" />
                <span>New Appointment Booking</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowBookingModal(false)}
                className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleScheduleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                
                {/* Patient Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Patient *</label>
                  {patients.length > 0 ? (
                    <select
                      required
                      value={newBooking.patientId}
                      onChange={(e) => setNewBooking(prev => ({ ...prev, patientId: e.target.value }))}
                      className="input-field w-full cursor-pointer"
                    >
                      <option value="">-- Select Patient --</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No patients found. Please register patient first.</span>
                  )}
                </div>

                {/* Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date *</label>
                  <input
                    type="date"
                    required
                    value={newBooking.appointmentDate}
                    onChange={(e) => setNewBooking(prev => ({ ...prev, appointmentDate: e.target.value }))}
                    className="input-field w-full text-xs"
                  />
                </div>

                {/* Start Time */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Start Time *</label>
                  <select
                    value={newBooking.appointmentTime}
                    onChange={(e) => setNewBooking(prev => ({ ...prev, appointmentTime: e.target.value }))}
                    className="input-field w-full cursor-pointer text-xs"
                  >
                    {timeSlots.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>

                {/* Duration */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duration</label>
                  <select
                    value={newBooking.duration}
                    onChange={(e) => setNewBooking(prev => ({ ...prev, duration: e.target.value }))}
                    className="input-field w-full cursor-pointer text-xs"
                  >
                    <option value="15 Mins">15 Mins</option>
                    <option value="30 Mins">30 Mins</option>
                    <option value="45 Mins">45 Mins</option>
                    <option value="60 Mins">60 Mins</option>
                    <option value="90 Mins">90 Mins</option>
                    <option value="120 Mins">120 Mins</option>
                  </select>
                </div>

                {/* Reason / Treatment Description */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reason for Visit / Treatment *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Scaling, Root Canal treatment, Bridge prep"
                    value={newBooking.treatment}
                    onChange={(e) => setNewBooking(prev => ({ ...prev, treatment: e.target.value }))}
                    className="input-field w-full text-xs"
                  />
                </div>

                {/* Doctor */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assign Doctor *</label>
                  <input
                    type="text"
                    required
                    value={newBooking.doctor}
                    onChange={(e) => setNewBooking(prev => ({ ...prev, doctor: e.target.value }))}
                    className="input-field w-full text-xs"
                  />
                </div>

                {/* Location */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Room / Location</label>
                  <input
                    type="text"
                    required
                    value={newBooking.location}
                    onChange={(e) => setNewBooking(prev => ({ ...prev, location: e.target.value }))}
                    className="input-field w-full text-xs"
                  />
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mt-6 border-t border-slate-100 pt-4 select-none">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex-2 flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-sm cursor-pointer"
                >
                  {submitting && <Loader2 className="animate-spin" size={14} strokeWidth={1.5} />}
                  <span>{submitting ? 'Booking...' : 'Book Appointment'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}
