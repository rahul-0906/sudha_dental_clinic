import api from './axios'

export const addToQueue = (patientId) => api.post('/visits', { patientId })
export const getTodayQueue = () => api.get('/visits/queue/today')
export const updateVisitStatus = (id, status) => api.patch(`/visits/${id}/status`, { status })
export const checkoutVisit = (data) => api.put(`/visits/${data.visitId}/checkout`, data)
export const getVisit = (id) => api.get(`/visits/${id}`)
