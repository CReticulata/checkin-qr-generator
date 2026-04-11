import { supabase } from "./supabase";

export interface ParticipantRecord {
  email: string;
  ticketNumber: string;
}

export async function getTicketNumber(email: string): Promise<string | null> {
  const normalizedEmail = email.trim().toLowerCase();

  const { data, error } = await supabase
    .from("participants")
    .select("ticket_number")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (error) {
    console.error("[CSV Loader] Supabase query error:", error);
    return null;
  }

  return data?.ticket_number ?? null;
}

export async function getParticipantCount(): Promise<number> {
  const { count, error } = await supabase
    .from("participants")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("[CSV Loader] Supabase count error:", error);
    return 0;
  }

  return count ?? 0;
}

export async function hasParticipantsFile(): Promise<boolean> {
  const { data, error } = await supabase
    .from("participants")
    .select("email")
    .limit(1);

  if (error) {
    console.error("[CSV Loader] Supabase existence check error:", error);
    return false;
  }

  return (data?.length ?? 0) > 0;
}
