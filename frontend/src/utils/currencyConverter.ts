/**
 * Währungsumrechnungs-Utilities
 */

// Aktuelle Wechselkurse (können später von einer API bezogen werden)
const EXCHANGE_RATES = {
  CHF_TO_EUR: 0.95, // 1 CHF = 0.95 EUR (Beispielkurs)
  EUR_TO_CHF: 1.05, // 1 EUR = 1.05 CHF (Beispielkurs)
}

export type Currency = 'CHF' | 'EUR'

/**
 * Konvertiert einen Betrag von einer Währung in eine andere
 */
export const convertCurrency = (amount: number, fromCurrency: Currency, toCurrency: Currency): number => {
  if (fromCurrency === toCurrency) {
    return amount
  }
  
  if (fromCurrency === 'CHF' && toCurrency === 'EUR') {
    return amount * EXCHANGE_RATES.CHF_TO_EUR
  }
  
  if (fromCurrency === 'EUR' && toCurrency === 'CHF') {
    return amount * EXCHANGE_RATES.EUR_TO_CHF
  }
  
  return amount
}

/**
 * Formatiert einen Preis in der angegebenen Währung
 */
export const formatCurrency = (amount: number, currency: Currency): string => {
  const formatter = new Intl.NumberFormat(currency === 'EUR' ? 'de-DE' : 'de-CH', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  
  return formatter.format(amount)
}

/**
 * Formatiert einen Preis mit Währungssymbol
 */
export const formatPriceWithCurrency = (amount: number | string, currency: Currency = 'CHF'): string => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  if (isNaN(numericAmount)) {
    return formatCurrency(0, currency)
  }
  
  return formatCurrency(numericAmount, currency)
}

/**
 * Berechnet den Wechselkurs zwischen zwei Währungen
 */
export const getExchangeRate = (fromCurrency: Currency, toCurrency: Currency): number => {
  if (fromCurrency === toCurrency) {
    return 1
  }
  
  if (fromCurrency === 'CHF' && toCurrency === 'EUR') {
    return EXCHANGE_RATES.CHF_TO_EUR
  }
  
  if (fromCurrency === 'EUR' && toCurrency === 'CHF') {
    return EXCHANGE_RATES.EUR_TO_CHF
  }
  
  return 1
}

/**
 * Aktualisiert die Wechselkurse (für zukünftige API-Integration)
 */
export const updateExchangeRates = (rates: { CHF_TO_EUR?: number; EUR_TO_CHF?: number }) => {
  if (rates.CHF_TO_EUR) {
    EXCHANGE_RATES.CHF_TO_EUR = rates.CHF_TO_EUR
  }
  if (rates.EUR_TO_CHF) {
    EXCHANGE_RATES.EUR_TO_CHF = rates.EUR_TO_CHF
  }
} 