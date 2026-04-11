import { supabase } from "./supabase";

const DEFAULT_EVENT_NAME = "活動報到";
const SETTINGS_ROW_ID = 1;

export interface EventSettings {
  eventId: string;
  eventName: string;
  updatedAt: string;
}

export interface EventSettingsWithSource {
  eventId: string | null;
  eventIdSource: "supabase" | "env" | null;
  eventName: string;
  eventNameSource: "supabase" | "default";
}

interface SettingsRow {
  event_id: string | null;
  event_name: string | null;
  updated_at: string;
}

async function readSettingsFromSupabase(): Promise<SettingsRow | null> {
  const { data, error } = await supabase
    .from("event_settings")
    .select("event_id, event_name, updated_at")
    .eq("id", SETTINGS_ROW_ID)
    .maybeSingle();

  if (error) {
    console.error("[Event Settings] Supabase read error:", error);
    return null;
  }

  return (data as SettingsRow | null) ?? null;
}

export async function saveEventSettings(
  eventId: string,
  eventName?: string,
): Promise<void> {
  const { error } = await supabase.from("event_settings").upsert(
    {
      id: SETTINGS_ROW_ID,
      event_id: eventId,
      event_name: eventName || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) {
    console.error("[Event Settings] Supabase upsert error:", error);
    throw new Error(error.message);
  }
}

export async function getEventId(): Promise<string | null> {
  const settings = await readSettingsFromSupabase();
  if (settings?.event_id) {
    return settings.event_id;
  }

  return process.env.EVENT_ID || null;
}

export async function getEventName(): Promise<string> {
  const settings = await readSettingsFromSupabase();
  if (settings?.event_name) {
    return settings.event_name;
  }
  return DEFAULT_EVENT_NAME;
}

export async function getEventSettingsWithSource(): Promise<EventSettingsWithSource> {
  const settings = await readSettingsFromSupabase();

  let eventId: string | null = null;
  let eventIdSource: "supabase" | "env" | null = null;
  let eventName: string = DEFAULT_EVENT_NAME;
  let eventNameSource: "supabase" | "default" = "default";

  if (settings?.event_id) {
    eventId = settings.event_id;
    eventIdSource = "supabase";
  } else if (process.env.EVENT_ID) {
    eventId = process.env.EVENT_ID;
    eventIdSource = "env";
  }

  if (settings?.event_name) {
    eventName = settings.event_name;
    eventNameSource = "supabase";
  }

  return {
    eventId,
    eventIdSource,
    eventName,
    eventNameSource,
  };
}
