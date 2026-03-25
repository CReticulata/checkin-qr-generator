import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Get the current server-side session
 * This should be used in Server Components and API routes
 *
 * @returns Session object if authenticated, null otherwise
 */
export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * Validate that a session exists and contains required user data
 *
 * @param session - Session object to validate
 * @returns true if session is valid, false otherwise
 */
export function isValidSession(session: any): boolean {
  return !!(session && session.user && session.user.email);
}

/**
 * Normalize email address for consistent lookup
 * - Convert to lowercase
 * - Trim whitespace
 *
 * @param email - Email address to normalize
 * @returns Normalized email address
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Extract email from session with validation
 *
 * @param session - Session object
 * @returns Normalized email if valid, null otherwise
 */
export function getEmailFromSession(session: any): string | null {
  if (!isValidSession(session)) {
    return null;
  }

  const email = session.user.email;
  return normalizeEmail(email);
}
