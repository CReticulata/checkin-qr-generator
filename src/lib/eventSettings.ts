import { list, put } from "@vercel/blob";

// Settings file name in Blob Storage
const SETTINGS_BLOB_NAME = "settings.json";

// Default event name when not configured
const DEFAULT_EVENT_NAME = "活動報到";

/**
 * Event settings interface
 */
export interface EventSettings {
  eventId: string;
  eventName: string;
  updatedAt: string;
}

/**
 * Event settings with source information
 */
export interface EventSettingsWithSource {
  eventId: string | null;
  eventIdSource: "blob" | "env" | null;
  eventName: string;
  eventNameSource: "blob" | "default";
}

/**
 * Read settings from Vercel Blob Storage
 * @returns EventSettings if found, null otherwise
 */
async function readSettingsFromBlob(): Promise<EventSettings | null> {
  try {
    const { blobs } = await list();
    const settingsBlob = blobs.find(
      (blob) => blob.pathname === SETTINGS_BLOB_NAME,
    );

    if (!settingsBlob) {
      return null;
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    const response = await fetch(settingsBlob.url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error(
        `[Event Settings] Failed to fetch settings: ${response.status}`,
      );
      return null;
    }

    const content = await response.text();
    const settings = JSON.parse(content) as EventSettings;

    // Validate required fields
    if (!settings.eventId) {
      console.warn("[Event Settings] Settings file missing eventId");
      return null;
    }

    return settings;
  } catch (error) {
    console.error("[Event Settings] Error reading settings from Blob:", error);
    return null;
  }
}

/**
 * Write settings to Vercel Blob Storage
 * @param eventId - Event ID (required)
 * @param eventName - Event name (optional)
 */
export async function saveEventSettings(
  eventId: string,
  eventName?: string,
): Promise<void> {
  const settings: EventSettings = {
    eventId,
    eventName: eventName || "",
    updatedAt: new Date().toISOString(),
  };

  await put(SETTINGS_BLOB_NAME, JSON.stringify(settings, null, 2), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  console.log(
    `[Event Settings] Saved settings: eventId=${eventId}, eventName=${eventName || "(not set)"}`,
  );
}

/**
 * Get EVENT_ID with priority: Blob Storage → Environment Variable
 * @returns Event ID or null if not configured
 */
export async function getEventId(): Promise<string | null> {
  // First, try Blob Storage
  const blobSettings = await readSettingsFromBlob();
  if (blobSettings?.eventId) {
    return blobSettings.eventId;
  }

  // Fallback to environment variable
  const envEventId = process.env.EVENT_ID;
  if (envEventId) {
    return envEventId;
  }

  return null;
}

/**
 * Get event name with fallback to default
 * @returns Event name or default value '活動報到'
 */
export async function getEventName(): Promise<string> {
  const blobSettings = await readSettingsFromBlob();

  if (blobSettings?.eventName) {
    return blobSettings.eventName;
  }

  return DEFAULT_EVENT_NAME;
}

/**
 * Get full event settings with source information
 * Used by admin panel to show where settings come from
 */
export async function getEventSettingsWithSource(): Promise<EventSettingsWithSource> {
  const blobSettings = await readSettingsFromBlob();

  let eventId: string | null = null;
  let eventIdSource: "blob" | "env" | null = null;
  let eventName: string = DEFAULT_EVENT_NAME;
  let eventNameSource: "blob" | "default" = "default";

  // Determine eventId and its source
  if (blobSettings?.eventId) {
    eventId = blobSettings.eventId;
    eventIdSource = "blob";
  } else if (process.env.EVENT_ID) {
    eventId = process.env.EVENT_ID;
    eventIdSource = "env";
  }

  // Determine eventName and its source
  if (blobSettings?.eventName) {
    eventName = blobSettings.eventName;
    eventNameSource = "blob";
  }

  return {
    eventId,
    eventIdSource,
    eventName,
    eventNameSource,
  };
}
