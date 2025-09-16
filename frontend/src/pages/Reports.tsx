import { useState } from 'react'
import { useQuery } from 'react-query'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { 
  FileText, 
  Download, 
  Calendar,
  FileSpreadsheet,
  Receipt
} from 'lucide-react'
import { bookingsApi } from '../api'
import { formatPrice, formatName } from '../utils/formatters'
import { sanitizeBooking } from '../utils/validators'

interface Booking {
  id: string
  checkIn: string
  checkOut: string
  primaryGuest?: {
    firstName: string
    lastName: string
  }
  totalAmount: number | string
}

export default function Reports() {
  const [startDate, setStartDate] = useState(format(new Date(new Date().getFullYear(), 0, 1), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(new Date(new Date().getFullYear(), 11, 31), 'yyyy-MM-dd'))

  const { data: bookings } = useQuery('bookings', bookingsApi.getAll)

  const downloadInvoice = async (bookingId: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Nicht angemeldet. Bitte melden Sie sich erneut an.')
        return
      }

      console.log('Downloading invoice for booking:', bookingId)
      
      const response = await fetch(`${window.location.hostname === 'localhost' ? 'http://localhost:3101' : `http://${window.location.hostname}:3101`}/reports/invoice/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response error:', errorText)
        throw new Error(`Download fehlgeschlagen: ${response.status} ${response.statusText}`)
      }

      const blob = await response.blob()
      console.log('Blob size:', blob.size)
      
      if (blob.size === 0) {
        throw new Error('Leere Datei erhalten')
      }

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `rechnung-${bookingId.substring(0, 8)}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      console.log('Download completed successfully')
    } catch (error) {
      console.error('Download error:', error)
      alert(`Download fehlgeschlagen: ${error.message}`)
    }
  }

  const downloadPeriodReport = async (format: 'pdf' | 'excel') => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Nicht angemeldet. Bitte melden Sie sich erneut an.')
        return
      }

      console.log('Downloading period report:', { startDate, endDate, format })
      
      const response = await fetch(`/api/reports/period?startDate=${startDate}&endDate=${endDate}&format=${format}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response error:', errorText)
        throw new Error(`Download fehlgeschlagen: ${response.status} ${response.statusText}`)
      }

      const blob = await response.blob()
      console.log('Blob size:', blob.size)
      
      if (blob.size === 0) {
        throw new Error('Leere Datei erhalten')
      }

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `report-${startDate}-${endDate}.${format === 'pdf' ? 'pdf' : 'xlsx'}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      console.log('Period report download completed successfully')
    } catch (error) {
      console.error('Download error:', error)
      alert(`Download fehlgeschlagen: ${error.message}`)
    }
  }

  const filteredBookings = bookings?.filter((booking: Booking) => {
    const checkIn = new Date(booking.checkIn)
    const start = new Date(startDate)
    const end = new Date(endDate)
    return checkIn >= start && checkIn <= end
  }) || []

  const totalRevenue = filteredBookings.reduce((sum: number, booking: Booking) => {
    const amount = typeof booking.totalAmount === 'string' ? parseFloat(booking.totalAmount) : booking.totalAmount
    return sum + (amount || 0)
  }, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Rechnungen</h1>
        <p className="text-gray-600">PDF-Rechnungen und Excel/PDF-Reports generieren</p>
      </div>

      {/* Period Report Section */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Zeitraum-Report
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Startdatum
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enddatum
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input"
            />
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              <p><strong>Buchungen:</strong> {filteredBookings.length}</p>
              <p><strong>Einnahmen:</strong> {formatPrice(totalRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => downloadPeriodReport('pdf')}
            className="btn btn-primary flex items-center"
          >
            <FileText className="h-4 w-4 mr-2" />
            PDF Report
          </button>
          <button
            onClick={() => downloadPeriodReport('excel')}
            className="btn btn-secondary flex items-center"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel Report
          </button>
        </div>
      </div>

      {/* Individual Invoices Section */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Receipt className="h-5 w-5 mr-2" />
          Einzelne Rechnungen
        </h2>
        
        {bookings?.length > 0 ? (
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
                    Betrag
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking: Booking) => {
                  const safeBooking = sanitizeBooking(booking)
                  if (!safeBooking) return null
                  
                  return (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatName(safeBooking.primaryGuest?.firstName, safeBooking.primaryGuest?.lastName)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(new Date(safeBooking.checkIn), 'dd.MM.yyyy', { locale: de })} - {format(new Date(safeBooking.checkOut), 'dd.MM.yyyy', { locale: de })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(safeBooking.totalAmount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => downloadInvoice(safeBooking.id)}
                        className="text-primary-600 hover:text-primary-900 flex items-center ml-auto"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </button>
                    </td>
                  </tr>
                )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Keine Buchungen für Rechnungen verfügbar</p>
          </div>
        )}
      </div>
    </div>
  )
} 