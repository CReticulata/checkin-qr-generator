import QRCode from 'qrcode';

/**
 * Generate QR code for event check-in
 * Format: EVENT_ID:Ticket_number
 *
 * @param ticketNumber - Ticket number from participant CSV
 * @returns Base64-encoded data URL for QR code image
 * @throws Error if EVENT_ID is not configured or QR generation fails
 */
export async function generateQRCode(ticketNumber: string): Promise<string> {
  // Validate EVENT_ID environment variable
  const eventId = process.env.EVENT_ID;
  if (!eventId) {
    throw new Error('EVENT_ID environment variable is not configured');
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
 * Checks if EVENT_ID is properly set
 *
 * @returns true if configuration is valid, false otherwise
 */
export function validateQRConfig(): boolean {
  return !!process.env.EVENT_ID;
}

/**
 * Get the current event ID
 *
 * @returns EVENT_ID from environment or null if not configured
 */
export function getEventId(): string | null {
  return process.env.EVENT_ID || null;
}
