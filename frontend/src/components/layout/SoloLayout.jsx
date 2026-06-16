import { useSelector } from 'react-redux'
import CheckoutPanel from '../checkout/CheckoutPanel'
import ConsultationForm from '../consultation/ConsultationForm'
import VisitHistory from '../patient/VisitHistory'
import XrayManager from '../xray/XrayManager'
import { ToothLogo } from './AppShell'
import { Phone, Calendar } from 'lucide-react'

export default function SoloLayout() {
  const selectedPatient = useSelector((state) => state.patient.selectedPatient)
  const queue = useSelector((state) => state.queue.queue)

  const checkoutPatients = queue.filter(v => v.status === 'CHECKOUT')

  if (!selectedPatient) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full text-center p-6">
        <div className="text-teal-600 mb-4">
          <ToothLogo size={48} />
        </div>
        <h2 className="text-slate-700 font-semibold text-xl mb-2">
          Select a Patient to Begin
        </h2>
        <p className="text-slate-500 text-sm">
          Search for a patient or select one from the queue
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Patient Header */}
      <div className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, fontWeight: 700, color: 'white', flexShrink: 0,
        }}>
          {selectedPatient.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
            {selectedPatient.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Phone size={12} />
              <span>{selectedPatient.phone}</span>
            </span>
            {selectedPatient.dob && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={12} />
                <span>{selectedPatient.dob}</span>
              </span>
            )}
            {selectedPatient.gender && <span>· {selectedPatient.gender}</span>}
          </div>
        </div>
      </div>

      {/* Checkout if pending */}
      {checkoutPatients.some(v => v.patient?.id === selectedPatient.id) && (
        <CheckoutPanel visit={checkoutPatients.find(v => v.patient?.id === selectedPatient.id)} />
      )}

      {/* Consultation Form */}
      <ConsultationForm />

      {/* X-ray Manager */}
      <XrayManager patientId={selectedPatient.id} />

      {/* Visit History */}
      <VisitHistory patientId={selectedPatient.id} />
    </div>
  )
}
