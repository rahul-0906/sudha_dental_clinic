import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { UserPlus, Calendar, AlertTriangle, IndianRupee, MessageSquare, Check, RefreshCw } from 'lucide-react';

export default function DashboardView({ userRole }) {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [summary, setSummary] = useState({ totalInflow: 0, totalOutflow: 0 });
  const [lowStockCount, setLowStockCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    phone: '',
    email: '',
    age: '',
    gender: 'Male',
    medicalHistory: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const todayApps = await api.appointments.today();
      setAppointments(todayApps);
      
      const patList = await api.patients.list();
      setPatients(patList);

      const sum = await api.billing.summary();
      setSummary(sum);

      const alerts = await api.inventory.alerts();
      setLowStockCount(alerts.length);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    try {
      await api.patients.create({
        ...newPatient,
        age: parseInt(newPatient.age) || 0
      });
      setIsModalOpen(false);
      setNewPatient({
        name: '',
        phone: '',
        email: '',
        age: '',
        gender: 'Male',
        medicalHistory: ''
      });
      fetchData();
    } catch (error) {
      alert("Failed to register patient: " + error.message);
    }
  };

  const handleSendReminder = async (id) => {
    try {
      await api.appointments.sendReminder(id);
      alert("WhatsApp reminder template sent successfully!");
      fetchData();
    } catch (error) {
      alert("Failed to send WhatsApp reminder: " + error.message);
    }
  };

  const handleCompleteAppointment = async (id) => {
    try {
      await api.appointments.updateStatus(id, 'COMPLETED');
      fetchData();
    } catch (error) {
      alert("Failed to complete appointment: " + error.message);
    }
  };

  // Roles access check
  const isReceptionistOrAdmin = userRole === 'ADMIN' || userRole === 'RECEPTIONIST';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Clinic Dashboard</h1>
          <p className="text-sm text-slate-500">Welcome to your daily management overview.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={fetchData}
            className="p-2 bg-white text-slate-600 rounded-lg hover:bg-slate-50 transition border border-slate-200"
            title="Refresh Data"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {isReceptionistOrAdmin && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 bg-primary-700 text-white px-4 py-2 rounded-lg hover:bg-primary-800 transition shadow-md"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Patient</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-teal-50 text-teal-700 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Today's Visits</p>
            <p className="text-2xl font-bold text-slate-800">{appointments.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Patients</p>
            <p className="text-2xl font-bold text-slate-800">{patients.length}</p>
          </div>
        </div>

        <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4 ${lowStockCount > 0 ? 'ring-1 ring-red-100' : ''}`}>
          <div className={`p-3 rounded-xl ${lowStockCount > 0 ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-700'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Low Stock Alerts</p>
            <p className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-red-600' : 'text-slate-800'}`}>{lowStockCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Cash Inflow</p>
            <p className="text-2xl font-bold text-slate-800">₹{summary.totalInflow}</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Appointments */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800">Today's Appointment Log</h2>
          <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2.5 py-1 rounded-full">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>

        {appointments.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-medium">No appointments scheduled for today.</p>
            <p className="text-sm mt-1">Book a new appointment through patients record panel.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 text-xs font-semibold uppercase bg-slate-50/50">
                  <th className="px-6 py-3.5">Time</th>
                  <th className="px-6 py-3.5">Patient</th>
                  <th className="px-6 py-3.5">Assigned Dentist</th>
                  <th className="px-6 py-3.5">Chief Complaint</th>
                  <th className="px-6 py-3.5">WhatsApp Notification</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                {appointments.map((app) => {
                  const appTime = new Date(app.appointmentTime).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  return (
                    <tr key={app.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-semibold text-slate-600">{appTime}</td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-slate-800">{app.patient.name}</div>
                          <div className="text-xs text-slate-500">{app.patient.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-600">{app.dentist.fullName}</td>
                      <td className="px-6 py-4 italic text-slate-500">"{app.chiefComplaint || 'No details'}"</td>
                      <td className="px-6 py-4">
                        {app.whatsappReminderSent ? (
                          <span className="inline-flex items-center space-x-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full text-xs font-semibold">
                            <Check className="w-3.5 h-3.5" />
                            <span>Sent</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-amber-600 bg-amber-50 px-2 py-1 rounded-full text-xs font-semibold">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          app.status === 'COMPLETED' ? 'bg-slate-100 text-slate-600' :
                          app.status === 'CONFIRMED' ? 'bg-primary-50 text-primary-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {/* WhatsApp dispatch only for Receptionist/Admin */}
                        {isReceptionistOrAdmin && !app.whatsappReminderSent && (
                          <button
                            onClick={() => handleSendReminder(app.id)}
                            className="inline-flex items-center p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition"
                            title="Send WhatsApp Reminder"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        )}
                        {/* Status updates */}
                        {app.status !== 'COMPLETED' && (userRole === 'DENTIST' || userRole === 'ADMIN') && (
                          <button
                            onClick={() => handleCompleteAppointment(app.id)}
                            className="inline-flex items-center p-1.5 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition"
                            title="Mark Completed"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Patient Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 transform transition-all">
            <div className="bg-primary-700 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold">Register New Patient</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white text-2xl font-semibold"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleRegisterPatient} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={newPatient.email}
                    onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Age</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 30"
                    value={newPatient.age}
                    onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Gender</label>
                  <select
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Medical History / Allergies</label>
                <textarea
                  rows="3"
                  placeholder="Enter systemic conditions (Diabetes, Hypertension) or allergies..."
                  value={newPatient.medicalHistory}
                  onChange={(e) => setNewPatient({ ...newPatient, medicalHistory: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-lg transition text-sm font-semibold shadow-md"
                >
                  Onboard Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
