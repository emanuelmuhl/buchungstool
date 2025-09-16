# 👨‍💻 Entwicklerdokumentation

**Technische Dokumentation für das Rustico Buchungstool**

Diese Dokumentation richtet sich an Entwickler und enthält technische Details, Architektur-Informationen und Code-Beispiele.

## 📋 Inhaltsverzeichnis

- [🏗️ Architektur](#️-architektur)
- [🔧 Entwicklungsumgebung](#-entwicklungsumgebung)
- [📁 Projektstruktur](#-projektstruktur)
- [💾 Datenbank-Schema](#-datenbank-schema)
- [🔌 API-Spezifikation](#-api-spezifikation)
- [🎨 Frontend-Architektur](#-frontend-architektur)
- [⚙️ Backend-Architektur](#️-backend-architektur)
- [🧪 Testing](#-testing)
- [🚀 Deployment](#-deployment)
- [🔍 Debugging](#-debugging)

## 🏗️ Architektur

### System-Übersicht
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (NestJS)      │◄──►│   (PostgreSQL)  │
│   Port: 3102    │    │   Port: 3101    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technologie-Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: NestJS + TypeScript + TypeORM
- **Datenbank**: PostgreSQL 12+
- **Authentifizierung**: JWT
- **State Management**: React Query
- **PDF-Generierung**: Puppeteer
- **Excel-Export**: ExcelJS

## 🔧 Entwicklungsumgebung

### Voraussetzungen
```bash
# Node.js Version prüfen
node --version  # >= 18.0.0

# PostgreSQL Version prüfen
psql --version  # >= 12.0

# Git Version prüfen
git --version   # >= 2.0.0
```

### Setup
```bash
# Repository klonen
git clone <repository-url>
cd rustico-buchungstool

# Dependencies installieren
npm run install:all

# Umgebungsvariablen konfigurieren
cp backend/.env.example backend/.env
# .env-Datei anpassen

# Datenbank erstellen
createdb rustico_buchungstool

# Entwicklungsserver starten
npm run dev
```

### Entwicklungsskripte
```bash
# Entwicklung
npm run dev              # Beide Server starten
npm run dev:backend      # Nur Backend
npm run dev:frontend     # Nur Frontend

# Build
npm run build           # Production Build
npm run build:backend   # Backend Build
npm run build:frontend  # Frontend Build

# Tests
npm run test            # Alle Tests
npm run test:watch      # Tests im Watch-Modus
npm run test:e2e        # End-to-End Tests

# Linting
npm run lint            # ESLint
npm run lint:fix        # ESLint mit Auto-Fix
npm run format          # Prettier Formatierung
```

## 📁 Projektstruktur

### Frontend-Struktur
```
frontend/
├── public/                 # Statische Dateien
├── src/
│   ├── components/         # Wiederverwendbare Komponenten
│   │   ├── Layout.tsx      # Haupt-Layout
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── GuestSelector.tsx
│   ├── pages/             # Hauptseiten
│   │   ├── Dashboard.tsx
│   │   ├── Bookings.tsx
│   │   ├── Guests.tsx
│   │   ├── Services.tsx
│   │   ├── Reports.tsx
│   │   └── Login.tsx
│   ├── api/               # API-Client
│   │   ├── index.ts       # Axios-Konfiguration
│   │   ├── auth.ts        # Authentifizierung
│   │   ├── bookings.ts    # Buchungen
│   │   ├── guests.ts      # Gäste
│   │   └── services.ts    # Leistungen
│   ├── contexts/          # React Contexts
│   │   └── AuthContext.tsx
│   ├── utils/             # Hilfsfunktionen
│   │   ├── formatters.ts  # Formatierung
│   │   ├── validators.ts  # Validierung
│   │   ├── currencyConverter.ts
│   │   └── bookingCalculation.ts
│   ├── types/             # TypeScript Typen
│   │   └── index.ts
│   ├── App.tsx            # Haupt-App
│   └── main.tsx           # Entry Point
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

### Backend-Struktur
```
backend/
├── src/
│   ├── auth/              # Authentifizierung
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── jwt.strategy.ts
│   │   └── dto/
│   ├── bookings/          # Buchungsverwaltung
│   │   ├── bookings.module.ts
│   │   ├── bookings.controller.ts
│   │   ├── bookings.service.ts
│   │   ├── entities/
│   │   │   └── booking.entity.ts
│   │   └── dto/
│   │       ├── create-booking.dto.ts
│   │       └── update-booking.dto.ts
│   ├── guests/            # Gästeverwaltung
│   │   ├── guests.module.ts
│   │   ├── guests.controller.ts
│   │   ├── guests.service.ts
│   │   ├── entities/
│   │   │   └── guest.entity.ts
│   │   └── dto/
│   ├── services/          # Leistungsverwaltung
│   │   ├── services.module.ts
│   │   ├── services.controller.ts
│   │   ├── services.service.ts
│   │   ├── entities/
│   │   │   └── service.entity.ts
│   │   └── dto/
│   ├── reports/           # Report-Generierung
│   │   ├── reports.module.ts
│   │   ├── reports.controller.ts
│   │   └── reports.service.ts
│   ├── common/            # Gemeinsame Module
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   └── interceptors/
│   ├── app.module.ts      # Haupt-Modul
│   └── main.ts            # Entry Point
├── dist/                  # Kompilierte Dateien
├── package.json
├── tsconfig.json
├── nest-cli.json
└── .env
```

## 💾 Datenbank-Schema

### Haupttabellen

#### `guests` - Gäste
```sql
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  birth_date DATE,
  nationality VARCHAR(100),
  type VARCHAR(20) NOT NULL DEFAULT 'adult',
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `services` - Leistungen
```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'per_booking',
  is_active BOOLEAN DEFAULT true,
  is_required BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `bookings` - Buchungen
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  notes TEXT,
  total_amount DECIMAL(10,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'CHF',
  is_paid BOOLEAN DEFAULT false,
  paid_at DATE,
  primary_guest_id UUID REFERENCES guests(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Beziehungstabellen
```sql
-- Buchung - Zusätzliche Gäste
CREATE TABLE booking_additional_guests (
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  PRIMARY KEY (booking_id, guest_id)
);

-- Buchung - Leistungen
CREATE TABLE booking_services (
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (booking_id, service_id)
);
```

## 🔌 API-Spezifikation

### Authentifizierung
```typescript
// Login
POST /auth/login
{
  "username": "admin",
  "password": "admin123"
}

// Response
{
  "access_token": "jwt-token",
  "user": {
    "id": "uuid",
    "username": "admin"
  }
}
```

### Buchungen
```typescript
// Buchung erstellen
POST /bookings
{
  "checkIn": "2024-12-20",
  "checkOut": "2024-12-23",
  "primaryGuestId": "uuid",
  "additionalGuestIds": ["uuid1", "uuid2"],
  "serviceIds": ["uuid1", "uuid2"],
  "notes": "Optional notes",
  "status": "pending",
  "currency": "CHF"
}

// Buchung abrufen
GET /bookings/:id
// Response mit allen Beziehungen
{
  "id": "uuid",
  "checkIn": "2024-12-20",
  "checkOut": "2024-12-23",
  "totalAmount": 450.00,
  "currency": "CHF",
  "primaryGuest": { ... },
  "additionalGuests": [ ... ],
  "services": [ ... ]
}
```

### Gäste
```typescript
// Gast erstellen
POST /guests
{
  "firstName": "Max",
  "lastName": "Mustermann",
  "address": "Musterstraße 1",
  "city": "Zürich",
  "postalCode": "8000",
  "country": "Schweiz",
  "birthDate": "1990-01-01",
  "nationality": "Schweiz",
  "type": "adult",
  "notes": "Optional"
}
```

## 🎨 Frontend-Architektur

### State Management
```typescript
// React Query für Server State
const { data: bookings, isLoading, error } = useQuery('bookings', bookingsApi.getAll, {
  retry: 3,
  retryDelay: 1000,
  staleTime: 5 * 60 * 1000, // 5 Minuten
})

// React Context für Auth State
const { user, login, logout } = useAuth()
```

### Komponenten-Struktur
```typescript
// Layout-Komponente
<Layout>
  <Navigation />
  <main>
    <Outlet />
  </main>
</Layout>

// Seiten-Komponente
<Bookings>
  <BookingForm />
  <BookingList />
</Bookings>
```

### API-Client
```typescript
// Axios-Konfiguration
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor für Auth
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

## ⚙️ Backend-Architektur

### Modul-Struktur
```typescript
// Haupt-Modul
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [Booking, Guest, Service],
      synchronize: true, // Nur für Entwicklung
    }),
    AuthModule,
    BookingsModule,
    GuestsModule,
    ServicesModule,
    ReportsModule,
  ],
})
export class AppModule {}
```

### Service-Pattern
```typescript
@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    // Validierung und Geschäftslogik
    const booking = this.bookingsRepository.create(createBookingDto)
    return this.bookingsRepository.save(booking)
  }
}
```

### DTO-Validierung
```typescript
export class CreateBookingDto {
  @IsDateString()
  checkIn: string

  @IsDateString()
  checkOut: string

  @IsString()
  primaryGuestId: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  additionalGuestIds?: string[]

  @IsOptional()
  @IsString()
  currency?: string
}
```

## 🧪 Testing

### Frontend-Tests
```typescript
// Komponenten-Test
import { render, screen } from '@testing-library/react'
import Bookings from './Bookings'

test('renders bookings list', () => {
  render(<Bookings />)
  expect(screen.getByText('Buchungsliste')).toBeInTheDocument()
})

// API-Test
import { rest } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  rest.get('/api/bookings', (req, res, ctx) => {
    return res(ctx.json([mockBooking]))
  })
)
```

### Backend-Tests
```typescript
// Service-Test
describe('BookingsService', () => {
  let service: BookingsService
  let repository: Repository<Booking>

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: getRepositoryToken(Booking),
          useClass: Repository,
        },
      ],
    }).compile()

    service = module.get<BookingsService>(BookingsService)
    repository = module.get<Repository<Booking>>(getRepositoryToken(Booking))
  })

  it('should create a booking', async () => {
    const dto = { checkIn: '2024-12-20', checkOut: '2024-12-23' }
    const result = await service.create(dto)
    expect(result).toBeDefined()
  })
})
```

## 🚀 Deployment

### Production Build
```bash
# Frontend Build
cd frontend
npm run build

# Backend Build
cd backend
npm run build

# Dependencies installieren
npm ci --only=production
```

### Docker (geplant)
```dockerfile
# Frontend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3102
CMD ["npm", "start"]

# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3101
CMD ["npm", "run", "start:prod"]
```

### Environment Variables
```bash
# Production .env
NODE_ENV=production
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=rustico_user
DB_PASSWORD=secure_password
DB_DATABASE=rustico_prod
JWT_SECRET=super-secret-jwt-key
JWT_EXPIRES_IN=24h
```

## 🔍 Debugging

### Frontend-Debugging
```typescript
// React Query DevTools
import { ReactQueryDevtools } from 'react-query/devtools'

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AppRoutes />
      </QueryClientProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  )
}

// Error Boundary
<ErrorBoundary>
  <Component />
</ErrorBoundary>
```

### Backend-Debugging
```typescript
// Logger-Konfiguration
import { Logger } from '@nestjs/common'

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name)

  async create(dto: CreateBookingDto) {
    this.logger.log(`Creating booking for ${dto.primaryGuestId}`)
    try {
      const result = await this.bookingsRepository.save(dto)
      this.logger.log(`Booking created: ${result.id}`)
      return result
    } catch (error) {
      this.logger.error(`Failed to create booking: ${error.message}`)
      throw error
    }
  }
}
```

### Datenbank-Debugging
```sql
-- Buchungen mit Beziehungen abfragen
SELECT 
  b.id,
  b.check_in,
  b.check_out,
  b.total_amount,
  b.currency,
  pg.first_name || ' ' || pg.last_name as primary_guest,
  COUNT(ag.guest_id) as additional_guests,
  COUNT(bs.service_id) as services
FROM bookings b
LEFT JOIN guests pg ON b.primary_guest_id = pg.id
LEFT JOIN booking_additional_guests ag ON b.id = ag.booking_id
LEFT JOIN booking_services bs ON b.id = bs.booking_id
GROUP BY b.id, pg.first_name, pg.last_name
ORDER BY b.created_at DESC;
```

---

**📚 Weitere Ressourcen:**
- [NestJS Dokumentation](https://docs.nestjs.com/)
- [React Query Dokumentation](https://tanstack.com/query/latest)
- [TypeORM Dokumentation](https://typeorm.io/)
- [Tailwind CSS Dokumentation](https://tailwindcss.com/docs)

*Version 1.0.0 - Dezember 2024* 