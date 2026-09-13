/* ============================================================
   I'M INN HOTEL — SORSOGON
   Google Apps Script Backend
   ============================================================ */

const HOTEL_EMAIL = 'artuzchampluiguerrero@thelewiscollege.edu.ph';
const HOTEL_NAME = "I'M INN Hotel";
const HOTEL_ADDRESS = 'Purok 6, National Highway, Balogo, Sorsogon City, Sorsogon 4700';
const HOTEL_PHONE = '0908 695 6732';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const receiptText = buildReceiptText(data);

    // Create Google Doc
    const doc = DocumentApp.create(
      `I'M INN Booking — ${data.fullName} — ${data.checkin}`
    );
    const body = doc.getBody();
    body.clear();

    const title = body.appendParagraph(HOTEL_NAME);
    title.setHeading(DocumentApp.ParagraphHeading.HEADING1)
         .setAlignment(DocumentApp.HorizontalAlignment.CENTER);

    const subtitle = body.appendParagraph('Booking Confirmation / Receipt');
    subtitle.setHeading(DocumentApp.ParagraphHeading.HEADING2)
            .setAlignment(DocumentApp.HorizontalAlignment.CENTER);

    body.appendParagraph(HOTEL_ADDRESS)
        .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    body.appendParagraph(`Phone: ${HOTEL_PHONE}`)
        .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    body.appendParagraph('');

    body.appendParagraph(receiptText);
    body.appendParagraph('');
    body.appendParagraph("Thank you for choosing I'M INN Hotel!")
        .setAlignment(DocumentApp.HorizontalAlignment.CENTER);

    doc.saveAndClose();

    // Convert to PDF
    const docFile = DriveApp.getFileById(doc.getId());
    const pdfBlob = docFile.getAs('application/pdf');
    pdfBlob.setName(`IMINN_Booking_${data.fullName.replace(/\s+/g, '_')}.pdf`);

    // Email to guest
    MailApp.sendEmail({
      to: data.email,
      subject: `Your Booking Confirmation — ${HOTEL_NAME}`,
      body:
        `Hi ${data.fullName},\n\n` +
        `Thank you for booking with ${HOTEL_NAME}. ` +
        `Please find your booking confirmation attached as a PDF.\n\n` +
        `Booking Summary:\n` +
        `  Room: ${data.roomType}\n` +
        `  Check-in: ${data.checkin}\n` +
        `  Check-out: ${data.checkout}\n` +
        `  Guests: ${data.guests}\n` +
        `  Total: ₱${Number(data.total).toLocaleString()}\n\n` +
        `If you have any questions, contact us at ${HOTEL_PHONE}.\n\n` +
        `— ${HOTEL_NAME}`,
      attachments: [pdfBlob]
    });

    // Admin copy → sends to YOUR school email only
    MailApp.sendEmail({
      to: HOTEL_EMAIL,
      subject: `New Booking — ${data.fullName}`,
      body: receiptText,
      attachments: [pdfBlob]
    });

    // Clean up temp Doc
    docFile.setTrashed(true);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    console.error('Error:', err);
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function buildReceiptText(d) {
  const lines = [
    '----------------------------------------',
    'BOOKING DETAILS',
    '----------------------------------------',
    `Guest Name:      ${d.fullName}`,
    `Email:           ${d.email}`,
    `Phone:           ${d.phone}`,
    '',
    `Room Type:       ${d.roomType}`,
    `Rate per night:  ₱${Number(d.roomPrice).toLocaleString()}`,
    `Nights:          ${d.nights}`,
    `Guests:          ${d.guests}`,
    '',
    `Check-in:        ${d.checkin}  (2:00 PM)`,
    `Check-out:       ${d.checkout} (12:00 NN)`,
    '',
    '----------------------------------------',
    'ADD-ONS',
    '----------------------------------------',
    `Extra Bed:       ${d.extraBed}`,
    `Extra Hour:      ${d.extraHour}`,
    `Add-ons Total:   ₱${Number(d.addons).toLocaleString()}`,
    '',
    '----------------------------------------',
    'TOTAL',
    '----------------------------------------',
    `GRAND TOTAL:     ₱${Number(d.total).toLocaleString()}`,
    '',
    'Down payment required: 50%',
    'Non-refundable if canceled within 3 days.',
    '',
    `Special Requests: ${d.requests || '(none)'}`,
    ''
  ];
  return lines.join('\n');
}

function doGet() {
  return ContentService
    .createTextOutput("I'M INN Booking Backend is running. ✅")
    .setMimeType(ContentService.MimeType.TEXT);
}