/**
 * Funktionen für die automatische Preisberechnung von Buchungen
 */

export interface Service {
  id: string
  name: string
  price: number | string
  type: 'nightly' | 'per_person' | 'per_booking'
}

export interface BookingCalculation {
  checkIn: string
  checkOut: string
  services: Service[]
  guestCount: number
}

/**
 * Berechnet die Anzahl Nächte zwischen Check-in und Check-out
 */
export const calculateNights = (checkIn: string, checkOut: string): number => {
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Berechnet den Preis für eine einzelne Leistung
 */
export const calculateServicePrice = (
  service: Service, 
  nights: number, 
  guestCount: number
): number => {
  const price = typeof service.price === 'string' ? parseFloat(service.price) : service.price
  
  switch (service.type) {
    case 'nightly':
      return price * nights
    case 'per_person':
      return price * guestCount * nights
    case 'per_booking':
      return price
    default:
      return 0
  }
}

/**
 * Berechnet den Gesamtpreis für eine Buchung
 */
export const calculateTotalPrice = (booking: BookingCalculation): number => {
  const nights = calculateNights(booking.checkIn, booking.checkOut)
  const guestCount = booking.guestCount
  
  return booking.services.reduce((total, service) => {
    return total + calculateServicePrice(service, nights, guestCount)
  }, 0)
}

/**
 * Erstellt eine detaillierte Preisaufschlüsselung
 */
export const createPriceBreakdown = (booking: BookingCalculation) => {
  const nights = calculateNights(booking.checkIn, booking.checkOut)
  const guestCount = booking.guestCount
  
  const breakdown = booking.services.map(service => {
    const price = calculateServicePrice(service, nights, guestCount)
    const unitPrice = typeof service.price === 'string' ? parseFloat(service.price) : service.price
    
    return {
      service: service.name,
      type: service.type,
      unitPrice,
      quantity: service.type === 'nightly' ? nights : 
                service.type === 'per_person' ? guestCount * nights : 1,
      totalPrice: price,
      description: service.type === 'nightly' ? `${nights} Nächte` :
                   service.type === 'per_person' ? `${guestCount} Personen × ${nights} Nächte` :
                   'Einmalig'
    }
  })
  
  const total = breakdown.reduce((sum, item) => sum + item.totalPrice, 0)
  
  return {
    breakdown,
    total,
    nights,
    guestCount,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut
  }
}

/**
 * Formatiert eine Preisaufschlüsselung für die Anzeige
 */
export const formatPriceBreakdown = (breakdown: any) => {
  return breakdown.map((item: any) => ({
    ...item,
    unitPriceFormatted: `CHF ${item.unitPrice.toFixed(2)}`,
    totalPriceFormatted: `CHF ${item.totalPrice.toFixed(2)}`,
    description: item.description
  }))
} 