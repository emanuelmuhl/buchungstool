import React, { useState } from 'react'
import { Search, X, Users } from 'lucide-react'

interface Guest {
  id: string
  firstName: string
  lastName: string
  city?: string
  country?: string
}

interface GuestSelectorProps {
  guests: Guest[]
  selectedGuestIds: string[]
  onSelectionChange: (guestIds: string[]) => void
  placeholder?: string
  maxHeight?: string
  showCount?: boolean
}

export default function GuestSelector({
  guests,
  selectedGuestIds,
  onSelectionChange,
  placeholder = "Gäste suchen...",
  maxHeight = "max-h-40",
  showCount = true
}: GuestSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredGuests = guests?.filter((guest) => 
    guest.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.city?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const handleGuestToggle = (guestId: string) => {
    if (selectedGuestIds.includes(guestId)) {
      onSelectionChange(selectedGuestIds.filter(id => id !== guestId))
    } else {
      onSelectionChange([...selectedGuestIds, guestId])
    }
  }

  const removeGuest = (guestId: string) => {
    onSelectionChange(selectedGuestIds.filter(id => id !== guestId))
  }

  const selectedGuests = guests?.filter(guest => selectedGuestIds.includes(guest.id)) || []

  return (
    <div className="space-y-2">
      {/* Suchfeld */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Gefilterte Gästeliste */}
      <div className={`${maxHeight} overflow-y-auto border border-gray-300 rounded-md bg-white`}>
        {filteredGuests.length > 0 ? (
          filteredGuests.map((guest) => (
            <label key={guest.id} className="flex items-center p-2 hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedGuestIds.includes(guest.id)}
                onChange={() => handleGuestToggle(guest.id)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <div className="ml-2 flex-1">
                <span className="text-sm font-medium text-gray-700">
                  {guest.firstName} {guest.lastName}
                </span>
                {(guest.city || guest.country) && (
                  <span className="text-xs text-gray-500 ml-1">
                    ({guest.city}{guest.city && guest.country ? ', ' : ''}{guest.country})
                  </span>
                )}
              </div>
            </label>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Keine Gäste gefunden</p>
          </div>
        )}
      </div>

      {/* Ausgewählte Gäste */}
      {selectedGuests.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Ausgewählte Gäste:</p>
          <div className="flex flex-wrap gap-1">
            {selectedGuests.map((guest) => (
              <span
                key={guest.id}
                className="inline-flex items-center px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded-full"
              >
                {guest.firstName} {guest.lastName}
                <button
                  type="button"
                  onClick={() => removeGuest(guest.id)}
                  className="ml-1 text-primary-600 hover:text-primary-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Zähler */}
      {showCount && (
        <p className="text-sm text-gray-500">
          {filteredGuests.length} von {guests?.length || 0} Gästen
          {selectedGuests.length > 0 && ` (${selectedGuests.length} ausgewählt)`}
        </p>
      )}
    </div>
  )
} 