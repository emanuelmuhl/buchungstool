import { useAuth } from '../contexts/AuthContext'

export default function DebugInfo() {
  const { user, isAuthenticated } = useAuth()
  const token = localStorage.getItem('token')

  if (import.meta.env.MODE !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <div className="space-y-1">
        <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
        <div>User: {user ? `${user.username} (${user.role})` : 'None'}</div>
        <div>Token: {token ? `${token.substring(0, 20)}...` : 'None'}</div>
      </div>
    </div>
  )
} 