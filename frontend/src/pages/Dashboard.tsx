import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { 
  Users, 
  Calendar, 
  Package, 
  Plus, 
  TrendingUp,
  Clock,
  Euro
} from 'lucide-react'
import { bookingsApi } from '../api'
import { formatPrice, formatName } from '../utils/formatters'

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery('dashboard-stats', bookingsApi.getDashboardStats)
  const { data: upcomingBookings, isLoading: bookingsLoading } = useQuery(
    'upcoming-bookings', 
    bookingsApi.getUpcoming
  )

  const quickActions = [
    {
      name: 'Neuer Gast',
      href: '/guests',
      icon: Users,
      description: 'Gast erfassen',
      color: 'bg-blue-500',
    },
    {
      name: 'Neue Buchung',
      href: '/bookings',
      icon: Calendar,
      description: 'Buchung erstellen',
      color: 'bg-green-500',
    },
    {
      name: 'Leistungen',
      href: '/services',
      icon: Package,
      description: 'Leistungen verwalten',
      color: 'bg-purple-500',
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Willkommen im Rustico Buchungstool</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Nächste Buchungen</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.upcomingBookings || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Buchungen diesen Monat</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.monthlyBookings || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Gesamte Buchungen</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.totalBookings || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Schnellzugriff</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              to={action.href}
              className="group relative bg-white p-6 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center">
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-primary-600">
                    {action.name}
                  </p>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </div>
                <div className="ml-auto">
                  <Plus className="h-4 w-4 text-gray-400 group-hover:text-primary-600" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Upcoming Bookings */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Nächste Buchungen</h2>
        {bookingsLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          </div>
        ) : upcomingBookings?.length > 0 ? (
          <div className="space-y-4">
            {upcomingBookings.slice(0, 5).map((booking: any) => (
              <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {formatName(booking.primaryGuest?.firstName, booking.primaryGuest?.lastName)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(booking.checkIn), 'dd.MM.yyyy', { locale: de })} - {format(new Date(booking.checkOut), 'dd.MM.yyyy', { locale: de })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Euro className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-sm font-medium text-gray-900">
                    {formatPrice(booking.totalAmount)}
                  </span>
                </div>
              </div>
            ))}
            {upcomingBookings.length > 5 && (
              <div className="text-center">
                <Link
                  to="/bookings"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Alle Buchungen anzeigen →
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Keine anstehenden Buchungen</p>
          </div>
        )}
      </div>
    </div>
  )
} 