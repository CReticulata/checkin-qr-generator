import QRCode from 'qrcode';
import { getEventId as getEventIdFromSettings } from './eventSettings';

/**
 * Generate QR code for event check-in
 * Format: EVENT_ID:Ticket_number
 *
 * @param ticketNumber - Ticket number from participant CSV
 * @returns Base64-encoded data URL for QR code image
 * @throws Error if EVENT_ID is not configured or QR generation fails
 */
export async function generateQRCode(ticketNumber: string): Promise<string> {
  // Get EVENT_ID from settings (Blob Storage → Environment Variable)
  const eventId = await getEventIdFromSettings();
  if (!eventId) {
    throw new Error('EVENT_ID is not configured (neither in Blob Storage nor environment variable)');
  }

  // Validate ticket number
  if (!ticketNumber || ticketNumber.trim().length === 0) {
    throw new Error('Invalid ticket number provided');
  }

  // Extract last 7 digits from ticket number
  // Example: GOOGA262822187 -> 2822187
  const ticketNumberLast7 = ticketNumber.slice(-7);

  // Format QR code content as EVENT_ID:Last7Digits
  const qrContent = `${eventId}:${ticketNumberLast7}`;

  try {
    // Generate QR code as base64 data URL
    // Options for readability:
    // - errorCorrectionLevel: 'M' (medium, 15% error correction)
    // - width: 300 (appropriate size for mobile scanning)
    // - margin: 4 (standard margin for QR codes)
    const dataUrl = await QRCode.toDataURL(qrContent, {
      errorCorrectionLevel: 'M',
      width: 300,
      margin: 4,
      color: {
        dark: '#000000',  // Black dots
        light: '#FFFFFF', // White background
      },
    });

    return dataUrl;
  } catch (error) {
    console.error('[QR Generator] Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Validate QR code configuration
 * Checks if EVENT_ID is properly set (in Blob Storage or environment)
 *
 * @returns true if configuration is valid, false otherwise
 */
export async function validateQRConfig(): Promise<boolean> {
  const eventId = await getEventIdFromSettings();
  return !!eventId;
}

/**
 * Get the current event ID
 * Priority: Blob Storage → Environment Variable
 *
 * @returns EVENT_ID or null if not configured
 */
export async function getEventId(): Promise<string | null> {
  return getEventIdFromSettings();
}
