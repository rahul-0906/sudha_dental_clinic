import api from './axios'

export const getAppointments = (date = '', patientId = '') => {
  let url = '/appointments'
  const params = []
  if (date) params.push(`date=${encodeURIComponent(date)}`)
  if (patientId) params.push(`patientId=${encodeURIComponent(patientId)}`)
  if (params.length) url += `?${params.join('&')}`
  return api.get(url)
}

export const createAppointment = (data) => api.post('/appointments', data)
export const updateAppointmentStatus = (id, status) => api.patch(`/appointments/${id}/status`, { status })
