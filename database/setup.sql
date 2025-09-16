-- Rustico Buchungstool Database Setup
-- PostgreSQL Setup Script

-- Datenbank erstellen (falls nicht vorhanden)
-- CREATE DATABASE rustico_buchungstool;

-- Verbindung zur Datenbank herstellen
-- \c rustico_buchungstool;

-- Benutzer erstellen (optional)
-- CREATE USER rustico_user WITH PASSWORD 'your_secure_password';
-- GRANT ALL PRIVILEGES ON DATABASE rustico_buchungstool TO rustico_user;

-- Hinweis: Die Tabellen werden automatisch von TypeORM erstellt
-- wenn synchronize: true in der Konfiguration gesetzt ist

-- Standardleistungen (werden automatisch von der App erstellt)
-- Übernachtung: CHF 120.00 pro Nacht
-- Holz: CHF 25.00 pro Buchung  
-- Kurtaxe: CHF 3.50 pro Person pro Nacht

-- Admin-Login (Standard)
-- Benutzername: admin
-- Passwort: admin123
-- 
-- Diese können in der .env-Datei geändert werden:
-- ADMIN_USERNAME=your_username
-- ADMIN_PASSWORD=your_secure_password 