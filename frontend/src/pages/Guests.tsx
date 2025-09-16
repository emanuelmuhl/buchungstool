import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  User,
  MapPin,
  Calendar,
  Flag
} from 'lucide-react'
import { guestsApi } from '../api'
import { validateGuestData, sanitizeGuestData, GuestFormData } from '../utils/guestValidation'

interface Guest {
  id: string
  firstName: string
  lastName: string
  registrationNumber?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  birthDate?: string
  nationality?: string
  type: 'adult' | 'child'
  notes?: string
  isActive: boolean
}

export default function Guests() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)
  
  const queryClient = useQueryClient()

  const { data: guests, isLoading } = useQuery(
    ['guests', searchTerm],
    () => guestsApi.getAll(searchTerm)
  )

  const createMutation = useMutation(guestsApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('guests')
      setShowForm(false)
      setEditingGuest(null)
    },
    onError: (error) => {
      console.error('Fehler beim Erstellen des Gasts:', error)
      alert('Fehler beim Erstellen des Gasts. Bitte versuchen Sie es erneut.')
    }
  })

  const updateMutation = useMutation(
    (data: { id: string; guest: Partial<Guest> }) => 
      guestsApi.update(data.id, data.guest),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('guests')
        setEditingGuest(null)
        setShowForm(false)
      },
      onError: (error) => {
        console.error('Fehler beim Aktualisieren des Gasts:', error)
        alert('Fehler beim Aktualisieren des Gasts. Bitte versuchen Sie es erneut.')
      }
    }
  )

  const deleteMutation = useMutation(guestsApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('guests')
    },
    onError: (error) => {
      console.error('Fehler beim Löschen des Gasts:', error)
      alert('Fehler beim Löschen des Gasts. Bitte versuchen Sie es erneut.')
    }
  })

  const regenerateRegistrationMutation = useMutation(guestsApi.regenerateRegistrationNumber, {
    onSuccess: () => {
      queryClient.invalidateQueries('guests')
      alert('Neue Meldescheinnummer wurde erfolgreich generiert!')
    },
    onError: (error) => {
      console.error('Fehler beim Neugenerieren der Meldescheinnummer:', error)
      alert('Fehler beim Neugenerieren der Meldescheinnummer. Bitte versuchen Sie es erneut.')
    }
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const guestData: GuestFormData = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      postalCode: formData.get('postalCode') as string,
      country: formData.get('country') as string,
      birthDate: formData.get('birthDate') as string,
      nationality: formData.get('nationality') as string,
      type: formData.get('type') as 'adult' | 'child',
      notes: formData.get('notes') as string,
    }

    // Validierung
    const validation = validateGuestData(guestData)
    if (!validation.isValid) {
      alert(`Bitte korrigieren Sie folgende Fehler:\n${validation.errors.join('\n')}`)
      return
    }

    // Daten bereinigen
    const sanitizedData = sanitizeGuestData(guestData)
    console.log('Sending guest data:', sanitizedData)

    if (editingGuest) {
      updateMutation.mutate({ id: editingGuest.id, guest: sanitizedData })
    } else {
      createMutation.mutate(sanitizedData)
    }
  }

  const handleEdit = (guest: Guest) => {
    setEditingGuest(guest)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Möchten Sie diesen Gast wirklich löschen?')) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gäste</h1>
          <p className="text-gray-600">Verwaltung der Gäste</p>
        </div>
        <button
          onClick={() => {
            setEditingGuest(null)
            setShowForm(true)
          }}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Neuer Gast
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Gäste nach Name oder Meldescheinnummer suchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Guest Form */}
      {showForm && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingGuest ? 'Gast bearbeiten' : 'Neuer Gast'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {(createMutation.isLoading || updateMutation.isLoading) && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-sm text-blue-800">
                    {createMutation.isLoading ? 'Gast wird erstellt...' : 'Gast wird aktualisiert...'}
                  </span>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vorname *
                </label>
                <input
                  name="firstName"
                  type="text"
                  defaultValue={editingGuest?.firstName}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nachname *
                </label>
                <input
                  name="lastName"
                  type="text"
                  defaultValue={editingGuest?.lastName}
                  className="input"
                  required
                />
              </div>
            </div>

            {editingGuest?.registrationNumber && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meldescheinnummer
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    name="registrationNumber"
                    type="text"
                    defaultValue={editingGuest.registrationNumber}
                    className="input bg-gray-50"
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Möchten Sie eine neue Meldescheinnummer generieren?')) {
                        regenerateRegistrationMutation.mutate(editingGuest.id)
                      }
                    }}
                    disabled={regenerateRegistrationMutation.isLoading}
                    className="btn btn-secondary text-sm"
                  >
                    {regenerateRegistrationMutation.isLoading ? 'Generiere...' : 'Neu generieren'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Automatisch generiert beim Erstellen. Kann nur manuell geändert werden.
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse
              </label>
              <input
                name="address"
                type="text"
                defaultValue={editingGuest?.address}
                className="input"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stadt
                </label>
                <input
                  name="city"
                  type="text"
                  defaultValue={editingGuest?.city}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PLZ
                </label>
                <input
                  name="postalCode"
                  type="text"
                  defaultValue={editingGuest?.postalCode}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Land
                </label>
                <input
                  name="country"
                  type="text"
                  defaultValue={editingGuest?.country}
                  className="input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Geburtsdatum
                </label>
                <input
                  name="birthDate"
                  type="date"
                  defaultValue={editingGuest?.birthDate}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nationalität
                </label>
                <input
                  name="nationality"
                  type="text"
                  defaultValue={editingGuest?.nationality}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Typ
                </label>
                <select
                  name="type"
                  defaultValue={editingGuest?.type || 'adult'}
                  className="input"
                >
                  <option value="adult">Erwachsener</option>
                  <option value="child">Kind</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notizen
              </label>
              <textarea
                name="notes"
                rows={3}
                defaultValue={editingGuest?.notes}
                className="input"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingGuest(null)
                }}
                className="btn btn-secondary"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={createMutation.isLoading || updateMutation.isLoading}
                className="btn btn-primary"
              >
                {editingGuest ? 'Aktualisieren' : 'Erstellen'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Guests List */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Gästeliste</h2>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          </div>
        ) : guests?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Meldescheinnummer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Adresse
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Geburtsdatum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nationalität
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Typ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {guests.map((guest: Guest) => (
                  <tr key={guest.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {guest.firstName} {guest.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {guest.registrationNumber ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {guest.registrationNumber}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                        <div className="text-sm text-gray-900">
                          {guest.address && (
                            <div>{guest.address}</div>
                          )}
                          {guest.city && guest.postalCode && (
                            <div>{guest.postalCode} {guest.city}</div>
                          )}
                          {guest.country && (
                            <div>{guest.country}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                        <div className="text-sm text-gray-900">
                          {guest.birthDate ? 
                            format(new Date(guest.birthDate), 'dd.MM.yyyy', { locale: de }) : 
                            '-'
                          }
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Flag className="h-4 w-4 text-gray-400 mr-1" />
                        <div className="text-sm text-gray-900">
                          {guest.nationality || '-'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        guest.type === 'adult' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {guest.type === 'adult' ? 'Erwachsener' : 'Kind'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(guest)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(guest.id)}
                          className="text-red-600 hover:text-red-900"
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
        ) : (
          <div className="text-center py-8">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Keine Gäste gefunden</p>
          </div>
        )}
      </div>
    </div>
  )
} 