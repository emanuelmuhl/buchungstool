import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { 
  Save,
  Building,
  Phone,
  Mail,
  Globe,
  CreditCard,
  Upload,
  Trash2,
  Image
} from 'lucide-react'
import { settingsApi } from '../api'

interface Settings {
  companyName: string
  address: string
  iban: string
  phone: string
  email: string
  website: string
  taxNumber: string
  defaultCurrency: string
  language: string
  logoUrl?: string
}

export default function Settings() {
  const [showForm, setShowForm] = useState(false)
  
  const queryClient = useQueryClient()

  const { data: settings, isLoading } = useQuery('settings', settingsApi.get)

  const updateMutation = useMutation(settingsApi.update, {
    onSuccess: () => {
      queryClient.invalidateQueries('settings')
      setShowForm(false)
    },
  })

  const uploadLogoMutation = useMutation(settingsApi.uploadLogo, {
    onSuccess: () => {
      queryClient.invalidateQueries('settings')
    },
  })

  const deleteLogoMutation = useMutation(settingsApi.deleteLogo, {
    onSuccess: () => {
      queryClient.invalidateQueries('settings')
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const settingsData = {
      companyName: formData.get('companyName') as string,
      address: formData.get('address') as string,
      iban: formData.get('iban') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      website: formData.get('website') as string,
      taxNumber: formData.get('taxNumber') as string,
      defaultCurrency: formData.get('defaultCurrency') as string,
      language: formData.get('language') as string,
    }

    updateMutation.mutate(settingsData)
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadLogoMutation.mutate(file)
    }
  }

  const handleLogoDelete = () => {
    if (confirm('Möchten Sie das Logo wirklich löschen?')) {
      deleteLogoMutation.mutate()
    }
  }

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Einstellungen</h1>
          <p className="text-gray-600">App-Konfiguration und Unternehmensdaten</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center"
        >
          <Save className="h-4 w-4 mr-2" />
          Bearbeiten
        </button>
      </div>

      {/* Current Settings Display */}
      {!showForm && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Unternehmensdaten
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Firmenname</label>
                <p className="text-sm text-gray-900">{settings?.companyName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Adresse</label>
                <p className="text-sm text-gray-900">{settings?.address}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Steuernummer</label>
                <p className="text-sm text-gray-900">{settings?.taxNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Logo</label>
                {settings?.logoUrl ? (
                  <div className="flex items-center space-x-3">
                    <img 
                      src={settings.logoUrl} 
                      alt="Firmenlogo" 
                      className="h-12 w-auto object-contain"
                    />
                    <button
                      onClick={handleLogoDelete}
                      className="btn btn-sm btn-danger flex items-center"
                      disabled={deleteLogoMutation.isLoading}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Löschen
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Kein Logo hochgeladen</p>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Zahlungsdaten
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">IBAN</label>
                <p className="text-sm text-gray-900 font-mono">{settings?.iban}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Standardwährung</label>
                <p className="text-sm text-gray-900">{settings?.defaultCurrency}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Phone className="h-5 w-5 mr-2" />
              Kontaktdaten
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Telefon</label>
                <p className="text-sm text-gray-900">{settings?.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">E-Mail</label>
                <p className="text-sm text-gray-900">{settings?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Website</label>
                <p className="text-sm text-gray-900">{settings?.website}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              App-Einstellungen
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Sprache</label>
                <p className="text-sm text-gray-900">
                  {settings?.language === 'de' ? 'Deutsch' : settings?.language}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Form */}
      {showForm && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Einstellungen bearbeiten</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Firmenname *
                </label>
                <input
                  name="companyName"
                  type="text"
                  defaultValue={settings?.companyName}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Steuernummer
                </label>
                <input
                  name="taxNumber"
                  type="text"
                  defaultValue={settings?.taxNumber}
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logo
              </label>
              <div className="flex items-center space-x-4">
                {settings?.logoUrl && (
                  <img 
                    src={settings.logoUrl} 
                    alt="Aktuelles Logo" 
                    className="h-16 w-auto object-contain border rounded"
                  />
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="input"
                    disabled={uploadLogoMutation.isLoading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Unterstützte Formate: PNG, JPG, GIF. Max. 5MB.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse *
              </label>
              <textarea
                name="address"
                rows={3}
                defaultValue={settings?.address}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IBAN *
              </label>
              <input
                name="iban"
                type="text"
                defaultValue={settings?.iban}
                className="input font-mono"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <input
                  name="phone"
                  type="tel"
                  defaultValue={settings?.phone}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-Mail
                </label>
                <input
                  name="email"
                  type="email"
                  defaultValue={settings?.email}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  name="website"
                  type="url"
                  defaultValue={settings?.website}
                  className="input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Standardwährung
                </label>
                <select
                  name="defaultCurrency"
                  defaultValue={settings?.defaultCurrency || 'CHF'}
                  className="input"
                >
                  <option value="CHF">CHF (Schweizer Franken)</option>
                  <option value="EUR">EUR (Euro)</option>
                  <option value="USD">USD (US Dollar)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sprache
                </label>
                <select
                  name="language"
                  defaultValue={settings?.language || 'de'}
                  className="input"
                >
                  <option value="de">Deutsch</option>
                  <option value="en">English</option>
                  <option value="it">Italiano</option>
                  <option value="fr">Français</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-secondary"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={updateMutation.isLoading}
                className="btn btn-primary flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                Speichern
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
} 