# 🏔️ Rustico Buchungstool

**Ein modernes Verwaltungstool für Ferienhäuser im Tessin**

Ein vollständiges Buchungs- und Verwaltungssystem für Ferienhäuser mit Gästeverwaltung, Buchungsverwaltung, Leistungsverwaltung und automatischer Rechnungserstellung. Unterstützt sowohl CHF als auch EUR als Währung.

## 📋 Inhaltsverzeichnis

- [🚀 Features](#-features)
- [🛠️ Technologie-Stack](#️-technologie-stack)
- [📦 Installation & Setup](#-installation--setup)
- [🌐 Benutzerführung](#-benutzerführung)
- [💱 Währungsumstellung](#-währungsumstellung)
- [📊 Leistungstypen & Preisberechnung](#-leistungstypen--preisberechnung)
- [📄 Reports & Export](#-reports--export)
- [🔧 Entwicklung](#-entwicklung)
- [📡 API-Dokumentation](#-api-dokumentation)
- [🐛 Troubleshooting](#-troubleshooting)
- [🔄 Updates & Roadmap](#-updates--roadmap)

## 🚀 Features

### ✅ Kernfunktionen
- **👥 Gästeverwaltung** - Vollständige CRUD-Operationen mit Suchfunktion
- **📅 Buchungsverwaltung** - Buchungen mit mehreren Gästen und Leistungen
- **🛠️ Leistungsverwaltung** - Dynamischer Katalog mit verschiedenen Preismodellen
- **📊 Dashboard** - Übersicht und Statistiken
- **💱 Währungsumstellung** - CHF und EUR Unterstützung

### 📄 PDF & Excel Reports
- **📋 PDF-Rechnungen** - Professionelle A4-Rechnungen pro Buchung
- **📊 Excel-Export** - Jahresreports für kantonale Meldungen
- **📈 PDF-Reports** - Zeitraum-basierte Übersichten
- **🧮 Automatische Berechnung** - Basierend auf Leistungstypen

### 🔧 Technische Features
- **🔐 JWT-Authentifizierung** - Sichere Admin-Anmeldung
- **📱 Responsive Design** - Optimiert für Desktop und Mobile
- **⚡ Real-time Updates** - React Query für aktuelle Daten
- **🔒 TypeScript** - Vollständig typisiert
- **🗄️ PostgreSQL** - Robuste Datenbank
- **🔄 Error Handling** - Umfassende Fehlerbehandlung

## 🛠️ Technologie-Stack

### Frontend
- **React 18** mit TypeScript
- **Vite** für schnelle Entwicklung
- **Tailwind CSS** für modernes Design
- **React Query** für API-Management
- **React Router** für Navigation
- **Lucide React** für Icons
- **date-fns** für Datumsformatierung

### Backend
- **NestJS** mit TypeScript
- **TypeORM** für Datenbankzugriff
- **PostgreSQL** als Datenbank
- **JWT** für Authentifizierung
- **Puppeteer** für PDF-Generierung
- **ExcelJS** für Excel-Export
- **class-validator** für Validierung

## 📦 Installation & Setup

### Voraussetzungen
- **Node.js 18+**
- **PostgreSQL 12+**
- **npm oder yarn**

### 1. Repository klonen
```bash
git clone <repository-url>
cd rustico-buchungstool
```

### 2. Dependencies installieren
```bash
npm run install:all
```

### 3. Datenbank einrichten
```bash
# PostgreSQL-Datenbank erstellen
createdb rustico_buchungstool
```

### 4. Umgebungsvariablen konfigurieren
```bash
# Backend .env-Datei kopieren
cp backend/.env.example backend/.env

# Werte anpassen:
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=rustico_buchungstool
JWT_SECRET=your-super-secret-jwt-key
```

### 5. Anwendung starten
```bash
# Entwicklungsserver starten
npm run dev

# Oder separat:
npm run dev:backend  # Backend auf Port 3101
npm run dev:frontend # Frontend auf Port 3102
```

## 🌐 Zugriff

- **Frontend**: http://localhost:3102
- **Backend API**: http://localhost:3101

### Anmeldedaten
- **Benutzername**: `admin`
- **Passwort**: `admin123`

## 🌐 Benutzerführung

### 1. 👥 Gäste erfassen
1. Navigieren Sie zu **"Gäste"**
2. Klicken Sie auf **"Neuer Gast"**
3. Füllen Sie alle Pflichtfelder aus:
   - **Vorname** und **Nachname** (Pflicht)
   - **Typ**: Erwachsener oder Kind
   - **Adresse**, **Stadt**, **PLZ**, **Land**
   - **Geburtsdatum**, **Nationalität**
   - **Notizen** (optional)
4. Klicken Sie auf **"Erstellen"**

### 2. 📅 Buchungen erstellen
1. Navigieren Sie zu **"Buchungen"**
2. Klicken Sie auf **"Neue Buchung"**
3. **Daten eingeben**:
   - **Check-in** und **Check-out** Datum
   - **Währung** wählen (CHF oder EUR)
4. **Gäste auswählen**:
   - **Hauptgast** aus Dropdown wählen
   - **Zusätzliche Gäste** mit Suchfunktion auswählen
5. **Leistungen wählen**:
   - Mehrfachauswahl möglich
   - **Live-Preisberechnung** wird angezeigt
6. **Status** und **Notizen** (optional)
7. Klicken Sie auf **"Erstellen"**

### 3. 🛠️ Leistungen verwalten
1. Navigieren Sie zu **"Leistungen"**
2. **Neue Leistung erstellen**:
   - **Name** und **Beschreibung**
   - **Preis** in CHF
   - **Typ** wählen:
     - **Pro Nacht**: Wird pro Nacht berechnet
     - **Pro Person**: Wird pro Person pro Nacht berechnet
     - **Pro Buchung**: Einmalig pro Buchung
   - **Pflichtleistung** (optional)
   - **Sortierung** (optional)
3. **Status verwalten**:
   - **Aktiv/Inaktiv** umschalten
   - **Inaktive anzeigen** Checkbox
4. **Leistungen bearbeiten** oder **löschen**

### 4. 📊 Dashboard
- **Übersicht** aller aktuellen Buchungen
- **Statistiken** und Kennzahlen
- **Schnellzugriff** auf wichtige Funktionen

### 5. 📄 Reports generieren
1. Navigieren Sie zu **"Reports"**
2. **Zeitraum-Report**:
   - **Start- und Enddatum** wählen
   - **PDF-Export** für Übersicht
   - **Excel-Export** für kantonale Meldungen
3. **Einzelne Rechnungen**:
   - **PDF-Rechnung** pro Buchung herunterladen
   - Direkt aus der Buchungsliste

## 💱 Währungsumstellung

### Unterstützte Währungen
- **🇨🇭 CHF (Schweizer Franken)** - Standardwährung
- **🇪🇺 EUR (Euro)** - Mit automatischer Umrechnung

### Wechselkurse
- **CHF → EUR**: 1 CHF = 0.95 EUR
- **EUR → CHF**: 1 EUR = 1.05 CHF

### Verwendung
1. **Bei Buchungserstellung**: Währung auswählen
2. **Live-Preisberechnung**: Zeigt Preis in gewählter Währung
3. **Buchungsliste**: Zeigt Währung und umgerechneten Preis
4. **Reports**: Generiert in der gewählten Währung

## 📊 Leistungstypen & Preisberechnung

### Pro Nacht (`nightly`)
- **Berechnung**: `Preis × Anzahl Nächte`
- **Beispiel**: Übernachtung CHF 120 × 3 Nächte = CHF 360

### Pro Person (`per_person`)
- **Berechnung**: `Preis × Anzahl Gäste × Anzahl Nächte`
- **Beispiel**: Kurtaxe CHF 3.50 × 4 Personen × 3 Nächte = CHF 42

### Pro Buchung (`per_booking`)
- **Berechnung**: `Preis × 1`
- **Beispiel**: Holz CHF 25 × 1 = CHF 25

### Automatische Berechnung
- **Backend**: Berechnet automatisch beim Speichern
- **Frontend**: Live-Preisberechnung während Eingabe
- **Währungsumrechnung**: Automatisch bei EUR-Buchungen

## 📄 Reports & Export

### PDF-Rechnungen
- **Format**: A4, professionell gestaltet
- **Inhalt**: Gastdaten, Buchungsdetails, Preisaufschlüsselung
- **Währung**: In der gewählten Buchungswährung
- **Download**: Direkt aus der Buchungsliste

### Zeitraum-Reports
- **PDF-Export**: Übersichtliche Zusammenfassung
- **Excel-Export**: Für kantonale Meldungen
- **Inhalt**: Alle Buchungen im Zeitraum mit Statistiken

### Excel-Export
- **Format**: .xlsx
- **Inhalt**: Detaillierte Buchungsdaten
- **Verwendung**: Kantonale Meldungen, Buchhaltung

## 🔧 Entwicklung

### Projektstruktur
```
rustico-buchungstool/
├── frontend/                 # React Frontend
│   ├── src/
│   │   ├── components/       # Wiederverwendbare Komponenten
│   │   ├── pages/           # Hauptseiten
│   │   ├── api/             # API-Client
│   │   ├── contexts/        # React Contexts
│   │   ├── utils/           # Hilfsfunktionen
│   │   └── types/           # TypeScript Typen
│   └── public/              # Statische Dateien
├── backend/                  # NestJS Backend
│   ├── src/
│   │   ├── auth/            # Authentifizierung
│   │   ├── bookings/        # Buchungsverwaltung
│   │   ├── guests/          # Gästeverwaltung
│   │   ├── services/        # Leistungsverwaltung
│   │   ├── reports/         # Report-Generierung
│   │   └── common/          # Gemeinsame Module
│   └── dist/                # Kompilierte Dateien
├── database/                 # SQL-Skripte
└── README.md
```

### Nützliche Befehle
```bash
# Entwicklung
npm run dev              # Beide Server starten
npm run dev:backend      # Nur Backend
npm run dev:frontend     # Nur Frontend

# Production
npm run build           # Production Build
npm run start           # Production Server

# Datenbank
npm run db:migrate      # Migrationen ausführen
npm run db:seed         # Testdaten einfügen

# Tests
npm run test            # Alle Tests
npm run test:watch      # Tests im Watch-Modus
```

## 📡 API-Dokumentation

### Authentifizierung
```http
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### Gäste
```http
GET    /guests                    # Alle Gäste
GET    /guests/active             # Nur aktive Gäste
POST   /guests                    # Neuer Gast
PATCH  /guests/:id                # Gast bearbeiten
DELETE /guests/:id                # Gast löschen
```

### Buchungen
```http
GET    /bookings                  # Alle Buchungen
POST   /bookings                  # Neue Buchung
PATCH  /bookings/:id              # Buchung bearbeiten
DELETE /bookings/:id              # Buchung löschen
GET    /bookings/upcoming         # Kommende Buchungen
```

### Leistungen
```http
GET    /services                  # Alle Leistungen
GET    /services/active           # Nur aktive Leistungen
POST   /services                  # Neue Leistung
PATCH  /services/:id              # Leistung bearbeiten
DELETE /services/:id              # Leistung löschen
```

### Reports
```http
GET /reports/invoice/:bookingId   # PDF-Rechnung
GET /reports/period?startDate=&endDate=&format=  # Zeitraum-Report
```

## 🐛 Troubleshooting

### Backend startet nicht
```bash
# Port-Konflikt prüfen
lsof -i :3101

# Prozesse beenden
pkill -f "nest start"

# Dependencies neu installieren
cd backend && npm install
```

### Frontend zeigt Fehler
```bash
# Browser-Entwicklertools öffnen (F12)
# Console-Fehler prüfen
# Backend-API-Verbindung testen

# Dependencies neu installieren
cd frontend && npm install
```

### Datenbank-Probleme
```bash
# PostgreSQL läuft?
brew services list | grep postgresql

# Datenbank existiert?
psql -l | grep rustico_buchungstool

# .env-Datei prüfen
cat backend/.env
```

### Häufige Fehler
- **"Cannot read properties of null"**: Daten nicht geladen, Seite neu laden
- **"toFixed is not a function"**: Preisformatierung, Backend neu starten
- **"Unauthorized"**: Token abgelaufen, neu anmelden

## 🔄 Updates & Roadmap

### Aktuelle Version
- ✅ **Gästeverwaltung** mit Suchfunktion
- ✅ **Buchungsverwaltung** mit Währungsumstellung
- ✅ **Leistungsverwaltung** mit verschiedenen Typen
- ✅ **PDF/Excel Reports**
- ✅ **Responsive Design**
- ✅ **Error Handling**

### Geplante Features
- 📧 **Email-Benachrichtigungen** für Buchungen
- 📅 **Kalender-Integration** (Google Calendar, iCal)
- 📊 **Erweiterte Statistiken** und Dashboards
- 📱 **Mobile App** (React Native)
- 🔗 **API-Integration** für externe Systeme
- 💳 **Online-Zahlungen** (Stripe, PayPal)
- 🌍 **Mehrsprachigkeit** (DE, IT, EN)

### Technische Verbesserungen
- 🚀 **Performance-Optimierung**
- 🔒 **Erweiterte Sicherheit**
- 📈 **Monitoring & Logging**
- 🐳 **Docker-Container**
- ☁️ **Cloud-Deployment**

---

## 📞 Support

Bei Problemen oder Fragen:

1. **Console-Fehler** prüfen (F12)
2. **Backend-Logs** analysieren
3. **API-Endpunkte** testen
4. **Datenbank-Verbindung** prüfen
5. **Dependencies** neu installieren

## 📄 Lizenz

Entwickelt für die Verwaltung von Ferienhäusern im Tessin.

---

**🏔️ Entwickelt für die Verwaltung von Ferienhäusern im Tessin** 

*Version 1.0.0 - Dezember 2024* 