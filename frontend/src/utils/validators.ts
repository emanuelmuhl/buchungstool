/**
 * Validierungsfunktionen für Datenqualität
 */

/**
 * Validiert eine Buchung und stellt sicher, dass alle erforderlichen Felder vorhanden sind
 */
export const validateBooking = (booking: any): boolean => {
  if (!booking) return false
  
  // Grundlegende Felder prüfen
  if (!booking.id || !booking.checkIn || !booking.checkOut) {
    return false
  }
  
  // Primary Guest prüfen
  if (!booking.primaryGuest || !booking.primaryGuest.id) {
    return false
  }
  
  return true
}

/**
 * Validiert einen Gast und stellt sicher, dass alle erforderlichen Felder vorhanden sind
 */
export const validateGuest = (guest: any): boolean => {
  if (!guest) return false
  
  // Pflichtfelder prüfen
  if (!guest.id || !guest.firstName || !guest.lastName) {
    return false
  }
  
  return true
}

/**
 * Validiert eine Leistung und stellt sicher, dass alle erforderlichen Felder vorhanden sind
 */
export const validateService = (service: any): boolean => {
  if (!service) return false
  
  // Pflichtfelder prüfen
  if (!service.id || !service.name || service.price === undefined) {
    return false
  }
  
  return true
}

/**
 * Bereinigt Buchungsdaten und stellt sicher, dass alle Felder korrekt sind
 */
export const sanitizeBooking = (booking: any) => {
  if (!booking) return null
  
  return {
    ...booking,
    primaryGuest: booking.primaryGuest || null,
    additionalGuests: booking.additionalGuests || [],
    services: booking.services || [],
    totalAmount: booking.totalAmount || 0,
    isPaid: booking.isPaid || false,
    status: booking.status || 'pending'
  }
}

/**
 * Bereinigt Gastdaten und stellt sicher, dass alle Felder korrekt sind
 */
export const sanitizeGuest = (guest: any) => {
  if (!guest) return null
  
  return {
    ...guest,
    firstName: guest.firstName || '',
    lastName: guest.lastName || '',
    address: guest.address || '',
    city: guest.city || '',
    postalCode: guest.postalCode || '',
    country: guest.country || '',
    nationality: guest.nationality || '',
    notes: guest.notes || '',
    isActive: guest.isActive !== false
  }
}

/**
 * Bereinigt Leistungsdaten und stellt sicher, dass alle Felder korrekt sind
 */
export const sanitizeService = (service: any) => {
  if (!service) return null
  
  return {
    ...service,
    name: service.name || '',
    description: service.description || '',
    price: service.price || 0,
    isActive: service.isActive !== false,
    isRequired: service.isRequired || false,
    sortOrder: service.sortOrder || 0
  }
} 