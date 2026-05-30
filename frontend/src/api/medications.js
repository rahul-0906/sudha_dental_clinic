import api from './axios'

export const searchMedications = (query) => api.get(`/medications?query=${encodeURIComponent(query)}`)
export const getAllMedications = () => api.get('/medications')
export const createMedication = (data) => api.post('/medications', data)
export const updateMedication = (id, data) => api.put(`/medications/${id}`, data)
export const getLowStockAlerts = () => api.get('/medications/low-stock')
