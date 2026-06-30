import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

/**
 * Generates a professional A4 PDF invoice using modern native browser rendering.
 * Fully compatible with Tailwind CSS v4 and oklch color spaces.
 */
export const generateInvoicePDF = async (element: HTMLDivElement | null, invoiceNumber: string): Promise<void> => {
  if (!element) {
    console.error('PDF Generator: Target element not found.');
    return;
  }

  try {
    // 1. Capture the element as a high-resolution PNG using native SVG rendering
    const dataUrl = await toPng(element, {
      quality: 1,
      pixelRatio: 2, // Double resolution for crisp text printing
      backgroundColor: '#ffffff',
      style: {
        transform: 'scale(1)', // Ensures no layout shifts during capture
      },
    });

    // 2. Initialize jsPDF with standard A4 dimensions
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = 210; // A4 Width in mm
    const pdfHeight = 297; // A4 Height in mm

    // 3. Add the clean image layout and save the document
    pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    const formattedName = invoiceNumber.toLowerCase().replace(/[^a-z0-9]/g, '_');
    pdf.save(`invoice_${formattedName}.pdf`);

  } catch (error) {
    console.error('Error generating invoice PDF:', error);
  }
};