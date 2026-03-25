/**
 * Admin authentication utilities
 * Uses ADMIN_EMAILS environment variable for whitelist-based access control
 */

/**
 * Get list of admin emails from environment variable
 * Emails should be comma-separated in ADMIN_EMAILS
 */
function getAdminEmails(): string[] {
  const adminEmailsEnv = process.env.ADMIN_EMAILS || '';
  return adminEmailsEnv
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(email => email.length > 0);
}

/**
 * Check if an email address has admin privileges
 * Performs case-insensitive comparison against ADMIN_EMAILS whitelist
 *
 * @param email - Email address to check
 * @returns true if the email is in the admin whitelist
 */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const adminEmails = getAdminEmails();

  return adminEmails.includes(normalizedEmail);
}
