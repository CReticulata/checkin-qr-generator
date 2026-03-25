## 1. Project Setup and Dependencies

- [x] 1.1 Initialize Next.js project with TypeScript and App Router if not already present
- [x] 1.2 Install next-auth package for Google OAuth authentication
- [x] 1.3 Install csv-parse package for CSV file parsing
- [x] 1.4 Install qrcode package and @types/qrcode for QR code generation
- [x] 1.5 Create src/data/ directory for CSV storage
- [x] 1.6 Add src/data/ to .gitignore to prevent committing sensitive participant data

## 2. Environment Configuration

- [x] 2.1 Create .env.local file with required environment variables (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET, NEXTAUTH_URL, EVENT_ID)
- [x] 2.2 Add .env.example file documenting required environment variables
- [x] 2.3 Document Google Cloud Console setup steps in README for obtaining OAuth credentials

## 3. CSV Loader Implementation

- [x] 3.1 Create src/lib/csvLoader.ts with type definitions for participant data
- [x] 3.2 Implement CSV file reading from src/data/participants.csv using fs module
- [x] 3.3 Implement CSV parsing using csv-parse with correct column indices (email: index 4, ticket: index 1)
- [x] 3.4 Skip header row during CSV parsing
- [x] 3.5 Build in-memory Map<string, string> with lowercase email keys for O(1) lookup
- [x] 3.6 Handle duplicate emails by using first occurrence and logging warning
- [x] 3.7 Implement getTicketNumber(email: string) function with case-insensitive lookup
- [x] 3.8 Add CSV validation on startup (check file exists, sufficient columns, log errors)
- [x] 3.9 Add error handling for missing or malformed CSV files

## 4. NextAuth.js Authentication Setup

- [x] 4.1 Create src/app/api/auth/[...nextauth]/route.ts for NextAuth.js API route
- [x] 4.2 Configure Google OAuth provider with credentials from environment
- [x] 4.3 Set up session callback to include user email in session object
- [x] 4.4 Configure session strategy and expiration settings
- [x] 4.5 Add NEXTAUTH_SECRET generation and configuration
- [ ] 4.6 Test OAuth flow redirects and callback handling

## 5. Authentication Utilities

- [x] 5.1 Create src/lib/auth.ts with helper function to get server-side session
- [x] 5.2 Implement session validation utilities for protected routes
- [x] 5.3 Add email normalization helper (lowercase conversion, whitespace trimming)

## 6. QR Code Generation Module

- [x] 6.1 Create src/lib/qrGenerator.ts for QR code generation logic
- [x] 6.2 Implement generateQRCode(ticketNumber: string) function using qrcode library
- [x] 6.3 Format QR code content as ${EVENT_ID}:${ticket_number} using environment variable
- [x] 6.4 Generate base64 data URL for image display in React components
- [x] 6.5 Add error handling for missing EVENT_ID or invalid ticket numbers
- [x] 6.6 Add validation to ensure QR code readability (appropriate size and error correction)

## 7. Login Page

- [x] 7.1 Create src/app/page.tsx as landing/login page
- [x] 7.2 Add "Login with Google" button that triggers NextAuth.js signIn
- [x] 7.3 Style login page with responsive layout
- [x] 7.4 Add event branding and instructions for participants
- [x] 7.5 Handle OAuth error messages from URL parameters

## 8. Dashboard Page Implementation

- [x] 8.1 Create src/app/dashboard/page.tsx as Server Component
- [x] 8.2 Implement session check and redirect to login if unauthenticated
- [x] 8.3 Extract user email from session
- [x] 8.4 Call getTicketNumber() to look up participant registration
- [x] 8.5 Redirect to /error page if email not found in CSV
- [x] 8.6 Generate QR code using generateQRCode() if participant is registered
- [x] 8.7 Display QR code image using base64 data URL
- [x] 8.8 Show user email and ticket number on dashboard
- [x] 8.9 Add logout button that calls NextAuth.js signOut
- [x] 8.10 Style dashboard with responsive layout (mobile and desktop)
- [x] 8.11 Ensure QR code is appropriately sized for mobile scanning

## 9. Error Page for Unregistered Users

- [x] 9.1 Create src/app/error/page.tsx for unregistered participants
- [x] 9.2 Display "Registration Not Found" message with explanation
- [x] 9.3 Add logout button to try different account
- [x] 9.4 Provide contact information or support link for assistance
- [x] 9.5 Style error page consistently with application theme

## 10. Security and Data Protection

- [x] 10.1 Verify participants.csv is located in src/data/ (not public/)
- [x] 10.2 Test that CSV file is not accessible via direct URL (e.g., /data/participants.csv)
- [x] 10.3 Ensure all participant lookups happen server-side only
- [x] 10.4 Validate that OAuth credentials are properly secured in environment variables
- [x] 10.5 Add security headers to Next.js configuration if needed

## 11. Testing and Validation

- [x] 11.1 Create sample participants.csv with test data (including header row)
- [ ] 11.2 Test Google OAuth login flow end-to-end
- [ ] 11.3 Test dashboard access with registered email (verify QR code displays)
- [ ] 11.4 Test dashboard access with unregistered email (verify error page redirect)
- [ ] 11.5 Test case-insensitive email lookup (try mixed case emails)
- [ ] 11.6 Test QR code scannability with mobile device
- [ ] 11.7 Verify QR code contains correct format: EVENT_ID:Ticket_number
- [ ] 11.8 Test logout functionality
- [ ] 11.9 Test unauthenticated access to dashboard (verify login redirect)
- [ ] 11.10 Test responsive layout on mobile and desktop browsers

## 12. Documentation and Deployment Preparation

- [x] 12.1 Document CSV file format in README (column indices, header row requirement)
- [x] 12.2 Document deployment steps in README
- [x] 12.3 Document environment variable configuration
- [x] 12.4 Add troubleshooting guide for common issues (OAuth errors, CSV format problems)
- [x] 12.5 Prepare sample .env.example with placeholder values
- [x] 12.6 Document how to update participant data (CSV replacement + restart)
