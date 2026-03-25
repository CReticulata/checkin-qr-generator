## ADDED Requirements

### Requirement: User can authenticate with Google account
The system SHALL provide Google OAuth 2.0 authentication that allows users to log in using their Google account credentials.

#### Scenario: Successful Google login
- **WHEN** user clicks "Login with Google" button
- **THEN** system redirects to Google OAuth consent screen

#### Scenario: OAuth callback handling
- **WHEN** Google redirects back after successful authentication
- **THEN** system creates an authenticated session with user's email address

#### Scenario: Session persistence
- **WHEN** authenticated user returns to the application
- **THEN** system maintains their session without requiring re-authentication

### Requirement: System must extract user email from OAuth response
The system SHALL extract and store the user's email address from the Google OAuth response for participant verification.

#### Scenario: Email extraction
- **WHEN** Google OAuth authentication completes successfully
- **THEN** system retrieves the user's primary email address from the OAuth profile

#### Scenario: Email normalization
- **WHEN** system receives email address from OAuth
- **THEN** system normalizes email to lowercase for consistent lookup

### Requirement: System must handle OAuth errors
The system SHALL handle OAuth authentication errors gracefully and provide meaningful feedback to users.

#### Scenario: User denies OAuth consent
- **WHEN** user denies permission on Google consent screen
- **THEN** system redirects to login page with appropriate error message

#### Scenario: OAuth configuration error
- **WHEN** OAuth credentials are invalid or missing
- **THEN** system logs error and displays configuration error message

### Requirement: Authentication must be required for protected routes
The system SHALL require valid authentication session for accessing dashboard and QR code features.

#### Scenario: Unauthenticated access attempt
- **WHEN** unauthenticated user attempts to access dashboard
- **THEN** system redirects to login page

#### Scenario: Authenticated access
- **WHEN** authenticated user accesses dashboard
- **THEN** system allows access and displays personalized content
