import { useState, useEffect } from 'react'
import { 
  Users, 
  Plus, 
  Trash2, 
  Clock, 
  Phone, 
  Mail, 
  Edit, 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react'
import { useDispatch } from 'react-redux'
import { setActiveView } from '../../store/slices/appSlice'
import { getAllStaff, addStaff, updateStaff, deleteStaff } from '../../api/staff'
import toast from 'react-hot-toast'

export default function StaffPage() {
  const dispatch = useDispatch()
  const [staffList, setStaffList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedStaffId, setSelectedStaffId] = useState(null)

  // Form State
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    role: 'NURSE',
    status: 'ACTIVE',
    shiftStart: '09:00 AM',
    shiftEnd: '05:00 PM'
  })

  const loadStaff = async () => {
    setLoading(true)
    try {
      const res = await getAllStaff()
      setStaffList(res.data || [])
    } catch (err) {
      toast.error('Failed to load staff list')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStaff()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editMode) {
        await updateStaff(selectedStaffId, form)
        toast.success('Staff member updated successfully!')
      } else {
        await addStaff(form)
        toast.success('Staff member added successfully!')
      }
      setShowAddModal(false)
      setEditMode(false)
      loadStaff()
    } catch (err) {
      toast.error('Failed to save staff member')
    }
  }

  const handleEditClick = (staff) => {
    setForm({
      name: staff.name,
      phone: staff.phone || '',
      email: staff.email || '',
      role: staff.role || 'NURSE',
      status: staff.status || 'ACTIVE',
      shiftStart: staff.shiftStart || '09:00 AM',
      shiftEnd: staff.shiftEnd || '05:00 PM'
    })
    setSelectedStaffId(staff.id)
    setEditMode(true)
    setShowAddModal(true)
  }

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return
    try {
      await deleteStaff(id)
      toast.success('Staff member deleted')
      loadStaff()
    } catch (err) {
      toast.error('Failed to delete staff member')
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-[#F8FAFC]">
      
      {/* Header section */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 shrink-0 select-none">
        <button 
          onClick={() => dispatch(setActiveView('dashboard'))} 
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-755 cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span className="text-sm font-bold text-slate-800">Staff Management</span>
        </button>

        <button 
          onClick={() => {
            setForm({
              name: '',
              phone: '',
              email: '',
              role: 'NURSE',
              status: 'ACTIVE',
              shiftStart: '09:00 AM',
              shiftEnd: '05:00 PM'
            })
            setEditMode(false)
            setShowAddModal(true)
          }}
          className="flex items-center gap-1 px-3.5 h-9 text-xs rounded-xl bg-teal-650 hover:bg-teal-700 text-white font-bold transition-all shadow-sm cursor-pointer"
        >
          <Plus size={14} strokeWidth={2.5} />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Grid Table Container */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm flex-1 flex flex-col overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-150 select-none">
                <th className="p-4">Staff Member</th>
                <th className="p-4">Role</th>
                <th className="p-4">Phone / Email</th>
                <th className="p-4">Shift Details</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-400 font-medium">
                    Loading staff directory...
                  </td>
                </tr>
              ) : staffList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-400 font-medium">
                    No staff members registered. Use the "Add Staff Member" button above.
                  </td>
                </tr>
              ) : (
                staffList.map((staff) => (
                  <tr key={staff.id} className="border-b border-slate-50 last:border-none hover:bg-slate-50/30 transition-colors text-slate-700">
                    <td className="p-4 font-semibold flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-600 flex items-center justify-center text-xs font-bold shrink-0">
                        {staff.name[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{staff.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5">STF-00{staff.id}</span>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-slate-700">
                      {staff.role}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5 text-slate-500">
                        <span className="flex items-center gap-1"><Phone size={12} /> {staff.phone || 'N/A'}</span>
                        <span className="flex items-center gap-1"><Mail size={12} /> {staff.email || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-500 flex items-center gap-1 mt-3.5">
                      <Clock size={12} className="text-slate-400" />
                      <span>{staff.shiftStart} - {staff.shiftEnd}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                        staff.status === 'ACTIVE' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                          : staff.status === 'ON_BREAK'
                            ? 'bg-amber-50 text-amber-700 border-amber-100'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {staff.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleEditClick(staff)}
                          className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                          title="Edit Details"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(staff.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                          title="Delete Staff Member"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-md border border-slate-100 animate-fade-in">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 select-none">
              <h3 className="font-bold text-slate-800 text-sm">{editMode ? 'Edit Staff Details' : 'Add Staff Member'}</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 cursor-pointer"
              >
                <Plus className="rotate-45" size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-600">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Kumar"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="h-9 w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 text-xs text-slate-700 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-600">Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98765 XXXXX"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="h-9 w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 text-xs text-slate-700 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-600">Email</label>
                  <input
                    type="email"
                    placeholder="email@domain.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="h-9 w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 text-xs text-slate-700 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-600">Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="h-9 w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 text-xs text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="DENTIST">DENTIST</option>
                    <option value="NURSE">NURSE</option>
                    <option value="RECEPTIONIST">RECEPTIONIST</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-600">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="h-9 w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 text-xs text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="ON_BREAK">ON_BREAK</option>
                    <option value="OFF_DUTY">OFF_DUTY</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-600">Shift Start</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 09:00 AM"
                    value={form.shiftStart}
                    onChange={(e) => setForm({ ...form, shiftStart: e.target.value })}
                    className="h-9 w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 text-xs text-slate-700 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-600">Shift End</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 05:00 PM"
                    value={form.shiftEnd}
                    onChange={(e) => setForm({ ...form, shiftEnd: e.target.value })}
                    className="h-9 w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 text-xs text-slate-700 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 mt-4 pt-2 border-t border-slate-100 select-none">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 h-9 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 h-9 rounded-lg bg-teal-650 hover:bg-teal-700 text-white font-bold cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
