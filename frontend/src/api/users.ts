import axios from 'axios';
import { User, CreateUserDto, UpdateUserDto } from '../types/user';
import { getApiUrl } from '../utils/api';

const api = axios.create({
  baseURL: getApiUrl(),
});

// Request interceptor für JWT Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const usersApi = {
  // Alle Benutzer abrufen (nur Admin)
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  // Eigenes Profil abrufen
  getProfile: async (): Promise<User> => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Benutzer nach ID abrufen (nur Admin)
  getById: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Neuen Benutzer erstellen (nur Admin)
  create: async (userData: CreateUserDto): Promise<User> => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Benutzer aktualisieren (nur Admin)
  update: async (id: string, userData: UpdateUserDto): Promise<User> => {
    const response = await api.patch(`/users/${id}`, userData);
    return response.data;
  },

  // Eigenes Profil aktualisieren
  updateProfile: async (userData: UpdateUserDto): Promise<User> => {
    const response = await api.patch('/users/profile/update', userData);
    return response.data;
  },

  // Benutzer löschen (nur Admin)
  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};
