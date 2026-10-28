/**
 * ============================================================================
 * SIRKLEN PHOTO - OTOMASI LYNK.ID ➔ GOOGLE SHEETS ➔ WHATSAPP (META CLOUD API)
 * 100% GRATIS SELAMANYA TANPA SEWA SERVER
 * ============================================================================
 * 
 * CARA PAKAI:
 * 1. Buka https://sheets.google.com -> Buat Spreadsheet Baru: "Database Pemesanan Sirklen Photo"
 * 2. Klik menu "Ekstensi" (Extensions) ➔ "Apps Script"
 * 3. Hapus kode bawaan, lalu paste seluruh isi file ini ke editor Apps Script.
 * 4. Isi variabel CONFIG di bawah (META_PHONE_NUMBER_ID & META_ACCESS_TOKEN).
 * 5. Klik "Terapkan" (Deploy) ➔ "Penerapan Baru" (New Deployment) ➔ Jenis: "Aplikasi Web" (Web App).
 *    - Akses (Who has access): Pilih "Siapa saja" (Anyone)
 * 6. Salin "URL Aplikasi Web" yang dihasilkan, lalu masukkan ke Webhook Lynk.id!
 */

const CONFIG = {
  // Masukkan Token & Phone Number ID dari Meta for Developers (developers.facebook.com)
  META_PHONE_NUMBER_ID: 'ISI_DENGAN_PHONE_NUMBER_ID_META_ANDA',
  META_ACCESS_TOKEN: 'ISI_DENGAN_PERMANENT_ACCESS_TOKEN_META_ANDA',
  
  // Domain Utama Website
  BASE_URL: 'https://www.sirklenice.com',
  
  // Nama Sheet di Google Spreadsheet tempat merekap order
  SHEET_NAME: 'Pesanan Masuk'
};

/**
 * Handle HTTP POST dari Webhook Lynk.id
 */
function doPost(e) {
  try {
    const rawData = e.postData.contents;
    const payload = JSON.parse(rawData);

    // Pastikan sheet siap
    const sheet = getOrCreateSheet();

    // 1. Ekstrak Data dari Payload Lynk.id
    // Lynk.id mengirim data transaksi pembeli & custom fields
    const customer = payload.customer || payload.buyer || {};
    const customFields = payload.custom_fields || payload.answers || {};

    const buyerName = customer.name || payload.name || 'Pelanggan';
    let buyerPhone = customer.phone || payload.phone || payload.whatsapp || '';
    
    // Normalisasi Nomor WhatsApp (harus format internasional misal 62812xxx)
    buyerPhone = formatPhoneNumber(buyerPhone);

    const eventName = customFields.nama_acara || customFields.nama_mempelai || customFields.acara || payload.item_name || 'Wedding Celebration';
    const eventDate = customFields.tanggal_acara || customFields.tanggal || '-';
    const eventVenue = customFields.lokasi || customFields.venue || '-';
    const packageName = payload.item_name || payload.product_name || 'Paket Photobooth Virtual';

    // 2. Buat Slug Unik untuk Link Setup
    const cleanSlug = createCleanSlug(eventName);
    const setupUrl = `${CONFIG.BASE_URL}/setup/${cleanSlug}?from=lynkid`;
    const guestUrl = `${CONFIG.BASE_URL}/${cleanSlug}?qr=1`;

    // 3. Catat Transaksi ke Google Sheets
    const now = new Date();
    const formattedNow = Utilities.formatDate(now, "Asia/Jakarta", "dd/MM/yyyy HH:mm:ss");
    
    sheet.appendRow([
      formattedNow,
      payload.order_id || payload.id || Utilities.getUuid().slice(0, 8),
      buyerName,
      buyerPhone,
      eventName,
      packageName,
      eventDate,
      eventVenue,
      setupUrl,
      'STATUS: LUNAS',
      'WA TERKIRIM'
    ]);

    // 4. Kirim Pesan WhatsApp Otomatis Menggunakan Meta Cloud API
    if (buyerPhone) {
      sendWhatsAppMessage(buyerPhone, buyerName, eventName, setupUrl, guestUrl);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Order processed and WhatsApp message sent',
      setupUrl: setupUrl
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Log error jika terjadi kendala
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Kirim Pesan via Meta WhatsApp Cloud API (Gratis 1.000 chat/bulan)
 */
function sendWhatsAppMessage(toPhone, name, eventTitle, setupUrl, guestUrl) {
  const url = `https://graph.facebook.com/v21.0/${CONFIG.META_PHONE_NUMBER_ID}/messages`;

  const messageText = 
    `Halo Kak *${name}*! 👋 Terima kasih telah memesan Sirklen Photo.\n\n` +
    `Pembayaran Anda untuk acara *${eventTitle}* telah berhasil diverifikasi! ✅\n\n` +
    `Silakan klik tautan di bawah ini untuk mulai mendesain bingkai, mengatur nama, dan foto cover photobooth acaramu:\n` +
    `🔗 *Dashboard Setup:* ${setupUrl}\n\n` +
    `🎉 *Tautan Web Tamu Undangan:* ${guestUrl}\n\n` +
    `_Tips: Simpan pesan ini agar Kakak bisa kembali mengedit desain atau mengunduh arsip foto tamu kapan saja._ ✨`;

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: toPhone,
    type: "text",
    text: {
      preview_url: true,
      body: messageText
    }
  };

  const options = {
    method: "post",
    contentType: "application/json",
    headers: {
      Authorization: `Bearer ${CONFIG.META_ACCESS_TOKEN}`
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  UrlFetchApp.fetch(url, options);
}

/**
 * Format nomor telepon Indonesia ke 62xxxx
 */
function formatPhoneNumber(phone) {
  let cleaned = (phone || '').replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

/**
 * Buat slug URL aman (misal: "Sabrina & Raka" -> "sabrina-raka")
 */
function createCleanSlug(text) {
  if (!text) return 'event-' + Utilities.getUuid().slice(0, 6);
  let clean = text.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return clean || 'event-' + Utilities.getUuid().slice(0, 6);
}

/**
 * Menyiapkan sheet 'Pesanan Masuk' dan header kolom jika belum ada
 */
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
    sheet.appendRow([
      'Waktu Transaksi',
      'ID Pesanan',
      'Nama Pemesan',
      'Nomor WhatsApp',
      'Nama Acara/Pengantin',
      'Paket',
      'Tanggal Acara',
      'Venue',
      'Link Setup Klien',
      'Status Bayar',
      'Status WA'
    ]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 11).setFontWeight('bold').setBackground('#F5EBE6');
  }
  return sheet;
}
