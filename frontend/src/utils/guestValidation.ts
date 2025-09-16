/**
 * Validierungsfunktionen für Gäste
 */

export interface GuestFormData {
  firstName: string
  lastName: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  birthDate?: string
  nationality?: string
  type: 'adult' | 'child'
  notes?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * Validiert Gastdaten vor dem Senden
 */
export const validateGuestData = (data: GuestFormData): ValidationResult => {
  const errors: string[] = []

  // Pflichtfelder prüfen
  if (!data.firstName?.trim()) {
    errors.push('Vorname ist erforderlich')
  }

  if (!data.lastName?.trim()) {
    errors.push('Nachname ist erforderlich')
  }

  if (!data.type) {
    errors.push('Typ ist erforderlich')
  }

  // Geburtsdatum validieren (falls angegeben)
  if (data.birthDate) {
    const birthDate = new Date(data.birthDate)
    const today = new Date()
    
    if (birthDate > today) {
      errors.push('Geburtsdatum kann nicht in der Zukunft liegen')
    }
    
    if (birthDate < new Date('1900-01-01')) {
      errors.push('Geburtsdatum scheint ungültig zu sein')
    }
  }

  // PLZ validieren (falls angegeben)
  if (data.postalCode && !/^\d{4,5}$/.test(data.postalCode)) {
    errors.push('PLZ muss 4-5 Ziffern haben')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Bereinigt Gastdaten
 */
export const sanitizeGuestData = (data: GuestFormData): GuestFormData => {
  return {
    firstName: data.firstName?.trim() || '',
    lastName: data.lastName?.trim() || '',
    address: data.address?.trim() || '',
    city: data.city?.trim() || '',
    postalCode: data.postalCode?.trim() || '',
    country: data.country?.trim() || '',
    birthDate: data.birthDate || '',
    nationality: data.nationality?.trim() || '',
    type: data.type || 'adult',
    notes: data.notes?.trim() || '',
  }
}

/**
 * Formatiert Gastdaten für die Anzeige
 */
export const formatGuestForDisplay = (guest: any) => {
  return {
    ...guest,
    firstName: guest.firstName || '',
    lastName: guest.lastName || '',
    fullName: `${guest.firstName || ''} ${guest.lastName || ''}`.trim() || 'Unbekannt',
    address: guest.address || '',
    city: guest.city || '',
    postalCode: guest.postalCode || '',
    country: guest.country || '',
    nationality: guest.nationality || '',
    notes: guest.notes || '',
    typeLabel: guest.type === 'adult' ? 'Erwachsener' : 'Kind'
  }
} 