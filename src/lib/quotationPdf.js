'use client';

/**
 * Builds and downloads the solar sizing quotation as a real PDF file.
 * jsPDF is loaded on demand so it never weighs on the first page load.
 *
 * Only standard PDF fonts are used (no emoji), so the file renders identically everywhere.
 *
 * @param {{
 *   location: string,
 *   rows: Array<[string, string]>,
 *   notes?: string[],
 * }} quote
 */
export async function downloadQuotationPdf(quote) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  const pageW = doc.internal.pageSize.getWidth();
  const margin = 44;
  const innerW = pageW - margin * 2;
  const now = new Date();
  const dateLabel = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const ref = `SS-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(
    now.getHours() * 60 + now.getMinutes()
  ).padStart(4, '0')}`;

  // ---- Header band ----
  doc.setFillColor(245, 158, 11); // amber-500
  doc.rect(0, 0, pageW, 78, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('SellSolar.pk', margin, 38);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Pakistan\'s #1 Used Solar Marketplace', margin, 56);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('SOLAR SYSTEM SIZING QUOTATION', pageW - margin, 38, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(`Date: ${dateLabel}`, pageW - margin, 54, { align: 'right' });
  doc.text(`Ref: ${ref}`, pageW - margin, 67, { align: 'right' });

  // ---- Location strip ----
  let y = 108;
  doc.setTextColor(17, 24, 39);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  if (quote.location) {
    doc.text('Location:', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(quote.location, margin + 58, y);
    y += 14;
    doc.setDrawColor(229, 231, 235);
    doc.line(margin, y, pageW - margin, y);
    y += 22;
  } else {
    y = 100;
  }

  // ---- Rows ----
  const labelW = 190;
  quote.rows.forEach(([label, value], i) => {
    const valueLines = doc.splitTextToSize(String(value), innerW - labelW - 16);
    const rowH = Math.max(26, valueLines.length * 14 + 12);
    if (y + rowH > 760) {
      doc.addPage();
      y = 60;
    }
    if (i % 2 === 0) {
      doc.setFillColor(249, 250, 251);
      doc.rect(margin, y - 16, innerW, rowH, 'F');
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(55, 65, 81);
    doc.text(label, margin + 8, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(17, 24, 39);
    doc.text(valueLines, margin + labelW, y);
    y += rowH;
  });

  // ---- Notes ----
  const notes = quote.notes || [];
  if (notes.length) {
    y += 14;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    doc.text('Notes', margin, y);
    y += 14;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    notes.forEach((n) => {
      const lines = doc.splitTextToSize(`- ${n}`, innerW);
      if (y + lines.length * 12 > 790) {
        doc.addPage();
        y = 60;
      }
      doc.text(lines, margin, y);
      y += lines.length * 12 + 2;
    });
  }

  // ---- Footer ----
  const pageH = doc.internal.pageSize.getHeight();
  doc.setDrawColor(229, 231, 235);
  doc.line(margin, pageH - 52, pageW - margin, pageH - 52);
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text('Calculated on SellSolar Pakistan Load Calculator', margin, pageH - 36);
  doc.setTextColor(217, 119, 6);
  doc.textWithLink('https://sellsolar.pk/calculator', margin, pageH - 23, { url: 'https://sellsolar.pk/calculator' });

  doc.save(`SellSolar-Quotation-${ref}.pdf`);
}
