import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { join } from 'path';

// Type definitions for participant data
export interface ParticipantRecord {
  email: string;
  ticketNumber: string;
}

// In-memory Map for O(1) email lookup
let participantMap: Map<string, string> | null = null;

/**
 * Initialize the CSV loader by reading and parsing the participants.csv file
 * This should be called once at application startup
 */
export function initializeParticipantData(): void {
  try {
    // Read CSV file from src/data/participants.csv
    const csvPath = join(process.cwd(), 'src', 'data', 'participants.csv');

    console.log(`[CSV Loader] Reading CSV from: ${csvPath}`);

    const fileContent = readFileSync(csvPath, 'utf-8');

    // Parse CSV with csv-parse
    const records = parse(fileContent, {
      skip_empty_lines: true,
      relax_column_count: true, // Allow rows with varying column counts
    }) as string[][];

    // Validate that we have data
    if (records.length === 0) {
      throw new Error('CSV file is empty');
    }

    // Skip header row (first row)
    const dataRows = records.slice(1);

    console.log(`[CSV Loader] Found ${dataRows.length} participant records (excluding header)`);

    // Build Map with lowercase email keys for case-insensitive lookup
    participantMap = new Map<string, string>();

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

    // Validate CSV structure
    if (participantMap.size === 0) {
      throw new Error('No valid participant records found in CSV');
    }

  } catch (error) {
    if (error instanceof Error) {
      if ('code' in error && error.code === 'ENOENT') {
        console.error('[CSV Loader] CRITICAL ERROR: participants.csv file not found');
        console.error('[CSV Loader] Please place participants.csv in src/data/ directory');
        throw new Error('participants.csv file not found. Application cannot start.');
      } else {
        console.error('[CSV Loader] Error parsing CSV:', error.message);
        throw error;
      }
    }
    throw error;
  }
}

/**
 * Get ticket number for a given email address
 * Performs case-insensitive lookup with O(1) time complexity
 *
 * @param email - Email address to lookup
 * @returns Ticket number if found, null otherwise
 */
export async function getTicketNumber(email: string): Promise<string | null> {
  // Initialize if not already done
  if (!participantMap) {
    initializeParticipantData();
  }

  if (!participantMap) {
    throw new Error('Participant data not initialized');
  }

  // Normalize email: lowercase and trim whitespace
  const normalizedEmail = email.trim().toLowerCase();

  // O(1) lookup in Map
  return participantMap.get(normalizedEmail) || null;
}

/**
 * Get the number of loaded participants (for debugging/monitoring)
 */
export function getParticipantCount(): number {
  return participantMap?.size || 0;
}
