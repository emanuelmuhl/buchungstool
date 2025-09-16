# 📖 Benutzeranleitung

**Schritt-für-Schritt Anleitung für das Rustico Buchungstool**

Diese Anleitung führt Sie durch alle Funktionen der Anwendung und zeigt Ihnen, wie Sie das System effektiv nutzen können.

## 📋 Inhaltsverzeichnis

- [🚀 Erste Schritte](#-erste-schritte)
- [👥 Gästeverwaltung](#-gästeverwaltung)
- [🛠️ Leistungsverwaltung](#️-leistungsverwaltung)
- [📅 Buchungsverwaltung](#-buchungsverwaltung)
- [📊 Dashboard](#-dashboard)
- [📄 Reports & Export](#-reports--export)
- [💱 Währungsumstellung](#-währungsumstellung)
- [🔧 Einstellungen](#-einstellungen)
- [❓ Häufige Fragen](#-häufige-fragen)

## 🚀 Erste Schritte

### 1. Anmeldung
1. Öffnen Sie Ihren Browser und navigieren Sie zu: `http://localhost:3102`
2. Geben Sie Ihre Anmeldedaten ein:
   - **Benutzername**: `admin`
   - **Passwort**: `admin123`
3. Klicken Sie auf **"Anmelden"**

### 2. Navigation
Nach der Anmeldung sehen Sie das Hauptmenü mit folgenden Bereichen:
- **🏠 Dashboard** - Übersicht und Statistiken
- **👥 Gäste** - Gästeverwaltung
- **📅 Buchungen** - Buchungsverwaltung
- **🛠️ Leistungen** - Leistungsverwaltung
- **📄 Reports** - Berichte und Export

## 👥 Gästeverwaltung

### Neuen Gast erfassen

#### Schritt 1: Gästeseite öffnen
1. Klicken Sie im Hauptmenü auf **"Gäste"**
2. Sie sehen eine Liste aller erfassten Gäste
3. Klicken Sie auf **"Neuer Gast"** (grüner Button oben rechts)

#### Schritt 2: Gastdaten eingeben
Füllen Sie das Formular aus:

**Pflichtfelder:**
- **Vorname**: z.B. "Max"
- **Nachname**: z.B. "Mustermann"
- **Typ**: Wählen Sie "Erwachsener" oder "Kind"

**Optionale Felder:**
- **Adresse**: z.B. "Musterstraße 1"
- **Stadt**: z.B. "Zürich"
- **PLZ**: z.B. "8000"
- **Land**: z.B. "Schweiz"
- **Geburtsdatum**: z.B. "1990-01-01"
- **Nationalität**: z.B. "Schweiz"
- **Notizen**: Zusätzliche Informationen

#### Schritt 3: Gast speichern
1. Überprüfen Sie alle eingegebenen Daten
2. Klicken Sie auf **"Erstellen"**
3. Der Gast wird in der Liste angezeigt

### Gast bearbeiten
1. Klicken Sie in der Gästeliste auf das **Bearbeiten-Symbol** (Stift) neben dem gewünschten Gast
2. Ändern Sie die gewünschten Daten
3. Klicken Sie auf **"Aktualisieren"**

### Gast löschen
1. Klicken Sie in der Gästeliste auf das **Löschen-Symbol** (Papierkorb) neben dem gewünschten Gast
2. Bestätigen Sie die Löschung im Dialog
3. Der Gast wird aus der Liste entfernt

### Gästesuche
- Verwenden Sie das **Suchfeld** oben in der Gästeliste
- Die Suche funktioniert nach Vor- und Nachname
- Die Liste wird automatisch gefiltert

## 🛠️ Leistungsverwaltung

### Neue Leistung erstellen

#### Schritt 1: Leistungsseite öffnen
1. Klicken Sie im Hauptmenü auf **"Leistungen"**
2. Sie sehen eine Liste aller verfügbaren Leistungen
3. Klicken Sie auf **"Neue Leistung"** (grüner Button oben rechts)

#### Schritt 2: Leistungsdaten eingeben
Füllen Sie das Formular aus:

**Pflichtfelder:**
- **Name**: z.B. "Übernachtung"
- **Preis**: z.B. "120.00" (in CHF)
- **Typ**: Wählen Sie einen der drei Typen:
  - **Pro Nacht**: Wird pro Nacht berechnet
  - **Pro Person**: Wird pro Person pro Nacht berechnet
  - **Pro Buchung**: Einmalig pro Buchung

**Optionale Felder:**
- **Beschreibung**: z.B. "Übernachtung im Doppelzimmer"
- **Pflichtleistung**: Aktivieren Sie diese Option, wenn die Leistung immer inklusive ist
- **Sortierung**: Nummer für die Reihenfolge (0 = erste Position)

#### Schritt 3: Leistung speichern
1. Überprüfen Sie alle eingegebenen Daten
2. Klicken Sie auf **"Erstellen"**
3. Die Leistung wird in der Liste angezeigt

### Leistung bearbeiten
1. Klicken Sie in der Leistungsliste auf das **Bearbeiten-Symbol** (Stift) neben der gewünschten Leistung
2. Ändern Sie die gewünschten Daten
3. Klicken Sie auf **"Aktualisieren"**

### Leistung aktivieren/deaktivieren
1. Klicken Sie in der Leistungsliste auf den **Status-Button** neben der gewünschten Leistung
2. Der Status wechselt zwischen "Aktiv" (grün) und "Inaktiv" (grau)
3. Inaktive Leistungen können nicht mehr bei neuen Buchungen ausgewählt werden

### Inaktive Leistungen anzeigen
1. Aktivieren Sie die Checkbox **"Inaktive anzeigen"** oben in der Leistungsseite
2. Alle Leistungen (aktiv und inaktiv) werden angezeigt
3. Inaktive Leistungen haben einen grauen Hintergrund

### Leistung löschen
1. Klicken Sie in der Leistungsliste auf das **Löschen-Symbol** (Papierkorb) neben der gewünschten Leistung
2. Bestätigen Sie die Löschung im Dialog
3. Die Leistung wird aus der Liste entfernt

## 📅 Buchungsverwaltung

### Neue Buchung erstellen

#### Schritt 1: Buchungsseite öffnen
1. Klicken Sie im Hauptmenü auf **"Buchungen"**
2. Sie sehen eine Liste aller Buchungen
3. Klicken Sie auf **"Neue Buchung"** (grüner Button oben rechts)

#### Schritt 2: Grunddaten eingeben
Füllen Sie die ersten Felder aus:

**Pflichtfelder:**
- **Check-in**: Wählen Sie das Anreisedatum
- **Check-out**: Wählen Sie das Abreisedatum
- **Währung**: Wählen Sie "CHF" oder "EUR"

#### Schritt 3: Gäste auswählen
**Hauptgast:**
1. Wählen Sie aus dem Dropdown-Menü den Hauptgast aus
2. Die Liste zeigt alle verfügbaren Gäste

**Zusätzliche Gäste:**
1. Verwenden Sie das Suchfeld, um Gäste zu finden
2. Aktivieren Sie die Checkbox neben den gewünschten Gästen
3. Die ausgewählten Gäste werden als Tags angezeigt
4. Sie können Gäste durch Klick auf das X-Symbol entfernen

#### Schritt 4: Leistungen wählen
1. Aktivieren Sie die Checkbox neben den gewünschten Leistungen
2. Die **Live-Preisberechnung** wird automatisch aktualisiert
3. Der geschätzte Gesamtpreis wird in der gewählten Währung angezeigt

#### Schritt 5: Weitere Details
**Optionale Felder:**
- **Status**: Wählen Sie "Ausstehend", "Bestätigt", "Abgeschlossen" oder "Storniert"
- **Notizen**: Zusätzliche Informationen zur Buchung

#### Schritt 6: Buchung speichern
1. Überprüfen Sie alle eingegebenen Daten
2. Klicken Sie auf **"Erstellen"**
3. Die Buchung wird in der Liste angezeigt

### Buchung bearbeiten
1. Klicken Sie in der Buchungsliste auf das **Bearbeiten-Symbol** (Stift) neben der gewünschten Buchung
2. Ändern Sie die gewünschten Daten
3. Klicken Sie auf **"Aktualisieren"**

### Buchung löschen
1. Klicken Sie in der Buchungsliste auf das **Löschen-Symbol** (Papierkorb) neben der gewünschten Buchung
2. Bestätigen Sie die Löschung im Dialog
3. Die Buchung wird aus der Liste entfernt

### PDF-Rechnung herunterladen
1. Klicken Sie in der Buchungsliste auf das **PDF-Symbol** (Dokument) neben der gewünschten Buchung
2. Die Rechnung wird automatisch heruntergeladen
3. Die Rechnung enthält alle Buchungsdetails und die Preisaufschlüsselung

## 📊 Dashboard

### Übersicht
Das Dashboard zeigt Ihnen eine Zusammenfassung aller wichtigen Informationen:

**Statistiken:**
- **Kommende Buchungen**: Anzahl der Buchungen in den nächsten 30 Tagen
- **Gesamtbuchungen**: Alle Buchungen im System
- **Abgeschlossene Buchungen**: Buchungen mit Status "Abgeschlossen"

**Aktuelle Buchungen:**
- Liste der neuesten Buchungen
- Schnellzugriff auf Bearbeitung und PDF-Download

### Navigation
- Klicken Sie auf **"Alle anzeigen"** um zur vollständigen Buchungsliste zu gelangen
- Klicken Sie auf eine Buchung um sie zu bearbeiten

## 📄 Reports & Export

### Zeitraum-Report erstellen

#### Schritt 1: Reports-Seite öffnen
1. Klicken Sie im Hauptmenü auf **"Reports"**
2. Sie sehen die Report-Optionen

#### Schritt 2: Zeitraum wählen
1. Wählen Sie das **Startdatum** für den Berichtszeitraum
2. Wählen Sie das **Enddatum** für den Berichtszeitraum
3. Der Bericht wird automatisch generiert

#### Schritt 3: Export wählen
**PDF-Export:**
1. Klicken Sie auf **"PDF herunterladen"**
2. Eine übersichtliche Zusammenfassung wird heruntergeladen

**Excel-Export:**
1. Klicken Sie auf **"Excel herunterladen"**
2. Eine detaillierte Excel-Datei wird heruntergeladen
3. Ideal für kantonale Meldungen und Buchhaltung

### Einzelne Rechnungen
- Verwenden Sie das PDF-Symbol in der Buchungsliste
- Jede Buchung kann einzeln als Rechnung exportiert werden

## 💱 Währungsumstellung

### Währung bei Buchungserstellung
1. Wählen Sie beim Erstellen einer Buchung die gewünschte **Währung**
2. **CHF**: Schweizer Franken (Standard)
3. **EUR**: Euro (mit automatischer Umrechnung)

### Live-Preisberechnung
- Die Preisberechnung erfolgt automatisch in der gewählten Währung
- Bei EUR-Buchungen wird der umgerechnete Preis angezeigt
- Wechselkurse: 1 CHF = 0.95 EUR, 1 EUR = 1.05 CHF

### Buchungsliste
- Jede Buchung zeigt den Preis in der gewählten Währung
- EUR-Buchungen sind mit einem Währungsindikator gekennzeichnet
- Die Währung wird auch in den PDF-Rechnungen verwendet

### Reports
- Zeitraum-Reports werden in der jeweiligen Buchungswährung erstellt
- Excel-Export enthält alle Währungsinformationen

## 🔧 Einstellungen

### Benutzerprofil
- Aktuell: Standard-Anmeldedaten (admin/admin123)
- Geplant: Individuelle Benutzerprofile

### Systemeinstellungen
- Wechselkurse können in der Zukunft angepasst werden
- Standardwährung ist CHF
- Alle Preise werden in CHF gespeichert und bei Bedarf umgerechnet

## ❓ Häufige Fragen

### Wie kann ich eine Buchung stornieren?
1. Bearbeiten Sie die Buchung
2. Ändern Sie den Status auf "Storniert"
3. Speichern Sie die Änderungen

### Wie funktioniert die Preisberechnung?
- **Pro Nacht**: Preis × Anzahl Nächte
- **Pro Person**: Preis × Anzahl Gäste × Anzahl Nächte
- **Pro Buchung**: Preis × 1

### Kann ich mehrere Gäste zu einer Buchung hinzufügen?
Ja, wählen Sie einen Hauptgast und beliebig viele zusätzliche Gäste aus.

### Wie kann ich eine Rechnung herunterladen?
Klicken Sie auf das PDF-Symbol in der Buchungsliste neben der gewünschten Buchung.

### Was passiert mit inaktiven Leistungen?
Inaktive Leistungen können nicht mehr bei neuen Buchungen ausgewählt werden, bleiben aber in bestehenden Buchungen erhalten.

### Wie kann ich zwischen CHF und EUR wechseln?
Wählen Sie beim Erstellen einer Buchung die gewünschte Währung aus dem Dropdown-Menü.

### Kann ich Buchungen nachträglich bearbeiten?
Ja, klicken Sie auf das Bearbeiten-Symbol in der Buchungsliste.

### Wie funktioniert die Gästesuche?
Geben Sie Vor- oder Nachname in das Suchfeld ein, die Liste wird automatisch gefiltert.

### Was bedeuten die verschiedenen Buchungsstatus?
- **Ausstehend**: Buchung ist erstellt, aber noch nicht bestätigt
- **Bestätigt**: Buchung ist bestätigt und gültig
- **Abgeschlossen**: Aufenthalt ist beendet
- **Storniert**: Buchung wurde storniert

---

**📞 Support**
Bei Fragen oder Problemen wenden Sie sich an den Systemadministrator.

*Version 1.0.0 - Dezember 2024* 