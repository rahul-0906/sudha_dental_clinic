import api from './axios'

export const getLatestVitals = () => api.get('/vitals')
export const getVitalsByPatient = (patientId) => api.get(`/vitals/patient/${patientId}`)
export const recordVitals = (data) => api.post('/vitals', data)
