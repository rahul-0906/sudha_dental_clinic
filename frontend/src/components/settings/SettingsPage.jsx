import { useState, useEffect } from 'react'
import { 
  Settings, 
  Save, 
  Lock, 
  MessageSquare, 
  Building2, 
  ArrowLeft 
} from 'lucide-react'
import { useDispatch } from 'react-redux'
import { setActiveView } from '../../store/slices/appSlice'
import { getSettings, updateSettings } from '../../api/settings'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    clinicName: '',
    phone: '',
    address: '',
    dailyPin: '',
    whatsappAccessToken: '',
    whatsappPhoneId: ''
  })

  // Load settings on mount
  const loadSettings = async () => {
    setLoading(true)
    try {
      const res = await getSettings()
      setSettings(res.data)
    } catch (err) {
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  // Handle updates
  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await updateSettings(settings)
      setSettings(res.data)
      toast.success('Settings saved successfully!')
    } catch (err) {
      toast.error('Failed to update settings')
    } finally {
      setSaving(false)
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
          <span className="text-sm font-bold text-slate-800">Clinic Configuration Settings</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 text-xs font-medium">
          Loading clinical configurations...
        </div>
      ) : (
        <form onSubmit={handleSave} className="max-w-3xl flex flex-col gap-6 text-xs text-slate-700">
          
          {/* Card 1: Clinic Profile */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
              <Building2 size={16} className="text-teal-600" />
              <h3 className="font-bold text-slate-800 text-sm">Clinic Details Profile</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-600">Clinic Name</label>
                <input
                  type="text"
                  required
                  value={settings.clinicName || ''}
                  onChange={(e) => setSettings({ ...settings, clinicName: e.target.value })}
                  className="h-9 w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 text-xs text-slate-700 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-600">Clinic Contact Phone</label>
                <input
                  type="text"
                  required
                  value={settings.phone || ''}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="h-9 w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 text-xs text-slate-700 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="font-bold text-slate-600">Clinic Address</label>
                <textarea
                  required
                  rows={2}
                  value={settings.address || ''}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Security settings */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
              <Lock size={16} className="text-teal-650" />
              <h3 className="font-bold text-slate-800 text-sm">Security & Access Authentication</h3>
            </div>

            <div className="flex flex-col gap-1.5 max-w-xs">
              <label className="font-bold text-slate-600">Daily Login PIN</label>
              <input
                type="text"
                required
                maxLength={6}
                value={settings.dailyPin || ''}
                onChange={(e) => setSettings({ ...settings, dailyPin: e.target.value })}
                className="h-9 w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 text-xs text-slate-700 focus:outline-none font-mono tracking-widest text-center"
              />
              <span className="text-[10px] text-slate-400 mt-0.5">Enter a numeric PIN (e.g. 1234) used to authorize terminal logins daily.</span>
            </div>
          </div>

          {/* Card 3: Messaging API integrations */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
              <MessageSquare size={16} className="text-teal-600" />
              <h3 className="font-bold text-slate-800 text-sm">Meta WhatsApp Cloud API Configurations</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-600">WhatsApp Phone Number ID</label>
                <input
                  type="text"
                  placeholder="e.g. 109848574..."
                  value={settings.whatsappPhoneId || ''}
                  onChange={(e) => setSettings({ ...settings, whatsappPhoneId: e.target.value })}
                  className="h-9 w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 text-xs text-slate-700 focus:outline-none font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-600">WhatsApp Access Token</label>
                <input
                  type="password"
                  placeholder="EAAGxxxxxxxxxxxxxxxx"
                  value={settings.whatsappAccessToken || ''}
                  onChange={(e) => setSettings({ ...settings, whatsappAccessToken: e.target.value })}
                  className="h-9 w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 text-xs text-slate-700 focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Form Actions footer */}
          <div className="flex justify-end gap-2.5">
            <button
              type="button"
              onClick={loadSettings}
              className="px-4 h-9 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold cursor-pointer"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 h-9 rounded-lg bg-teal-650 hover:bg-teal-700 text-white font-bold cursor-pointer flex items-center gap-1.5"
            >
              <Save size={14} />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>

        </form>
      )}

    </div>
  )
}
