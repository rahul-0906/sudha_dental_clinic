import React, { useState, useEffect } from 'react';
import { CLINIC_CONFIG } from './config';
import DashboardView from './views/DashboardView';
import EMRView from './views/EMRView';
import InventoryView from './views/InventoryView';
import BillingView from './views/BillingView';
import MappingView from './views/MappingView';
import PatientHistoryView from './views/PatientHistoryView';
import NurseWorkflowView from './views/NurseWorkflowView';
import DoctorWorkflowView from './views/DoctorWorkflowView';
import SoloOmniWorkflowView from './views/SoloOmniWorkflowView';
import { WorkflowProvider, useWorkflow } from './store/WorkflowStore';
import {
  LayoutDashboard, BookOpen, Layers, CreditCard,
  Stethoscope, Users, Calendar, Settings, Activity,
  ToggleLeft, ToggleRight, UserCheck, UserX
} from 'lucide-react';
import { api } from './api';

const ROLES = [
  { id: 'ADMIN', label: 'Dr. Mariyappan', desc: 'Owner & Doctor' },
  { id: 'RECEPTIONIST', label: 'Nurse', desc: 'Reception & Billing' }
];

// ─── Workflow View Switcher ─────────────────────────────────────────────────
function WorkflowViewSwitcher({ currentRole }) {
  const { isNurseAvailable } = useWorkflow();
  if (!isNurseAvailable) return <SoloOmniWorkflowView />;
  if (currentRole === 'ADMIN') return <DoctorWorkflowView />;
  return <NurseWorkflowView />;
}

// ─── Main App Content ───────────────────────────────────────────────────────
function AppContent() {
  // Default to 'workflow' so daily use starts immediately on the queue
  const [activeTab, setActiveTab] = useState('workflow');
  const [currentRole, setCurrentRole] = useState(() => {
    const defaultUser = '{"username":"admin", "role":"ADMIN"}';
    const current = JSON.parse(sessionStorage.getItem('currentUser') || defaultUser);
    return current.role || 'ADMIN';
  });
  const [patients, setPatients] = useState([]);
  const [isApptModalOpen, setIsApptModalOpen] = useState(false);
  const [apptForm, setApptForm] = useState({
    patientId: '',
    dentistId: '2',
    appointmentTime: '',
    chiefComplaint: ''
  });

  const { isNurseAvailable, toggleNurseMode, patientQueue } = useWorkflow();

  // Counts for sidebar badges
  const waitingCount = patientQueue.filter(v => v.status === 'WAITING').length;

  const handleRoleChange = (role) => {
    setCurrentRole(role);
    const username = role === 'ADMIN' ? 'admin' : 'receptionist';
    sessionStorage.setItem('currentUser', JSON.stringify({ username, role }));
  };

  useEffect(() => {
    const defaultUser = '{"username":"admin", "role":"ADMIN"}';
    if (!sessionStorage.getItem('currentUser')) {
      sessionStorage.setItem('currentUser', defaultUser);
    }
  }, []);

  const loadPatients = async () => {
    try {
      const data = await api.patients.list();
      setPatients(data);
      if (data.length > 0) {
        setApptForm(prev => ({ ...prev, patientId: data[0].id.toString() }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      await api.appointments.create({
        patientId: parseInt(apptForm.patientId),
        dentistId: parseInt(apptForm.dentistId),
        appointmentTime: apptForm.appointmentTime,
        chiefComplaint: apptForm.chiefComplaint
      });
      setIsApptModalOpen(false);
      setApptForm({ patientId: patients[0]?.id.toString() || '', dentistId: '2', appointmentTime: '', chiefComplaint: '' });
      setActiveTab('workflow');
    } catch (error) {
      alert('Failed to book appointment: ' + error.message);
    }
  };

  // Nav items — filtered by role
  // In Nurse mode the Nurse sees a focused set; in Solo mode the doctor sees everything
  const allNavItems = [
    { id: 'workflow', label: isNurseAvailable ? "Today's Queue" : 'Solo Dashboard', icon: Activity, roles: ['ADMIN', 'RECEPTIONIST'], badge: waitingCount > 0 ? waitingCount : null },
    { id: 'history', label: 'Patient Files', icon: Users, roles: ['ADMIN', 'RECEPTIONIST'] },
    { id: 'emr', label: 'Dentist EMR', icon: BookOpen, roles: ['ADMIN'] },
    { id: 'inventory', label: 'Inventory', icon: Layers, roles: ['ADMIN', 'RECEPTIONIST'] },
    { id: 'billing', label: 'Cash Flow', icon: CreditCard, roles: ['ADMIN', 'RECEPTIONIST'] },
    { id: 'dashboard', label: 'Reports', icon: LayoutDashboard, roles: ['ADMIN'] },
    { id: 'mappings', label: 'Procedure Mappings', icon: Settings, roles: ['ADMIN'] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(currentRole));

  return (
    // KEY FIX: h-screen + overflow-hidden on outer wrapper keeps sidebar fixed
    <div className="flex h-screen overflow-hidden bg-slate-100">

      {/* ── Fixed Sidebar ─────────────────────────────────────────────────── */}
      <aside className="w-60 flex-shrink-0 bg-slate-900 text-slate-300 flex flex-col h-screen">

        {/* Clinic Branding */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center space-x-3 flex-shrink-0">
          <div className="p-2 rounded-lg bg-primary-600 text-white shadow-md flex-shrink-0">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-white text-sm tracking-tight truncate leading-tight">
              {CLINIC_CONFIG.name}
            </h2>
            <span className="text-[10px] text-primary-400 font-semibold tracking-wider uppercase">
              Dental Management
            </span>
          </div>
        </div>

        {/* ── Nurse / Solo Mode Toggle (global — always visible in sidebar) ── */}
        <div className="px-4 py-3 border-b border-slate-800 flex-shrink-0">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">Clinic Mode</p>
          <button
            onClick={toggleNurseMode}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-bold transition-all duration-200 ${
              isNurseAvailable
                ? 'bg-emerald-900/40 border-emerald-700/50 text-emerald-300 hover:bg-emerald-900/60'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              {isNurseAvailable
                ? <UserCheck className="w-4 h-4 text-emerald-400" />
                : <UserX className="w-4 h-4 text-slate-400" />
              }
              <span>{isNurseAvailable ? 'Nurse Available' : 'Solo Doctor'}</span>
            </div>
            {isNurseAvailable
              ? <ToggleRight className="w-5 h-5 text-emerald-400" />
              : <ToggleLeft className="w-5 h-5 text-slate-500" />
            }
          </button>
          <p className="text-[10px] text-slate-600 mt-1.5 px-1">
            {isNurseAvailable
              ? 'Nurse handles queue & billing'
              : 'Doctor handles everything alone'
            }
          </p>
        </div>

        {/* Nav Links — scrollable if overflow */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all text-sm font-semibold ${
                activeTab === item.id
                  ? 'bg-primary-700 text-white shadow-md'
                  : 'hover:bg-slate-800 hover:text-slate-100 text-slate-400'
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge != null && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === item.id
                    ? 'bg-white/20 text-white'
                    : 'bg-amber-500 text-white'
                }`}>
                  {item.badge}
                </span>
              )}
              {item.id === 'workflow' && item.badge == null && (
                <span className="text-[9px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">
                  LIVE
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="flex-shrink-0 p-4 border-t border-slate-800 space-y-2">
          {/* Staff indicator */}
          <div className="flex items-center space-x-2 bg-slate-800 rounded-lg px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">
                {ROLES.find(r => r.id === currentRole)?.label[0] || 'A'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {ROLES.find(r => r.id === currentRole)?.label}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {ROLES.find(r => r.id === currentRole)?.desc}
              </p>
            </div>
          </div>

          {/* Dev-only account switcher */}
          {import.meta.env.MODE === 'development' && (
            <select
              value={currentRole}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-medium text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              {ROLES.map(role => (
                <option key={role.id} value={role.id}>{role.label} ({role.desc})</option>
              ))}
            </select>
          )}

          <div className="text-[10px] text-slate-600 px-1 space-y-0.5">
            <p className="truncate">{CLINIC_CONFIG.phone}</p>
          </div>
        </div>
      </aside>

      {/* ── Main Panel ────────────────────────────────────────────────────── */}
      {/* KEY FIX: flex-1 + flex-col + overflow-hidden so inner content scrolls independently */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Header — slim, always fixed at top */}
        <header className="flex-shrink-0 h-13 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm" style={{ minHeight: '52px' }}>
          {/* Page title */}
          <div className="flex items-center space-x-3">
            <h1 className="text-sm font-bold text-slate-700">
              {navItems.find(n => n.id === activeTab)?.label || 'Dashboard'}
            </h1>
            {activeTab === 'workflow' && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isNurseAvailable
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {isNurseAvailable ? '👥 Nurse Mode' : '🩺 Solo Mode'}
              </span>
            )}
          </div>

          {/* Quick actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => { loadPatients(); setIsApptModalOpen(true); }}
              className="flex items-center space-x-1.5 bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>+ Book Visit</span>
            </button>
          </div>
        </header>

        {/* Scrollable Content Area — only this scrolls, sidebar stays fixed */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          {activeTab === 'workflow' && <WorkflowViewSwitcher currentRole={currentRole} />}
          {activeTab === 'history' && <PatientHistoryView />}
          {activeTab === 'emr' && currentRole === 'ADMIN' && <EMRView userRole={currentRole} />}
          {activeTab === 'inventory' && <InventoryView userRole={currentRole} />}
          {activeTab === 'billing' && <BillingView userRole={currentRole} />}
          {activeTab === 'dashboard' && <DashboardView userRole={currentRole} />}
          {activeTab === 'mappings' && currentRole === 'ADMIN' && <MappingView />}
        </main>
      </div>

      {/* ── Book Appointment Modal ─────────────────────────────────────────── */}
      {isApptModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
            <div className="bg-primary-700 text-white px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold">Book Patient Visit</h3>
                <p className="text-xs text-primary-200 mt-0.5">Add to today's queue</p>
              </div>
              <button
                onClick={() => setIsApptModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white transition"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleBookAppointment} className="p-5 space-y-4">
              {patients.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-sm">
                  No patients registered yet. Add a patient from the Patient Files section first.
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Patient</label>
                    <select
                      value={apptForm.patientId}
                      onChange={(e) => setApptForm({ ...apptForm, patientId: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-400"
                    >
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.name} — {p.phone}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Assign Dentist</label>
                    <select
                      value={apptForm.dentistId}
                      onChange={(e) => setApptForm({ ...apptForm, dentistId: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-400"
                    >
                      <option value="2">Dr. Suraj (Additional Doctor)</option>
                      <option value="1">Dr. Mariyappan (Owner & Doctor)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={apptForm.appointmentTime}
                      onChange={(e) => setApptForm({ ...apptForm, appointmentTime: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Chief Complaint</label>
                    <input
                      type="text"
                      placeholder="e.g. toothache, cleaning, follow-up…"
                      value={apptForm.chiefComplaint}
                      onChange={(e) => setApptForm({ ...apptForm, chiefComplaint: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-400"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsApptModalOpen(false)}
                      className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition text-sm font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-xl transition text-sm font-semibold shadow-md"
                    >
                      Book Visit
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Root — WorkflowProvider wraps the entire app ──────────────────────────
export default function App() {
  return (
    <WorkflowProvider>
      <AppContent />
    </WorkflowProvider>
  );
}
