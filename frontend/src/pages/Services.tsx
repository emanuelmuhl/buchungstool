import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package,
  Euro,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'
import { servicesApi } from '../api'
import { formatPrice } from '../utils/formatters'

interface Service {
  id: string
  name: string
  description?: string
  price: number | string
  type: 'nightly' | 'per_person' | 'per_booking'
  isActive: boolean
  isRequired: boolean
  sortOrder: number
}

const typeLabels = {
  nightly: 'Pro Nacht',
  per_person: 'Pro Person',
  per_booking: 'Pro Buchung',
}

export default function Services() {
  const [showForm, setShowForm] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [showInactive, setShowInactive] = useState(false)
  
  const queryClient = useQueryClient()

  const { data: services, isLoading, error } = useQuery('services', servicesApi.getAll, {
    retry: 3,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 Minuten
    onError: (error) => {
      console.error('Services loading failed:', error)
    }
  })

  // Sicherstellen, dass services ein Array ist und filtern
  const safeServices = (services || []).filter((service: any) => 
    showInactive ? true : service.isActive
  )

  const createMutation = useMutation(servicesApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('services')
      setShowForm(false)
    },
  })

  const updateMutation = useMutation(
    (data: { id: string; service: Partial<Service> }) => 
      servicesApi.update(data.id, data.service),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('services')
        setEditingService(null)
      },
    }
  )

  const deleteMutation = useMutation(servicesApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('services')
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const serviceData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      type: formData.get('type') as 'nightly' | 'per_person' | 'per_booking',
      isRequired: formData.has('isRequired'),
      sortOrder: parseInt(formData.get('sortOrder') as string) || 0,
    }

    if (editingService) {
      updateMutation.mutate({ id: editingService.id, service: serviceData })
    } else {
      createMutation.mutate(serviceData)
    }
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Möchten Sie diese Leistung wirklich löschen?')) {
      deleteMutation.mutate(id)
    }
  }

  const toggleActive = (service: Service) => {
    updateMutation.mutate({
      id: service.id,
      service: { isActive: !service.isActive }
    })
  }

  return (
    <div className="space-y-6">


      {/* Filter Options */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Leistungen</h2>
            <p className="text-sm text-gray-600">
              {safeServices.length} von {services?.length || 0} Leistungen
              {services && (
                <span className="ml-2">
                  ({services.filter((s: any) => s.isActive).length} aktiv, {services.filter((s: any) => !s.isActive).length} inaktiv)
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Inaktive anzeigen</span>
            </label>
            <button
              onClick={() => {
                setEditingService(null)
                setShowForm(true)
              }}
              className="btn btn-primary flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Neue Leistung
            </button>
          </div>
        </div>
      </div>

      {/* Service Form */}
      {showForm && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingService ? 'Leistung bearbeiten' : 'Neue Leistung'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  name="name"
                  type="text"
                  defaultValue={editingService?.name}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preis (CHF) *
                </label>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={editingService?.price}
                  className="input"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Beschreibung
              </label>
              <input
                name="description"
                type="text"
                defaultValue={editingService?.description}
                className="input"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Typ *
                </label>
                <select
                  name="type"
                  defaultValue={editingService?.type || 'per_booking'}
                  className="input"
                  required
                >
                  <option value="nightly">Pro Nacht</option>
                  <option value="per_person">Pro Person</option>
                  <option value="per_booking">Pro Buchung</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sortierung
                </label>
                <input
                  name="sortOrder"
                  type="number"
                  defaultValue={editingService?.sortOrder || 0}
                  className="input"
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    name="isRequired"
                    type="checkbox"
                    defaultChecked={editingService?.isRequired}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Pflichtleistung</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingService(null)
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
                {editingService ? 'Aktualisieren' : 'Erstellen'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Services List */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Leistungsliste</h2>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">
              <p className="font-semibold">Fehler beim Laden der Leistungen</p>
              <p className="text-sm">{error instanceof Error ? error.message : 'Unbekannter Fehler'}</p>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-primary"
            >
              Erneut versuchen
            </button>
          </div>
        ) : safeServices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Leistung
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Typ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {safeServices.map((service: Service) => (
                  <tr key={service.id} className={!service.isActive ? 'bg-gray-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <div className={`text-sm font-medium ${!service.isActive ? 'text-gray-500' : 'text-gray-900'}`}>
                            {service.name}
                            {!service.isActive && <span className="ml-2 text-xs text-gray-400">(inaktiv)</span>}
                          </div>
                          {service.description && (
                            <div className="text-sm text-gray-500">
                              {service.description}
                            </div>
                          )}
                          {service.isRequired && (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 mt-1">
                              Pflicht
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {typeLabels[service.type]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Euro className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm font-medium text-gray-900">
                          {formatPrice(service.price)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleActive(service)}
                        className={`flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                          service.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {service.isActive ? (
                          <ToggleRight className="h-3 w-3 mr-1" />
                        ) : (
                          <ToggleLeft className="h-3 w-3 mr-1" />
                        )}
                        {service.isActive ? 'Aktiv' : 'Inaktiv'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(service)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
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
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Keine Leistungen gefunden</p>
          </div>
        )}
      </div>
    </div>
  )
} 