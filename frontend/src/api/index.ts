import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 Sekunden Timeout
})

// Request interceptor für Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  console.error('Request error:', error)
  return Promise.reject(error)
})

// Response interceptor für Fehlerbehandlung
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API Error:', error.config?.url, error.response?.status, error.response?.data)
    
    if (error.response?.status === 401) {
      console.log('Unauthorized - redirecting to login')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    
    return Promise.reject(error)
  }
)

export { api }
export { authApi } from './auth'

// Gäste API
export const guestsApi = {
  getAll: (search?: string) => 
    api.get(`/guests${search ? `?search=${search}` : ''}`).then(res => res.data),
  
  getActive: () => 
    api.get('/guests/active').then(res => res.data),
  
  getById: (id: string) => 
    api.get(`/guests/${id}`).then(res => res.data),
  
  getByRegistrationNumber: (registrationNumber: string) => 
    api.get(`/guests/registration/${registrationNumber}`).then(res => res.data),
  
  create: (data: any) => 
    api.post('/guests', data).then(res => res.data),
  
  update: (id: string, data: any) => 
    api.patch(`/guests/${id}`, data).then(res => res.data),
  
  regenerateRegistrationNumber: (id: string) => 
    api.patch(`/guests/${id}/regenerate-registration`).then(res => res.data),
  
  delete: (id: string) => 
    api.delete(`/guests/${id}`).then(res => res.data),
}

// Buchungen API
export const bookingsApi = {
  getAll: () => 
    api.get('/bookings').then(res => res.data),
  
  getUpcoming: () => 
    api.get('/bookings/upcoming').then(res => res.data),
  
  getDashboardStats: () => 
    api.get('/bookings/dashboard-stats').then(res => res.data),
  
  getById: (id: string) => 
    api.get(`/bookings/${id}`).then(res => res.data),
  
  create: (data: any) => 
    api.post('/bookings', data).then(res => res.data),
  
  update: (id: string, data: any) => 
    api.patch(`/bookings/${id}`, data).then(res => res.data),
  
  delete: (id: string) => 
    api.delete(`/bookings/${id}`).then(res => res.data),
}

// Leistungen API
export const servicesApi = {
  getAll: () => 
    api.get('/services').then(res => res.data),
  
  getActive: () => 
    api.get('/services/active').then(res => res.data),
  
  getById: (id: string) => 
    api.get(`/services/${id}`).then(res => res.data),
  
  create: (data: any) => 
    api.post('/services', data).then(res => res.data),
  
  update: (id: string, data: any) => 
    api.patch(`/services/${id}`, data).then(res => res.data),
  
  delete: (id: string) => 
    api.delete(`/services/${id}`).then(res => res.data),
}

// Einstellungen API
export const settingsApi = {
  get: () => 
    api.get('/settings').then(res => res.data),
  
  update: (data: any) => 
    api.put('/settings', data).then(res => res.data),
  
  getCompanyInfo: () => 
    api.get('/settings/company-info').then(res => res.data),
  
  uploadLogo: (file: File) => {
    const formData = new FormData()
    formData.append('logo', file)
    return api.post('/settings/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data)
  },
  
  deleteLogo: () => 
    api.delete('/settings/logo').then(res => res.data),
} 