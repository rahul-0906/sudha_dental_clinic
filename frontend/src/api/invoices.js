import api from './axios'

export const getAllInvoices = () => api.get('/invoices')
export const getInvoicesByPatient = (patientId) => api.get(`/invoices/patient/${patientId}`)
export const createInvoice = (data) => api.post('/invoices', data)
