import { apiCall } from '../utils/api';
import { User, CreateUserDto, UpdateUserDto } from '../types/user';

export const usersApi = {
  // Alle Benutzer abrufen (nur Admin)
  getAll: async (): Promise<User[]> => {
    const response = await apiCall('/users');
    return response.json();
  },

  // Eigenes Profil abrufen
  getProfile: async (): Promise<User> => {
    const response = await apiCall('/users/profile');
    return response.json();
  },

  // Benutzer nach ID abrufen (nur Admin)
  getById: async (id: string): Promise<User> => {
    const response = await apiCall(`/users/${id}`);
    return response.json();
  },

  // Neuen Benutzer erstellen (nur Admin)
  create: async (userData: CreateUserDto): Promise<User> => {
    const response = await apiCall('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  // Benutzer aktualisieren (nur Admin)
  update: async (id: string, userData: UpdateUserDto): Promise<User> => {
    const response = await apiCall(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  // Eigenes Profil aktualisieren
  updateProfile: async (userData: UpdateUserDto): Promise<User> => {
    const response = await apiCall('/users/profile/update', {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  // Benutzer löschen (nur Admin)
  delete: async (id: string): Promise<void> => {
    await apiCall(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};
