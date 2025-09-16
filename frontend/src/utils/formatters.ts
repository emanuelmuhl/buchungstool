/**
 * Hilfsfunktionen für Formatierung und Fehlerbehandlung
 */

/**
 * Formatiert einen Preis als CHF mit 2 Dezimalstellen
 * Behandelt sowohl Number als auch String-Inputs
 */
export const formatPrice = (price: number | string | null | undefined): string => {
  if (price === null || price === undefined) return 'CHF 0.00'
  
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price
  
  if (isNaN(numericPrice)) return 'CHF 0.00'
  
  return `CHF ${numericPrice.toFixed(2)}`
}

/**
 * Formatiert einen Namen sicher (behandelt null/undefined)
 */
export const formatName = (firstName?: string | null, lastName?: string | null): string => {
  const first = firstName || ''
  const last = lastName || ''
  return `${first} ${last}`.trim() || 'Unbekannt'
}

/**
 * Berechnet die Anzahl Nächte zwischen zwei Daten
 */
export const calculateNights = (checkIn: string | Date, checkOut: string | Date): number => {
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Formatiert ein Datum im deutschen Format
 */
export const formatDate = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleDateString('de-DE')
}

/**
 * Validiert eine Email-Adresse
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validiert eine Telefonnummer (einfache Validierung)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/
  return phoneRegex.test(phone)
} 