import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const InvoiceService = {
  generateInvoice: async (bookingData) => {
    // Create a hidden invoice template element in the DOM
    const element = document.createElement('div');
    element.id = 'invoice-template';
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.width = '800px';
    element.style.padding = '40px';
    element.style.backgroundColor = '#ffffff';
    element.style.color = '#1A1B1E';
    element.style.fontFamily = 'serif';

    element.innerHTML = `
      <div style="border-bottom: 2px solid #D4AF37; padding-bottom: 20px; margin-bottom: 30px;">
        <h1 style="color: #1A1B1E; margin: 0; font-size: 28px;">NORDIC SUITES</h1>
        <p style="margin: 5px 0; color: #666; font-size: 12px; letter-spacing: 2px;">LUXURY APARTMENT HOTEL</p>
      </div>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
        <div>
          <h3 style="margin: 0; color: #D4AF37;">INVOICE TO:</h3>
          <p style="margin: 5px 0; font-weight: bold;">${bookingData.guest_name}</p>
          <p style="margin: 5px 0;">${bookingData.guest_email}</p>
        </div>
        <div style="text-align: right;">
          <h3 style="margin: 0; color: #D4AF37;">DETAILS:</h3>
          <p style="margin: 5px 0;">INV-${bookingData.id.slice(0, 8).toUpperCase()}</p>
          <p style="margin: 5px 0;">Date: ${new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
        <tr style="background: #f8f9fa;">
          <th style="text-align: left; padding: 12px; border-bottom: 1px solid #ddd;">DESCRIPTION</th>
          <th style="text-align: center; padding: 12px; border-bottom: 1px solid #ddd;">QTY</th>
          <th style="text-align: right; padding: 12px; border-bottom: 1px solid #ddd;">PRICE</th>
          <th style="text-align: right; padding: 12px; border-bottom: 1px solid #ddd;">TOTAL</th>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">
            <strong>${bookingData.suite_title}</strong><br/>
            <span style="font-size: 12px; color: #666;">Check-in: ${new Date(bookingData.check_in).toLocaleDateString()}</span>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">1 Room</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${bookingData.total_price}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${bookingData.total_price}</td>
        </tr>
      </table>

      <div style="text-align: right; margin-bottom: 60px;">
        <p style="margin: 5px 0; font-size: 14px;">Subtotal: $${bookingData.total_price}</p>
        <p style="margin: 5px 0; font-size: 14px;">VAT (16%): $${(bookingData.total_price * 0.16).toFixed(2)}</p>
        <h2 style="margin: 10px 0; color: #1A1B1E;">TOTAL PAID: $${(bookingData.total_price * 1.16).toFixed(2)}</h2>
      </div>

      <div style="font-size: 10px; color: #888; text-align: center; border-top: 1px solid #eee; pt: 20px;">
        <p>KRA PIN: P051XXXXX</p>
        <p>Thank you for choosing Norden Suits. Your luxury experience awaits.</p>
      </div>
    `;

    document.body.appendChild(element);

    try {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Norden_Suits_Invoice_${bookingData.id.slice(0, 8)}.pdf`);
    } finally {
      document.body.removeChild(element);
    }
  }
};

export default InvoiceService;
