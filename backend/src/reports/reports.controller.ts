import { Controller, Get, Post, Body, Param, Query, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('confirmation/:bookingId')
  @UseGuards(JwtAuthGuard)
  async generateBookingConfirmationPDF(@Param('bookingId') bookingId: string, @Res() res: Response) {
    try {
      console.log('Booking confirmation PDF request for booking:', bookingId);
      
      const pdfBuffer = await this.reportsService.generateBookingConfirmationPDF(bookingId);
      console.log('Booking confirmation PDF generated successfully, size:', pdfBuffer.length);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="buchungsbestaetigung-${bookingId.substring(0, 8)}.pdf"`,
        'Content-Length': pdfBuffer.length,
      });
      
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error in booking confirmation controller:', error);
      res.status(404).json({ message: error.message });
    }
  }

  @Get('invoice/:bookingId')
  @UseGuards(JwtAuthGuard)
  async generateInvoicePDF(@Param('bookingId') bookingId: string, @Res() res: Response) {
    try {
      console.log('Invoice PDF request for booking:', bookingId);
      
      const pdfBuffer = await this.reportsService.generateInvoicePDF(bookingId);
      console.log('Invoice PDF generated successfully, size:', pdfBuffer.length);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="rechnung-${bookingId.substring(0, 8)}.pdf"`,
        'Content-Length': pdfBuffer.length,
      });
      
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error in invoice controller:', error);
      res.status(404).json({ message: error.message });
    }
  }

  @Get('test')
  async testReport(@Res() res: Response) {
    try {
      console.log('Test report request');
      
      // Erstelle eine einfache Test-HTML
      const testHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Test Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Rustico Buchungstool</h1>
            <h2>Test Report</h2>
            <p>Dies ist ein Test-Report zur Überprüfung der PDF-Generierung.</p>
            <p>Datum: ${new Date().toLocaleDateString('de-DE')}</p>
          </div>
        </body>
        </html>
      `;
      
      const pdfBuffer = await this.reportsService['generatePDF'](testHTML);
      console.log('Test PDF generated, size:', pdfBuffer.length);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="test-report.pdf"',
        'Content-Length': pdfBuffer.length,
      });
      
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error in test report controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  @Get('period')
  @UseGuards(JwtAuthGuard)
  async generatePeriodReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('format') format: 'pdf' | 'excel' = 'pdf',
    @Res() res: Response,
  ) {
    try {
      console.log('Period report request:', { startDate, endDate, format });
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.error('Invalid dates:', { startDate, endDate });
        return res.status(400).json({ message: 'Ungültige Datumsangaben' });
      }

      console.log('Generating period report...');
      const buffer = await this.reportsService.generatePeriodReport(start, end, format);
      console.log('Period report generated, size:', buffer.length);
      
      const contentType = format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const extension = format === 'pdf' ? 'pdf' : 'xlsx';
      const filename = `report-${startDate}-${endDate}.${extension}`;
      
      res.set({
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length,
      });
      
      res.send(buffer);
    } catch (error) {
      console.error('Error in period report controller:', error);
      res.status(500).json({ message: error.message });
    }
  }
} 