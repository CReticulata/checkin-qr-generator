import { list } from '@vercel/blob';
import { parse } from 'csv-parse/sync';
import { unstable_noStore as noStore } from 'next/cache';

// Type definitions for participant data
export interface ParticipantRecord {
  email: string;
  ticketNumber: string;
}

// Blob file name pattern for participants CSV (timestamped)
const PARTICIPANTS_BLOB_PREFIX = 'participants-';

/**
 * Fetch and parse CSV from Vercel Blob Storage
 * Returns a Map for O(1) email lookup
 */
async function fetchParticipantData(): Promise<Map<string, string>> {
  // Disable Next.js Data Cache to always fetch fresh data
  noStore();

  const participantMap = new Map<string, string>();

  try {
    // List blobs to find the latest participants-*.csv
    const { blobs } = await list();
    const csvBlobs = blobs
      .filter(blob => blob.pathname.startsWith(PARTICIPANTS_BLOB_PREFIX) && blob.pathname.endsWith('.csv'))
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    const csvBlob = csvBlobs[0]; // Get the most recent one

    if (!csvBlob) {
      console.warn('[CSV Loader] No participants CSV found in Blob Storage');
      return participantMap;
    }

    console.log(`[CSV Loader] Using CSV: ${csvBlob.pathname} (uploaded: ${csvBlob.uploadedAt})`);

    // Fetch blob content with token authentication
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    const response = await fetch(csvBlob.url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`[CSV Loader] Failed to fetch CSV: ${response.status} ${response.statusText}`);
      return participantMap;
    }

    const fileContent = await response.text();

    // Parse CSV with csv-parse
    const records = parse(fileContent, {
      skip_empty_lines: true,
      relax_column_count: true,
    }) as string[][];

    if (records.length === 0) {
      console.warn('[CSV Loader] CSV file is empty');
      return participantMap;
    }

    // Skip header row (first row)
    const dataRows = records.slice(1);

    console.log(`[CSV Loader] Found ${dataRows.length} participant records (excluding header)`);

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];

      // Validate row has sufficient columns
      if (row.length < 5) {
        console.warn(`[CSV Loader] Row ${i + 2} has insufficient columns (${row.length}), skipping`);
        continue;
      }

      // Extract email from column 5 (index 4) and ticket number from column 2 (index 1)
      const email = row[4]?.trim();
      const ticketNumber = row[1]?.trim();

      if (!email || !ticketNumber) {
        console.warn(`[CSV Loader] Row ${i + 2} has missing email or ticket number, skipping`);
        continue;
      }

      // Normalize email to lowercase for case-insensitive lookup
      const normalizedEmail = email.toLowerCase();

      // Handle duplicate emails - use first occurrence and log warning
      if (participantMap.has(normalizedEmail)) {
        console.warn(`[CSV Loader] Duplicate email found: ${email} (keeping first occurrence)`);
        continue;
      }

      participantMap.set(normalizedEmail, ticketNumber);
    }

    console.log(`[CSV Loader] Successfully loaded ${participantMap.size} unique participants`);

  } catch (error) {
    console.error('[CSV Loader] Error fetching/parsing CSV from Blob Storage:', error);
  }

  return participantMap;
}

/**
 * Get ticket number for a given email address
 * Fetches data from Vercel Blob Storage and performs case-insensitive lookup
 *
 * @param email - Email address to lookup
 * @returns Ticket number if found, null otherwise
 */
export async function getTicketNumber(email: string): Promise<string | null> {
  const participantMap = await fetchParticipantData();

  // Normalize email: lowercase and trim whitespace
  const normalizedEmail = email.trim().toLowerCase();

  // O(1) lookup in Map
  return participantMap.get(normalizedEmail) || null;
}

/**
 * Get the number of loaded participants
 * Fetches fresh data from Blob Storage
 */
export async function getParticipantCount(): Promise<number> {
  const participantMap = await fetchParticipantData();
  return participantMap.size;
}

/**
 * Check if participants CSV exists in Blob Storage
 */
export async function hasParticipantsFile(): Promise<boolean> {
  noStore();
  try {
    const { blobs } = await list();
    return blobs.some(blob => blob.pathname.startsWith(PARTICIPANTS_BLOB_PREFIX) && blob.pathname.endsWith('.csv'));
  } catch {
    return false;
  }
}
