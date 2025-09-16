import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  Users,
  Euro,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Download,
  Search,
  ChevronDown,
  X
} from 'lucide-react'
import { bookingsApi, guestsApi, servicesApi } from '../api'
import { formatPrice, formatName } from '../utils/formatters'
import { calculateTotalPrice, createPriceBreakdown } from '../utils/bookingCalculation'
import { formatPriceWithCurrency, convertCurrency, type Currency } from '../utils/currencyConverter'
import { getApiUrl } from '../utils/api'

interface Booking {
  id: string
  checkIn: string
  checkOut: string
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  notes?: string
  totalAmount: number | string
  isPaid: boolean
  currency?: string
  primaryGuest: {
    id: string
    firstName: string
    lastName: string
    registrationNumber?: string
  }
  additionalGuests: Array<{
    id: string
    firstName: string
    lastName: string
  }>
  services: Array<{
    id: string
    name: string
    price: number | string
  }>
}

const statusConfig = {
  confirmed: { label: 'Bestätigt', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  pending: { label: 'Ausstehend', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  cancelled: { label: 'Storniert', color: 'bg-red-100 text-red-800', icon: XCircle },
  completed: { label: 'Abgeschlossen', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
}

export default function Bookings() {
  const [showForm, setShowForm] = useState(false)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [selectedGuests, setSelectedGuests] = useState<string[]>([])
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guestSearchTerm, setGuestSearchTerm] = useState('')
  const [showGuestDropdown, setShowGuestDropdown] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('CHF')
  
  const queryClient = useQueryClient()

  const { data: bookings, isLoading, error } = useQuery('bookings', bookingsApi.getAll, {
    retry: 3,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 Minuten
    onError: (error) => {
      console.error('Bookings loading failed:', error)
    }
  })

  // Sicherstellen, dass bookings ein Array ist
  const safeBookings = bookings || []
  const { data: guests } = useQuery('guests', () => guestsApi.getActive())
  const { data: services } = useQuery('services', () => servicesApi.getActive())

  // Live-Preisberechnung
  const calculateLivePrice = () => {
    if (!checkIn || !checkOut || selectedServices.length === 0) return 0
    
    const selectedServiceObjects = services?.filter((s: any) => selectedServices.includes(s.id)) || []
    const guestCount = 1 + selectedGuests.length // Hauptgast + zusätzliche Gäste
    
    return calculateTotalPrice({
      checkIn,
      checkOut,
      services: selectedServiceObjects,
      guestCount
    })
  }

  const livePrice = calculateLivePrice()

  const createMutation = useMutation(bookingsApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('bookings')
      setShowForm(false)
      setEditingBooking(null)
      setSelectedServices([])
      setSelectedGuests([])
      setCheckIn('')
      setCheckOut('')
      setGuestSearchTerm('')
    },
    onError: (error: any) => {
      console.error('Fehler beim Erstellen der Buchung:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Unbekannter Fehler'
      alert(`Fehler beim Erstellen der Buchung: ${errorMessage}`)
    }
  })

  const updateMutation = useMutation(
    (data: { id: string; booking: any }) => 
      bookingsApi.update(data.id, data.booking),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('bookings')
        setEditingBooking(null)
        setShowForm(false)
        setSelectedServices([])
        setSelectedGuests([])
        setCheckIn('')
        setCheckOut('')
        setGuestSearchTerm('')
      },
      onError: (error: any) => {
        console.error('Fehler beim Aktualisieren der Buchung:', error)
        console.error('Error details:', error.response?.data)
        console.error('Request data:', error.config?.data)
        const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Unbekannter Fehler'
        alert(`Fehler beim Aktualisieren der Buchung: ${errorMessage}`)
      }
    }
  )

  const deleteMutation = useMutation(bookingsApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('bookings')
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    // Validierung
    const primaryGuestId = formData.get('primaryGuestId') as string
    if (!primaryGuestId) {
      alert('Bitte wählen Sie einen Hauptgast aus.')
      return
    }
    
    if (selectedServices.length === 0) {
      alert('Bitte wählen Sie mindestens eine Leistung aus.')
      return
    }
    
    const bookingData = {
      checkIn: checkIn || formData.get('checkIn') as string,
      checkOut: checkOut || formData.get('checkOut') as string,
      primaryGuestId: primaryGuestId,
      additionalGuestIds: selectedGuests,
      serviceIds: selectedServices,
      notes: formData.get('notes') as string || '',
      status: formData.get('status') as string || 'pending',
      currency: selectedCurrency,
    }

    console.log('Sending booking data:', bookingData)
    console.log('Booking data type:', typeof bookingData)
    console.log('Booking data keys:', Object.keys(bookingData))

    if (editingBooking) {
      updateMutation.mutate({ id: editingBooking.id, booking: bookingData })
    } else {
      createMutation.mutate(bookingData)
    }
  }

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking)
    setSelectedCurrency(booking.currency as Currency || 'CHF')
    setCheckIn(booking.checkIn)
    setCheckOut(booking.checkOut)
    setSelectedServices(booking.services?.map(s => s.id) || [])
    setSelectedGuests(booking.additionalGuests?.map(g => g.id) || [])
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Möchten Sie diese Buchung wirklich löschen?')) {
      deleteMutation.mutate(id)
    }
  }

  const downloadInvoice = async (bookingId: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      // Verwende die Reports-Seite für den Download
      const response = await fetch(`${getApiUrl()}/reports/invoice/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        // Fallback: Öffne die Reports-Seite
        window.open(`/reports?bookingId=${bookingId}`, '_blank')
        return
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `rechnung-${bookingId.substring(0, 8)}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download error:', error)
      // Fallback: Öffne die Reports-Seite
      window.open(`/reports?bookingId=${bookingId}`, '_blank')
    }
  }

  const downloadBookingConfirmation = async (bookingId: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`${getApiUrl()}/reports/confirmation/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        console.error('Booking confirmation download failed:', response.status)
        alert('Fehler beim Herunterladen der Buchungsbestätigung')
        return
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `buchungsbestaetigung-${bookingId.substring(0, 8)}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Booking confirmation download error:', error)
      alert('Fehler beim Herunterladen der Buchungsbestätigung')
    }
  }

  const getStatusConfig = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Buchungen</h1>
          <p className="text-gray-600">Verwaltung der Buchungen</p>
        </div>
        <button
          onClick={() => {
            setEditingBooking(null)
            setShowForm(true)
          }}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Neue Buchung
        </button>
      </div>

      {/* Booking Form */}
      {showForm && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingBooking ? 'Buchung bearbeiten' : 'Neue Buchung'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {(createMutation.isLoading || updateMutation.isLoading) && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-sm text-blue-800">
                    {createMutation.isLoading ? 'Buchung wird erstellt...' : 'Buchung wird aktualisiert...'}
                  </span>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-in *
                </label>
                <input
                  name="checkIn"
                  type="date"
                  defaultValue={editingBooking?.checkIn}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-out *
                </label>
                <input
                  name="checkOut"
                  type="date"
                  defaultValue={editingBooking?.checkOut}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="input"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Währung
                </label>
                <select
                  name="currency"
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value as Currency)}
                  className="input"
                >
                  <option value="CHF">CHF (Schweizer Franken)</option>
                  <option value="EUR">EUR (Euro)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hauptgast *
              </label>
              <select
                name="primaryGuestId"
                defaultValue={editingBooking?.primaryGuest?.id}
                className="input"
                required
              >
                <option value="">Hauptgast auswählen</option>
                {guests
                  ?.filter((guest: any) => 
                    guest.firstName?.toLowerCase().includes(guestSearchTerm.toLowerCase()) ||
                    guest.lastName?.toLowerCase().includes(guestSearchTerm.toLowerCase())
                  )
                  .map((guest: any) => (
                    <option key={guest.id} value={guest.id}>
                      {guest.firstName} {guest.lastName}
                      {guest.city && ` (${guest.city})`}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zusätzliche Gäste
              </label>
              
              {/* Gästefilter */}
              <div className="relative mb-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Gäste suchen..."
                  value={guestSearchTerm}
                  onChange={(e) => setGuestSearchTerm(e.target.value)}
                  className="input pl-10"
                  onFocus={() => setShowGuestDropdown(true)}
                />
              </div>
              
              {/* Gefilterte Gästeliste */}
              <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md">
                {guests
                  ?.filter((guest: any) => 
                    guest.firstName?.toLowerCase().includes(guestSearchTerm.toLowerCase()) ||
                    guest.lastName?.toLowerCase().includes(guestSearchTerm.toLowerCase())
                  )
                  .map((guest: any) => (
                    <label key={guest.id} className="flex items-center p-2 hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedGuests.includes(guest.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedGuests([...selectedGuests, guest.id])
                          } else {
                            setSelectedGuests(selectedGuests.filter(id => id !== guest.id))
                          }
                        }}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {guest.firstName} {guest.lastName}
                        {guest.city && ` (${guest.city})`}
                      </span>
                    </label>
                  ))}
              </div>
              
              {/* Ausgewählte Gäste anzeigen */}
              {selectedGuests.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700 mb-1">Ausgewählte Gäste:</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedGuests.map(guestId => {
                      const guest = guests?.find((g: any) => g.id === guestId)
                      return guest ? (
                        <span
                          key={guestId}
                          className="inline-flex items-center px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded-full"
                        >
                          {guest.firstName} {guest.lastName}
                          <button
                            type="button"
                            onClick={() => setSelectedGuests(selectedGuests.filter(id => id !== guestId))}
                            className="ml-1 text-primary-600 hover:text-primary-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ) : null
                    })}
                  </div>
                </div>
              )}
              
              <p className="text-sm text-gray-500 mt-1">
                {guests?.filter((g: any) => 
                  g.firstName?.toLowerCase().includes(guestSearchTerm.toLowerCase()) ||
                  g.lastName?.toLowerCase().includes(guestSearchTerm.toLowerCase())
                ).length || 0} von {guests?.length || 0} Gästen
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Leistungen
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                {services?.map((service: any) => (
                  <label key={service.id} className="flex items-center">
                    <input
                      type="checkbox"
                      name="serviceIds"
                      value={service.id}
                      defaultChecked={editingBooking?.services?.some(s => s.id === service.id)}
                      checked={selectedServices.includes(service.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedServices([...selectedServices, service.id])
                        } else {
                          setSelectedServices(selectedServices.filter(id => id !== service.id))
                        }
                      }}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {service.name} - CHF {service.price} ({service.type === 'nightly' ? 'pro Nacht' : service.type === 'per_person' ? 'pro Person' : 'pro Buchung'})
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Wählen Sie alle gewünschten Leistungen aus
              </p>
              
                    {/* Live-Preisanzeige */}
      {livePrice > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-green-800">Geschätzter Gesamtpreis:</span>
            <span className="text-lg font-bold text-green-900">
              {formatPriceWithCurrency(livePrice, selectedCurrency)}
            </span>
          </div>
          {selectedCurrency !== 'CHF' && (
            <div className="mt-2 text-xs text-green-700">
              ≈ {formatPriceWithCurrency(convertCurrency(livePrice, 'CHF', selectedCurrency), selectedCurrency)}
            </div>
          )}
        </div>
      )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                defaultValue={editingBooking?.status || 'pending'}
                className="input"
              >
                <option value="pending">Ausstehend</option>
                <option value="confirmed">Bestätigt</option>
                <option value="completed">Abgeschlossen</option>
                <option value="cancelled">Storniert</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notizen
              </label>
              <textarea
                name="notes"
                rows={3}
                defaultValue={editingBooking?.notes}
                className="input"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingBooking(null)
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
                {editingBooking ? 'Aktualisieren' : 'Erstellen'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bookings List */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Buchungsliste</h2>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">
              <p className="font-semibold">Fehler beim Laden der Buchungen</p>
              <p className="text-sm">{error instanceof Error ? error.message : 'Unbekannter Fehler'}</p>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-primary"
            >
              Erneut versuchen
            </button>
          </div>
        ) : safeBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gast
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zeitraum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nächte
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Betrag
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen (PDF | Bearbeiten | Löschen)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {safeBookings.map((booking: Booking) => {
                  const status = getStatusConfig(booking.status)
                  const StatusIcon = status.icon
                  
                  return (
                    <tr key={booking.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Users className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatName(booking.primaryGuest?.firstName, booking.primaryGuest?.lastName)}
                            </div>
                            {booking.primaryGuest?.registrationNumber && (
                              <div className="text-xs text-blue-600 mt-1">
                                {booking.primaryGuest.registrationNumber}
                              </div>
                            )}
                            {booking.additionalGuests?.length > 0 && (
                              <div className="text-sm text-gray-500">
                                +{booking.additionalGuests.length} weitere Gäste
                              </div>
                            )}
                            {booking.services?.length > 0 && (
                              <div className="text-xs text-gray-400 mt-1">
                                {booking.services.length} Leistung{booking.services.length > 1 ? 'en' : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                          <div className="text-sm text-gray-900">
                            <div>
                              {format(new Date(booking.checkIn), 'dd.MM.yyyy', { locale: de })}
                            </div>
                            <div>
                              {format(new Date(booking.checkOut), 'dd.MM.yyyy', { locale: de })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24))} Nächte
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Euro className="h-4 w-4 text-gray-400 mr-1" />
                          <div>
                            <span className="text-sm font-medium text-gray-900">
                              {formatPriceWithCurrency(booking.totalAmount, booking.currency as Currency || 'CHF')}
                            </span>
                            {booking.currency && booking.currency !== 'CHF' && (
                              <div className="text-xs text-gray-500">
                                {booking.currency} Buchung
                              </div>
                            )}
                          </div>
                          {booking.isPaid && (
                            <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Bezahlt
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => downloadBookingConfirmation(booking.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Buchungsbestätigung herunterladen"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => downloadInvoice(booking.id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="PDF-Rechnung herunterladen"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(booking)}
                            className="text-primary-600 hover:text-primary-900"
                            title="Buchung bearbeiten"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(booking.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Buchung löschen"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Keine Buchungen gefunden</p>
          </div>
        )}
      </div>
    </div>
  )
} 