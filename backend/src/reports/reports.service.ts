import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Booking } from '../bookings/entities/booking.entity';
import { Guest } from '../guests/entities/guest.entity';
import { Service } from '../services/entities/service.entity';
import { SettingsService } from '../settings/settings.service';
import * as puppeteer from 'puppeteer';
import * as ExcelJS from 'exceljs';
import { format as formatDate } from 'date-fns';
import { de } from 'date-fns/locale';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    @InjectRepository(Guest)
    private guestsRepository: Repository<Guest>,
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
    private settingsService: SettingsService,
  ) {}

  async generateBookingConfirmationPDF(bookingId: string): Promise<Buffer> {
    try {
      console.log('Generating booking confirmation PDF for booking:', bookingId);
      
      const booking = await this.bookingsRepository.findOne({
        where: { id: bookingId },
        relations: ['primaryGuest', 'additionalGuests', 'services'],
      });

      if (!booking) {
        throw new Error('Buchung nicht gefunden');
      }

      if (!booking.primaryGuest) {
        console.error('Primary Guest not found for booking:', booking.id);
        throw new Error('Primary Guest nicht gefunden');
      }

      if (!booking.checkIn || !booking.checkOut) {
        console.error('Missing dates for booking:', booking.id);
        throw new Error('Check-in oder Check-out Datum fehlt');
      }

      console.log('Booking found for confirmation:', { 
        id: booking.id, 
        primaryGuest: booking.primaryGuest?.firstName,
        servicesCount: booking.services?.length || 0 
      });

      const html = await this.generateBookingConfirmationHTML(booking);
      console.log('Confirmation HTML generated, creating PDF...');
      
      const pdf = await this.generatePDF(html);
      console.log('Confirmation PDF generated successfully, size:', pdf.length);
      
      return pdf;
    } catch (error) {
      console.error('Error generating booking confirmation PDF:', error);
      throw error;
    }
  }

  async generateInvoicePDF(bookingId: string): Promise<Buffer> {
    try {
      console.log('Generating invoice PDF for booking:', bookingId);
      
      const booking = await this.bookingsRepository.findOne({
        where: { id: bookingId },
        relations: ['primaryGuest', 'additionalGuests', 'services'],
      });

      if (!booking) {
        throw new Error('Buchung nicht gefunden');
      }

      if (!booking.primaryGuest) {
        console.error('Primary Guest not found for booking:', booking.id);
        throw new Error('Primary Guest nicht gefunden');
      }

      // Sicherstellen, dass alle erforderlichen Felder vorhanden sind
      if (!booking.checkIn || !booking.checkOut) {
        console.error('Missing dates for booking:', booking.id);
        throw new Error('Check-in oder Check-out Datum fehlt');
      }

      console.log('Booking found:', { 
        id: booking.id, 
        primaryGuest: booking.primaryGuest?.firstName,
        servicesCount: booking.services?.length || 0 
      });

      const html = await this.generateInvoiceHTML(booking);
      console.log('HTML generated, creating PDF...');
      
      const pdf = await this.generatePDF(html);
      console.log('PDF generated successfully, size:', pdf.length);
      
      return pdf;
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      throw error;
    }
  }

  async generatePeriodReport(startDate: Date, endDate: Date, format: 'pdf' | 'excel'): Promise<Buffer> {
    try {
      console.log('Generating period report:', { startDate, endDate, format });
      
      const bookings = await this.bookingsRepository.find({
        where: {
          checkIn: Between(startDate, endDate),
        },
        relations: ['primaryGuest', 'additionalGuests', 'services'],
        order: { checkIn: 'ASC' },
      });

      // Manuelle Überprüfung der Beziehungen
      for (const booking of bookings) {
        if (!booking.additionalGuests || booking.additionalGuests.length === 0) {
          console.log(`No additionalGuests relation for booking ${booking.id}, trying manual load...`);
          // Manuell zusätzliche Gäste laden
          const additionalGuests = await this.guestsRepository
            .createQueryBuilder('guest')
            .innerJoin('booking_additional_guests_guest', 'bag', 'bag.guestId = guest.id')
            .where('bag.bookingId = :bookingId', { bookingId: booking.id })
            .getMany();
          
          console.log('Manual query result:', additionalGuests.map(g => g.firstName));
          
          console.log(`Manually loaded ${additionalGuests.length} additional guests for booking ${booking.id}`);
          booking.additionalGuests = additionalGuests;
        }
      }

      console.log('Found bookings:', bookings.length);
      
      // Debug: Überprüfe jede Buchung auf zusätzliche Gäste
      for (const booking of bookings) {
        console.log(`Booking ${booking.id}:`, {
          primaryGuest: booking.primaryGuest?.firstName,
          additionalGuestsCount: booking.additionalGuests?.length || 0,
          additionalGuests: booking.additionalGuests?.map(g => g.firstName) || []
        });
      }

      if (bookings.length === 0) {
        // Erstelle einen leeren Report
        const emptyHTML = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>Leerer Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              .header { text-align: center; margin-bottom: 30px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Rustico Buchungstool</h1>
              <h2>Zeitraum-Report</h2>
              <p>Zeitraum: ${formatDate(startDate, 'dd.MM.yyyy', { locale: de })} - ${formatDate(endDate, 'dd.MM.yyyy', { locale: de })}</p>
              <p>Keine Buchungen im gewählten Zeitraum gefunden.</p>
            </div>
          </body>
          </html>
        `;
        return this.generatePDF(emptyHTML);
      }

      if (format === 'pdf') {
        const html = await this.generatePeriodReportHTML(bookings, startDate, endDate);
        return this.generatePDF(html);
      } else {
        return this.generateExcelReport(bookings, startDate, endDate);
      }
    } catch (error) {
      console.error('Error generating period report:', error);
      throw error;
    }
  }

  private async generateBookingConfirmationHTML(booking: Booking): Promise<string> {
    try {
      console.log('Generating confirmation HTML for booking:', booking.id);
      
      // Einstellungen laden
      const settings = await this.settingsService.getSettings();
      
      const checkIn = formatDate(new Date(booking.checkIn), 'dd.MM.yyyy', { locale: de });
      const checkOut = formatDate(new Date(booking.checkOut), 'dd.MM.yyyy', { locale: de });
      const numberOfNights = Math.ceil(
        (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24)
      );

      let servicesHTML = '';
      let totalAmount = 0;

      if (booking.services?.length) {
        console.log('Processing services for confirmation:', booking.services.length);
        for (const service of booking.services) {
          let serviceAmount = 0;
          let description = '';

          const servicePrice = typeof service.price === 'string' ? parseFloat(service.price) : service.price;

          switch (service.type) {
            case 'nightly':
              serviceAmount = servicePrice * numberOfNights;
              description = `${service.name} (${numberOfNights} Nächte)`;
              break;
            case 'per_person':
              const totalGuests = 1 + (booking.additionalGuests?.length || 0);
              serviceAmount = servicePrice * totalGuests * numberOfNights;
              description = `${service.name} (${totalGuests} Personen × ${numberOfNights} Nächte)`;
              break;
            case 'per_booking':
              serviceAmount = servicePrice;
              description = service.name;
              break;
            default:
              serviceAmount = servicePrice;
              description = service.name;
              break;
          }

          totalAmount += serviceAmount;
          servicesHTML += `
            <tr>
              <td>${service.name || 'Unbekannte Leistung'}</td>
              <td>${description}</td>
              <td style="text-align: right;">CHF ${serviceAmount.toFixed(2)}</td>
            </tr>
          `;
        }
      } else {
        console.log('No services found for booking confirmation');
        servicesHTML = '<tr><td colspan="3">Keine zusätzlichen Leistungen gebucht</td></tr>';
      }

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Buchungsbestätigung - ${booking.primaryGuest.firstName} ${booking.primaryGuest.lastName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
            
            body { 
              font-family: 'Roboto', Arial, sans-serif; 
              margin: 0; 
              padding: 40px;
              background: linear-gradient(135deg, #e8f5e8 0%, #a8d8a8 100%);
              color: #2c3e50;
            }
            
            .confirmation-container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              border-radius: 15px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              overflow: hidden;
            }
            
            .header {
              background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
              color: white;
              padding: 40px;
              text-align: center;
              position: relative;
            }
            
            .header::before {
              content: '🏔️';
              position: absolute;
              top: 20px;
              left: 30px;
              font-size: 30px;
              opacity: 0.7;
            }
            
            .header::after {
              content: '🌲';
              position: absolute;
              top: 20px;
              right: 30px;
              font-size: 30px;
              opacity: 0.7;
            }
            
            .header h1 {
              margin: 0 0 10px 0;
              font-size: 2.5em;
              font-weight: 300;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            
            .header h2 {
              margin: 0 0 20px 0;
              font-size: 1.8em;
              font-weight: 400;
              opacity: 0.9;
            }
            
            .header p {
              margin: 0;
              font-size: 1.1em;
              opacity: 0.8;
            }
            
            .content {
              padding: 40px;
            }
            
            .confirmation-badge {
              background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
              color: white;
              padding: 20px;
              border-radius: 50px;
              text-align: center;
              margin-bottom: 30px;
              font-size: 1.3em;
              font-weight: 500;
            }
            
            .confirmation-badge::before {
              content: '✅';
              margin-right: 10px;
              font-size: 1.2em;
            }
            
            .booking-info {
              background: #e8f5e8;
              padding: 25px;
              border-radius: 10px;
              margin-bottom: 30px;
              border-left: 5px solid #28a745;
            }
            
            .booking-info p {
              margin: 8px 0;
              font-size: 1.1em;
            }
            
            .guest-info {
              background: #f8f9fa;
              padding: 25px;
              border-radius: 10px;
              margin-bottom: 30px;
              border-left: 5px solid #667eea;
            }
            
            .guest-info h3 {
              margin: 0 0 15px 0;
              color: #2d5016;
              font-size: 1.3em;
              display: flex;
              align-items: center;
            }
            
            .guest-info h3::before {
              content: '👤';
              margin-right: 10px;
            }
            
            .services-table {
              width: 100%;
              border-collapse: collapse;
              margin: 30px 0;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            }
            
            .services-table th {
              background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
              color: white;
              padding: 15px;
              text-align: left;
              font-weight: 500;
              font-size: 1.1em;
            }
            
            .services-table td {
              padding: 15px;
              border-bottom: 1px solid #eee;
              font-size: 1em;
            }
            
            .services-table tr:nth-child(even) {
              background-color: #f8f9fa;
            }
            
            .services-table tr:hover {
              background-color: #e8f5e8;
            }
            
            .total-section {
              background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
              color: white;
              padding: 25px;
              border-radius: 10px;
              text-align: right;
              margin: 30px 0;
            }
            
            .total-section p {
              margin: 0;
              font-size: 1.5em;
              font-weight: 500;
            }
            
            .welcome-section {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              border-radius: 10px;
              margin: 30px 0;
              text-align: center;
            }
            
            .welcome-section h3 {
              margin: 0 0 15px 0;
              font-size: 1.5em;
            }
            
            .footer {
              background: #2c3e50;
              color: white;
              padding: 30px;
              text-align: center;
              position: relative;
            }
            
            .footer::before {
              content: '🏡';
              position: absolute;
              top: 20px;
              left: 30px;
              font-size: 25px;
              opacity: 0.7;
            }
            
            .footer::after {
              content: '🌿';
              position: absolute;
              top: 20px;
              right: 30px;
              font-size: 25px;
              opacity: 0.7;
            }
            
            .footer p {
              margin: 10px 0;
              line-height: 1.6;
            }
            
            .checkin-info {
              background: rgba(255,255,255,0.1);
              padding: 20px;
              border-radius: 8px;
              margin-top: 20px;
            }
            
            strong { color: #2c3e50; }
          </style>
        </head>
        <body>
          <div class="confirmation-container">
            <div class="header">
              ${settings.logoUrl ? `<img src="${settings.logoUrl}" alt="Logo" style="max-width: 200px; max-height: 100px; margin-bottom: 20px; border-radius: 8px;">` : ''}
              <h1>${settings.companyName}</h1>
              <h2>Buchungsbestätigung</h2>
              <p>${settings.address}</p>
            </div>

            <div class="content">
              <div class="confirmation-badge">
                Deine Buchung ist bestätigt!
              </div>

              <div class="booking-info">
                <p><strong>Buchungsnummer:</strong> ${booking.id.substring(0, 8).toUpperCase()}</p>
                <p><strong>Bestätigt am:</strong> ${formatDate(new Date(), 'dd.MM.yyyy', { locale: de })}</p>
                <p><strong>Aufenthalt:</strong> ${checkIn} - ${checkOut} (${numberOfNights} Nächte)</p>
              </div>

              <div class="guest-info">
                <h3>Liebe/r ${booking.primaryGuest.firstName}</h3>
                <p>Wir freuen uns riesig auf deinen Besuch in unserem gemütlichen Rustico! 🏡</p>
                <p><strong>${booking.primaryGuest.firstName} ${booking.primaryGuest.lastName}</strong></p>
                ${booking.primaryGuest.address ? `<p>${booking.primaryGuest.address}</p>` : ''}
                ${booking.primaryGuest.city ? `<p>${booking.primaryGuest.postalCode} ${booking.primaryGuest.city}</p>` : ''}
                ${booking.primaryGuest.country ? `<p>${booking.primaryGuest.country}</p>` : ''}
                ${booking.additionalGuests?.length ? `<p><strong>Begleitende Gäste:</strong> ${booking.additionalGuests.map(g => `${g.firstName} ${g.lastName}`).join(', ')}</p>` : ''}
              </div>

              <div class="welcome-section">
                <h3>🌲 Willkommen im Rustico Tessin! 🌲</h3>
                <p>Erlebe unvergessliche Momente in der wunderschönen Natur des Tessins. Unser gemütliches Rustico bietet dir die perfekte Auszeit vom Alltag - umgeben von Bergen, Wäldern und der beruhigenden Stille der Natur.</p>
              </div>

              <table class="services-table">
                <thead>
                  <tr>
                    <th>🏔️ Leistung</th>
                    <th>📋 Beschreibung</th>
                    <th>💰 Betrag</th>
                  </tr>
                </thead>
                <tbody>
                  ${servicesHTML}
                </tbody>
              </table>

              ${totalAmount > 0 ? `
              <div class="total-section">
                <p>Gesamtbetrag: CHF ${totalAmount.toFixed(2)}</p>
              </div>
              ` : ''}
            </div>

            <div class="footer">
              <p style="font-size: 1.2em; font-weight: 500; margin-bottom: 20px;">
                Wir können es kaum erwarten, dich begrüßen zu dürfen! 🎉
              </p>
              <div class="checkin-info">
                <p><strong>Check-in:</strong> Ab 15:00 Uhr am ${checkIn}</p>
                <p><strong>Check-out:</strong> Bis 11:00 Uhr am ${checkOut}</p>
                <p><strong>Kontakt:</strong> ${settings.phone || 'Siehe Einstellungen'}</p>
                <p><strong>E-Mail:</strong> ${settings.email || 'Siehe Einstellungen'}</p>
              </div>
              <p style="margin-top: 20px; font-size: 0.9em; opacity: 0.8;">
                Genieße die Ruhe der Berge und lass die Seele baumeln! 🏔️✨
              </p>
            </div>
          </div>
        </body>
        </html>
      `;
    } catch (error) {
      console.error('Error generating confirmation HTML:', error);
      throw new Error(`Bestätigungs-HTML-Generierung fehlgeschlagen: ${error.message}`);
    }
  }

  private async generateInvoiceHTML(booking: Booking): Promise<string> {
    try {
      console.log('Generating HTML for booking:', booking.id);
      
      // Einstellungen laden
      const settings = await this.settingsService.getSettings();
      
      const checkIn = formatDate(new Date(booking.checkIn), 'dd.MM.yyyy', { locale: de });
      const checkOut = formatDate(new Date(booking.checkOut), 'dd.MM.yyyy', { locale: de });
      const numberOfNights = Math.ceil(
        (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24)
      );

      let servicesHTML = '';
      let totalAmount = 0;

      if (booking.services?.length) {
        console.log('Processing services:', booking.services.length);
        for (const service of booking.services) {
          let serviceAmount = 0;
          let description = '';

          // Sicherstellen, dass service.price eine Zahl ist
          const servicePrice = typeof service.price === 'string' ? parseFloat(service.price) : service.price;

          switch (service.type) {
            case 'nightly':
              serviceAmount = servicePrice * numberOfNights;
              description = `${service.name} (${numberOfNights} Nächte)`;
              break;
            case 'per_person':
              const totalGuests = 1 + (booking.additionalGuests?.length || 0);
              serviceAmount = servicePrice * totalGuests * numberOfNights;
              description = `${service.name} (${totalGuests} Personen × ${numberOfNights} Nächte)`;
              break;
            case 'per_booking':
              serviceAmount = servicePrice;
              description = service.name;
              break;
            default:
              serviceAmount = servicePrice;
              description = service.name;
              break;
          }

          totalAmount += serviceAmount;
          servicesHTML += `
            <tr>
              <td>${service.name || 'Unbekannte Leistung'}</td>
              <td>${description}</td>
              <td style="text-align: right;">CHF ${serviceAmount.toFixed(2)}</td>
            </tr>
          `;
        }
      } else {
        console.log('No services found for booking');
        servicesHTML = '<tr><td colspan="3">Keine Leistungen</td></tr>';
      }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Rechnung - ${booking.primaryGuest.firstName} ${booking.primaryGuest.lastName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
          
          body { 
            font-family: 'Roboto', Arial, sans-serif; 
            margin: 0; 
            padding: 40px;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            color: #2c3e50;
          }
          
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
            position: relative;
          }
          
          .header::before {
            content: '🏔️';
            position: absolute;
            top: 20px;
            left: 30px;
            font-size: 30px;
            opacity: 0.7;
          }
          
          .header::after {
            content: '🌲';
            position: absolute;
            top: 20px;
            right: 30px;
            font-size: 30px;
            opacity: 0.7;
          }
          
          .header h1 {
            margin: 0 0 10px 0;
            font-size: 2.5em;
            font-weight: 300;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          }
          
          .header h2 {
            margin: 0 0 20px 0;
            font-size: 1.8em;
            font-weight: 400;
            opacity: 0.9;
          }
          
          .header p {
            margin: 0;
            font-size: 1.1em;
            opacity: 0.8;
          }
          
          .content {
            padding: 40px;
          }
          
          .invoice-info {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 10px;
            margin-bottom: 30px;
            border-left: 5px solid #667eea;
          }
          
          .invoice-info p {
            margin: 8px 0;
            font-size: 1.1em;
          }
          
          .guest-info {
            background: #e8f5e8;
            padding: 25px;
            border-radius: 10px;
            margin-bottom: 30px;
            border-left: 5px solid #28a745;
          }
          
          .guest-info h3 {
            margin: 0 0 15px 0;
            color: #2d5016;
            font-size: 1.3em;
            display: flex;
            align-items: center;
          }
          
          .guest-info h3::before {
            content: '👤';
            margin-right: 10px;
          }
          
          .services-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
          }
          
          .services-table th {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 500;
            font-size: 1.1em;
          }
          
          .services-table td {
            padding: 15px;
            border-bottom: 1px solid #eee;
            font-size: 1em;
          }
          
          .services-table tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          
          .services-table tr:hover {
            background-color: #e3f2fd;
          }
          
          .total-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px;
            border-radius: 10px;
            text-align: right;
            margin: 30px 0;
          }
          
          .total-section p {
            margin: 0;
            font-size: 1.5em;
            font-weight: 500;
          }
          
          .footer {
            background: #2c3e50;
            color: white;
            padding: 30px;
            text-align: center;
            position: relative;
          }
          
          .footer::before {
            content: '🏡';
            position: absolute;
            top: 20px;
            left: 30px;
            font-size: 25px;
            opacity: 0.7;
          }
          
          .footer::after {
            content: '🌿';
            position: absolute;
            top: 20px;
            right: 30px;
            font-size: 25px;
            opacity: 0.7;
          }
          
          .footer p {
            margin: 10px 0;
            line-height: 1.6;
          }
          
          .footer .thank-you {
            font-size: 1.2em;
            font-weight: 500;
            margin-bottom: 20px;
          }
          
          .payment-info {
            background: rgba(255,255,255,0.1);
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
          }
          
          strong { color: #2c3e50; }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            ${settings.logoUrl ? `<img src="${settings.logoUrl}" alt="Logo" style="max-width: 200px; max-height: 100px; margin-bottom: 20px; border-radius: 8px;">` : ''}
            <h1>${settings.companyName}</h1>
            <h2>Rechnung</h2>
            <p>${settings.address}</p>
          </div>

          <div class="content">
            <div class="invoice-info">
              <p><strong>Rechnungsnummer:</strong> ${booking.id.substring(0, 8).toUpperCase()}</p>
              <p><strong>Datum:</strong> ${formatDate(new Date(), 'dd.MM.yyyy', { locale: de })}</p>
              <p><strong>Aufenthalt:</strong> ${checkIn} - ${checkOut} (${numberOfNights} Nächte)</p>
            </div>

            <div class="guest-info">
              <h3>Liebe/r ${booking.primaryGuest.firstName}</h3>
              <p><strong>${booking.primaryGuest.firstName} ${booking.primaryGuest.lastName}</strong></p>
              ${booking.primaryGuest.address ? `<p>${booking.primaryGuest.address}</p>` : ''}
              ${booking.primaryGuest.city ? `<p>${booking.primaryGuest.postalCode} ${booking.primaryGuest.city}</p>` : ''}
              ${booking.primaryGuest.country ? `<p>${booking.primaryGuest.country}</p>` : ''}
              ${booking.additionalGuests?.length ? `<p><strong>Begleitende Gäste:</strong> ${booking.additionalGuests.map(g => `${g.firstName} ${g.lastName}`).join(', ')}</p>` : ''}
            </div>

            <table class="services-table">
              <thead>
                <tr>
                  <th>🏔️ Leistung</th>
                  <th>📋 Beschreibung</th>
                  <th>💰 Betrag</th>
                </tr>
              </thead>
              <tbody>
                ${servicesHTML}
              </tbody>
            </table>

            <div class="total-section">
              <p>Gesamtbetrag: CHF ${totalAmount.toFixed(2)}</p>
            </div>
          </div>

          <div class="footer">
            <p class="thank-you">Vielen Dank für deinen wundervollen Aufenthalt in unserem Rustico! 🌲</p>
            <div class="payment-info">
              <p>Bitte überweise den Betrag auf folgendes Konto:</p>
              <p><strong>IBAN:</strong> ${settings.iban}</p>
              <p><strong>Verwendungszweck:</strong> ${booking.id.substring(0, 8).toUpperCase()}</p>
            </div>
            <p style="margin-top: 20px; font-size: 0.9em; opacity: 0.8;">
              Wir hoffen, du hattest eine erholsame Zeit in der Natur und kommst bald wieder! 🏡✨
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
    } catch (error) {
      console.error('Error generating HTML:', error);
      throw new Error(`HTML-Generierung fehlgeschlagen: ${error.message}`);
    }
  }

  private async generatePeriodReportHTML(bookings: Booking[], startDate: Date, endDate: Date): Promise<string> {
    // Einstellungen laden
    const settings = await this.settingsService.getSettings();
    let bookingsHTML = '';
    let totalRevenue = 0;
    let allGuests = [];

    // Alle Gäste sammeln
    for (const booking of bookings) {
      const checkIn = formatDate(new Date(booking.checkIn), 'dd.MM.yyyy', { locale: de });
      const checkOut = formatDate(new Date(booking.checkOut), 'dd.MM.yyyy', { locale: de });
      const revenue = booking.totalAmount || 0;
      totalRevenue += revenue;

      console.log(`Processing booking ${booking.id}:`, {
        primaryGuest: booking.primaryGuest?.firstName,
        additionalGuestsCount: booking.additionalGuests?.length || 0,
        additionalGuests: booking.additionalGuests?.map(g => g.firstName) || []
      });

      // Hauptgast hinzufügen
      allGuests.push({
        name: `${booking.primaryGuest.firstName} ${booking.primaryGuest.lastName}`,
        registrationNumber: booking.primaryGuest.registrationNumber || '-',
        nationality: booking.primaryGuest.nationality || '-',
        birthDate: booking.primaryGuest.birthDate ? formatDate(new Date(booking.primaryGuest.birthDate), 'dd.MM.yyyy', { locale: de }) : '-',
        checkIn: checkIn,
        checkOut: checkOut,
        amount: typeof revenue === 'number' ? revenue : 0,
        role: 'Hauptgast'
      });

      // Zusätzliche Gäste hinzufügen
      if (booking.additionalGuests && booking.additionalGuests.length > 0) {
        console.log(`Adding ${booking.additionalGuests.length} additional guests for booking ${booking.id}`);
        for (const guest of booking.additionalGuests) {
          console.log(`Adding additional guest: ${guest.firstName} ${guest.lastName}`);
          allGuests.push({
            name: `${guest.firstName} ${guest.lastName}`,
            registrationNumber: guest.registrationNumber || '-',
            nationality: guest.nationality || '-',
            birthDate: guest.birthDate ? formatDate(new Date(guest.birthDate), 'dd.MM.yyyy', { locale: de }) : '-',
            checkIn: checkIn,
            checkOut: checkOut,
            amount: '-',
            role: 'Zusatzgast'
          });
        }
      } else {
        console.log(`No additional guests for booking ${booking.id}`);
      }
    }

    console.log(`Total guests collected: ${allGuests.length}`);
    console.log('All guests:', allGuests.map(g => `${g.name} (${g.role})`));

    // Gäste nach Namen sortieren
    allGuests.sort((a, b) => a.name.localeCompare(b.name));

    // HTML für alle Gäste generieren
    for (const guest of allGuests) {
      bookingsHTML += `
        <tr>
          <td>${guest.name} (${guest.role})</td>
          <td>${guest.registrationNumber}</td>
          <td>${guest.nationality}</td>
          <td>${guest.birthDate}</td>
          <td>${guest.checkIn}</td>
          <td>${guest.checkOut}</td>
          <td style="text-align: right;">${typeof guest.amount === 'number' ? `CHF ${guest.amount.toFixed(2)}` : guest.amount}</td>
        </tr>
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Jahresreport ${formatDate(startDate, 'yyyy', { locale: de })}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { margin-bottom: 30px; }
          .bookings-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .bookings-table th, .bookings-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .bookings-table th { background-color: #f2f2f2; }
          .total { font-weight: bold; font-size: 18px; text-align: right; }
        </style>
      </head>
      <body>
        <div class="header">
          ${settings.logoUrl ? `<img src="${settings.logoUrl}" alt="Logo" style="max-width: 200px; max-height: 100px; margin-bottom: 20px;">` : ''}
          <h1>${settings.companyName}</h1>
          <h2>Jahresreport ${formatDate(startDate, 'yyyy', { locale: de })}</h2>
          <p>${settings.address}</p>
        </div>

        <div class="summary">
          <p><strong>Zeitraum:</strong> ${formatDate(startDate, 'dd.MM.yyyy', { locale: de })} - ${formatDate(endDate, 'dd.MM.yyyy', { locale: de })}</p>
          <p><strong>Anzahl Buchungen:</strong> ${bookings.length}</p>
          <p><strong>Anzahl Personen:</strong> ${allGuests.length}</p>
          <p><strong>Gesamteinnahmen:</strong> CHF ${totalRevenue.toFixed(2)}</p>
        </div>

        <table class="bookings-table">
          <thead>
            <tr>
              <th>Gast (Rolle)</th>
              <th>Meldescheinnummer</th>
              <th>Nationalität</th>
              <th>Geburtsdatum</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Betrag</th>
            </tr>
          </thead>
          <tbody>
            ${bookingsHTML}
          </tbody>
        </table>

        <div class="total">
          <p>Gesamteinnahmen: CHF ${totalRevenue.toFixed(2)}</p>
        </div>
      </body>
      </html>
    `;
  }

  private async generateExcelReport(bookings: Booking[], startDate: Date, endDate: Date): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Buchungen');

    // Headers
    worksheet.columns = [
      { header: 'Gast (Rolle)', key: 'guest', width: 25 },
      { header: 'Meldescheinnummer', key: 'registrationNumber', width: 20 },
      { header: 'Nationalität', key: 'nationality', width: 15 },
      { header: 'Geburtsdatum', key: 'birthDate', width: 15 },
      { header: 'Check-in', key: 'checkIn', width: 15 },
      { header: 'Check-out', key: 'checkOut', width: 15 },
      { header: 'Betrag (CHF)', key: 'amount', width: 15 },
    ];

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // Add data
    let totalRevenue = 0;
    let allGuests = [];

    // Alle Gäste sammeln
    for (const booking of bookings) {
      const revenue = booking.totalAmount || 0;
      totalRevenue += revenue;

      console.log(`Excel: Processing booking ${booking.id}:`, {
        primaryGuest: booking.primaryGuest?.firstName,
        additionalGuestsCount: booking.additionalGuests?.length || 0,
        additionalGuests: booking.additionalGuests?.map(g => g.firstName) || []
      });

      // Hauptgast hinzufügen
      allGuests.push({
        guest: `${booking.primaryGuest.firstName} ${booking.primaryGuest.lastName} (Hauptgast)`,
        registrationNumber: booking.primaryGuest.registrationNumber || '-',
        nationality: booking.primaryGuest.nationality || '-',
        birthDate: booking.primaryGuest.birthDate ? formatDate(new Date(booking.primaryGuest.birthDate), 'dd.MM.yyyy', { locale: de }) : '-',
        checkIn: formatDate(new Date(booking.checkIn), 'dd.MM.yyyy', { locale: de }),
        checkOut: formatDate(new Date(booking.checkOut), 'dd.MM.yyyy', { locale: de }),
        amount: typeof revenue === 'number' ? revenue : 0,
      });

      // Zusätzliche Gäste hinzufügen
      if (booking.additionalGuests && booking.additionalGuests.length > 0) {
        console.log(`Excel: Adding ${booking.additionalGuests.length} additional guests for booking ${booking.id}`);
        for (const guest of booking.additionalGuests) {
          console.log(`Excel: Adding additional guest: ${guest.firstName} ${guest.lastName}`);
          allGuests.push({
            guest: `${guest.firstName} ${guest.lastName} (Zusatzgast)`,
            registrationNumber: guest.registrationNumber || '-',
            nationality: guest.nationality || '-',
            birthDate: guest.birthDate ? formatDate(new Date(guest.birthDate), 'dd.MM.yyyy', { locale: de }) : '-',
            checkIn: formatDate(new Date(booking.checkIn), 'dd.MM.yyyy', { locale: de }),
            checkOut: formatDate(new Date(booking.checkOut), 'dd.MM.yyyy', { locale: de }),
            amount: '-',
          });
        }
      } else {
        console.log(`Excel: No additional guests for booking ${booking.id}`);
      }
    }

    console.log(`Excel: Total guests collected: ${allGuests.length}`);
    console.log('Excel: All guests:', allGuests.map(g => g.guest));

    // Gäste nach Namen sortieren
    allGuests.sort((a, b) => a.guest.localeCompare(b.guest));

    // Alle Gäste zum Excel hinzufügen
    for (const guest of allGuests) {
      worksheet.addRow(guest);
    }

    // Add summary rows
    worksheet.addRow({}); // Leerzeile
    
    const summaryRow1 = worksheet.addRow({
      guest: 'ZUSAMMENFASSUNG',
      registrationNumber: '',
      nationality: '',
      birthDate: '',
      checkIn: '',
      checkOut: '',
      amount: '',
    });
    summaryRow1.font = { bold: true };
    summaryRow1.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };
    
    const summaryRow2 = worksheet.addRow({
      guest: `Anzahl Buchungen: ${bookings.length}`,
      registrationNumber: '',
      nationality: '',
      birthDate: '',
      checkIn: '',
      checkOut: '',
      amount: '',
    });
    
    const summaryRow3 = worksheet.addRow({
      guest: `Anzahl Personen: ${allGuests.length}`,
      registrationNumber: '',
      nationality: '',
      birthDate: '',
      checkIn: '',
      checkOut: '',
      amount: '',
    });
    
    // Add total row
    const totalRow = worksheet.addRow({
      guest: 'GESAMTEINNAHMEN',
      registrationNumber: '',
      nationality: '',
      birthDate: '',
      checkIn: '',
      checkOut: '',
      amount: totalRevenue,
    });
    totalRow.font = { bold: true };
    totalRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF0F0F0' },
    };

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  private async generatePDF(html: string): Promise<Buffer> {
    let browser;
    try {
      console.log('Launching Puppeteer browser...');
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote',
          '--single-process'
        ],
      });

      console.log('Creating new page...');
      const page = await browser.newPage();
      
      console.log('Setting content...');
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      console.log('Generating PDF...');
      const pdf = await page.pdf({
        format: 'A4',
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm',
        },
        printBackground: true,
      });

      console.log('PDF generated, converting to Buffer...');
      return Buffer.from(pdf);
    } catch (error) {
      console.error('Error in generatePDF:', error);
      throw new Error(`PDF-Generierung fehlgeschlagen: ${error.message}`);
    } finally {
      if (browser) {
        console.log('Closing browser...');
        await browser.close();
      }
    }
  }
} 