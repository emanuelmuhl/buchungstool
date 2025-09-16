import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Edit2, Trash2, Shield, Eye, User as UserIcon, Calendar } from 'lucide-react';
import { usersApi } from '../api/users';
import { User, CreateUserDto, UpdateUserDto, UserRole } from '../types/user';
import { usePermissions } from '../hooks/usePermissions';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface UserFormData {
  username: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  email: string;
}

const initialFormData: UserFormData = {
  username: '',
  password: '',
  role: UserRole.VIEWER,
  firstName: '',
  lastName: '',
  email: '',
};

export default function UserManagement() {
  const { canManageUsers } = usePermissions();
  const queryClient = useQueryClient();
  
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [showPassword, setShowPassword] = useState(true);

  // Query für alle Benutzer
  const { data: users = [], isLoading, error } = useQuery<User[]>(
    'users',
    usersApi.getAll,
    {
      enabled: canManageUsers(),
      retry: 3,
      retryDelay: 1000,
      onError: (error: any) => {
        console.error('Fehler beim Laden der Benutzer:', error);
      },
    }
  );

  // Mutation für Benutzer erstellen
  const createUserMutation = useMutation(usersApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('users');
      setShowForm(false);
      setFormData(initialFormData);
      setShowPassword(true);
    },
    onError: (error: any) => {
      console.error('Fehler beim Erstellen des Benutzers:', error);
      alert(`Fehler: ${error.response?.data?.message || 'Benutzer konnte nicht erstellt werden'}`);
    },
  });

  // Mutation für Benutzer aktualisieren
  const updateUserMutation = useMutation(
    ({ id, data }: { id: string; data: UpdateUserDto }) => usersApi.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        setEditingUser(null);
        setShowForm(false);
        setFormData(initialFormData);
        setShowPassword(true);
      },
    }
  );

  // Mutation für Benutzer löschen
  const deleteUserMutation = useMutation(usersApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('users');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      const updateData: UpdateUserDto = {
        username: formData.username,
        role: formData.role,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        email: formData.email || undefined,
      };
      
      if (formData.password) {
        updateData.newPassword = formData.password;
      }

      updateUserMutation.mutate({ id: editingUser.id, data: updateData });
    } else {
      const createData: CreateUserDto = {
        username: formData.username,
        password: formData.password,
        role: formData.role,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        email: formData.email || undefined,
      };

      createUserMutation.mutate(createData);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      role: user.role,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
    });
    setShowPassword(false);
    setShowForm(true);
  };

  const handleDelete = (user: User) => {
    if (window.confirm(`Benutzer "${user.username}" wirklich löschen?`)) {
      deleteUserMutation.mutate(user.id);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormData(initialFormData);
    setShowPassword(true);
  };

  if (!canManageUsers()) {
    return (
      <div className="text-center py-8">
        <Shield className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Berechtigung</h3>
        <p className="mt-1 text-sm text-gray-500">
          Sie haben keine Berechtigung zur Benutzerverwaltung.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">Lade Benutzer...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">⚠️ Fehler beim Laden der Benutzer</div>
        <p className="text-sm text-gray-600">
          Möglicherweise sind die Benutzer-Tabellen noch nicht erstellt. 
          Bitte warten Sie einen Moment und laden Sie die Seite neu.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 btn btn-primary"
        >
          Seite neu laden
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Benutzerverwaltung</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Neuer Benutzer
          </button>
        )}
      </div>

      {/* Benutzer-Formular */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingUser ? 'Benutzer bearbeiten' : 'Neuer Benutzer'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Benutzername */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Benutzername *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="input"
                  required
                />
              </div>

              {/* Rolle */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Rolle *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="input"
                >
                  <option value={UserRole.VIEWER}>Betrachter</option>
                  <option value={UserRole.ADMIN}>Administrator</option>
                </select>
              </div>

              {/* Passwort */}
              {(showPassword || editingUser) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {editingUser ? 'Neues Passwort (optional)' : 'Passwort *'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input"
                    required={!editingUser}
                    minLength={6}
                  />
                </div>
              )}

              {/* Vorname */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Vorname
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="input"
                />
              </div>

              {/* Nachname */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nachname
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="input"
                />
              </div>

              {/* E-Mail */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  E-Mail
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-secondary"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={createUserMutation.isLoading || updateUserMutation.isLoading}
                className="btn btn-primary"
              >
                {editingUser ? 'Aktualisieren' : 'Erstellen'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Benutzer-Liste */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Benutzer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rolle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Letzter Login
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-gray-500" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}`
                            : user.username
                          }
                        </div>
                        <div className="text-sm text-gray-500">
                          @{user.username}
                          {user.email && ` • ${user.email}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === UserRole.ADMIN
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role === UserRole.ADMIN ? (
                        <>
                          <Shield className="h-3 w-3 mr-1" />
                          Administrator
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3 mr-1" />
                          Betrachter
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin ? (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(new Date(user.lastLogin), 'dd.MM.yyyy HH:mm', { locale: de })}
                      </div>
                    ) : (
                      'Noch nie'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Bearbeiten"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="text-red-600 hover:text-red-900"
                        title="Löschen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
