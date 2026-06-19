import api from './axios'

export const getAllMessages = () => api.get('/messages')
export const getMessagesByPatient = (phone) => api.get(`/messages/patient/${encodeURIComponent(phone)}`)
export const sendMessage = (data) => api.post('/messages', data)
