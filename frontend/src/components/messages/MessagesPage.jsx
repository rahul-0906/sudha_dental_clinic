import { useState, useEffect, useRef } from 'react'
import { 
  Send, 
  Search, 
  MessageSquare, 
  Smartphone, 
  Mail, 
  ArrowLeft,
  ChevronRight,
  User
} from 'lucide-react'
import { useDispatch } from 'react-redux'
import { setActiveView } from '../../store/slices/appSlice'
import { getAllMessages, getMessagesByPatient, sendMessage } from '../../api/messages'
import { searchPatients } from '../../api/patients'
import toast from 'react-hot-toast'

export default function MessagesPage() {
  const dispatch = useDispatch()
  const [patients, setPatients] = useState([])
  const [messages, setMessages] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [activeTab, setActiveTab] = useState('WHATSAPP') // WHATSAPP, SMS, INTERNAL
  const [typedMessage, setTypedMessage] = useState('')
  const [searchVal, setSearchVal] = useState('')
  const [loading, setLoading] = useState(false)
  const chatBottomRef = useRef(null)

  // Load patients list for thread list
  const loadPatients = async () => {
    try {
      const res = await searchPatients('')
      setPatients(res.data || [])
      if (res.data && res.data.length > 0) {
        setSelectedPatient(res.data[0])
      }
    } catch (err) {
      console.error('Failed to load patients', err)
    }
  }

  // Load chat messages
  const loadMessages = async () => {
    setLoading(true)
    try {
      const res = await getAllMessages()
      setMessages(res.data || [])
    } catch (err) {
      console.error('Failed to load messages', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPatients()
    loadMessages()
  }, [])

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, selectedPatient])

  // Handle sending message
  const handleSend = async (e) => {
    e.preventDefault()
    if (!typedMessage.trim() || !selectedPatient) return

    const payload = {
      senderName: 'Dr. Mariyappan',
      senderRole: 'DENTIST',
      recipientPhone: selectedPatient.phone,
      messageText: typedMessage,
      status: 'SENT',
      type: activeTab
    }

    try {
      await sendMessage(payload)
      setTypedMessage('')
      toast.success('Message sent successfully!')
      loadMessages()
    } catch (err) {
      toast.error('Failed to send message')
    }
  }

  // Filter messages for selected patient
  const patientMessages = messages.filter(m => m.recipientPhone === selectedPatient?.phone)

  // Filter patients by search
  const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(searchVal.toLowerCase()))

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#F8FAFC]">
      
      {/* 1. LEFT COLUMN: Chat Directory/Threads */}
      <div className="w-[280px] border-r border-slate-200 bg-white flex flex-col overflow-hidden shrink-0 select-none">
        <div className="p-4 border-b border-slate-100 flex flex-col gap-3 shrink-0">
          <button 
            onClick={() => dispatch(setActiveView('dashboard'))} 
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-755 cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span className="text-sm font-bold text-slate-800">Messages</span>
          </button>

          <div className="relative w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input 
              type="text" 
              placeholder="Search chats..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full h-9 bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 text-xs focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
          {filteredPatients.map(p => {
            const isSelected = selectedPatient?.id === p.id
            return (
              <div 
                key={p.id}
                onClick={() => setSelectedPatient(p)}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                  isSelected ? 'bg-teal-50/70 border border-teal-100/50 text-teal-700 font-bold' : 'hover:bg-slate-50 border border-transparent text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-655 shrink-0">
                    {p.name[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs truncate">{p.name}</div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{p.phone}</div>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-400 shrink-0" />
              </div>
            )
          })}
        </div>
      </div>

      {/* 2. RIGHT COLUMN: Active Chat Panel */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        {selectedPatient ? (
          <>
            {/* Chat header */}
            <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 select-none">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-650 flex items-center justify-center font-bold text-sm">
                  {selectedPatient.name[0]}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{selectedPatient.name}</h4>
                  <span className="text-[10px] text-slate-400">{selectedPatient.phone}</span>
                </div>
              </div>

              {/* Channel switcher */}
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 gap-0.5">
                {[
                  { id: 'WHATSAPP', label: 'WhatsApp', icon: MessageSquare },
                  { id: 'SMS', label: 'SMS', icon: Smartphone },
                  { id: 'INTERNAL', label: 'Internal', icon: User }
                ].map(ch => (
                  <button
                    key={ch.id}
                    onClick={() => setActiveTab(ch.id)}
                    className={`text-[9px] font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === ch.id 
                        ? 'bg-white text-slate-800 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <ch.icon size={11} />
                    <span>{ch.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat message bubbles scroll grid */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              {loading ? (
                <div className="text-center text-slate-400 text-xs py-10 font-medium select-none">
                  Loading conversation history...
                </div>
              ) : patientMessages.length === 0 ? (
                <div className="text-center text-slate-400 text-xs py-10 font-medium select-none">
                  No message history found. Start conversation below!
                </div>
              ) : (
                patientMessages.map((msg) => {
                  const isOutgoing = msg.senderRole !== 'PATIENT'
                  return (
                    <div 
                      key={msg.id}
                      className={`flex flex-col max-w-[70%] ${isOutgoing ? 'self-end items-end' : 'self-start items-start'}`}
                    >
                      <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isOutgoing 
                          ? 'bg-teal-650 text-white rounded-tr-none' 
                          : 'bg-white text-slate-800 border border-slate-150 rounded-tl-none shadow-sm'
                      }`}>
                        {msg.messageText}
                      </div>
                      <div className="text-[9px] text-slate-400 mt-1 flex items-center gap-1.5 px-1 select-none">
                        <span>{msg.senderName}</span>
                        <span>•</span>
                        <span>{msg.type}</span>
                        <span>•</span>
                        <span>
                          {msg.sentAt ? msg.sentAt.split('T')[1]?.substring(0, 5) || '10:00' : '10:00'}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Message composer input bar */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-200 flex items-center gap-3 shrink-0">
              <input 
                type="text" 
                placeholder={`Type message to send via ${activeTab.toLowerCase()}...`}
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                className="flex-1 h-10 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
              <button 
                type="submit"
                className="w-10 h-10 rounded-xl bg-teal-650 hover:bg-teal-700 text-white flex items-center justify-center shadow transition-colors cursor-pointer"
              >
                <Send size={16} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs font-medium select-none">
            No patient chat selected. Pick a conversation from the sidebar.
          </div>
        )}
      </div>

    </div>
  )
}
