## ADDED Requirements

### Requirement: System must verify participant registration by email
The system SHALL look up authenticated user's email in the participant data to determine if they are registered for the event.

#### Scenario: Registered participant verification
- **WHEN** authenticated user's email exists in CSV data
- **THEN** system successfully retrieves their ticket number

#### Scenario: Unregistered participant detection
- **WHEN** authenticated user's email does not exist in CSV data
- **THEN** system returns null indicating no registration found

### Requirement: Email matching must be case-insensitive
The system SHALL perform case-insensitive email comparison to prevent lookup failures due to case differences.

#### Scenario: Lowercase email lookup
- **WHEN** user logs in with "user@example.com" and CSV contains "user@example.com"
- **THEN** system finds match

#### Scenario: Mixed-case email lookup
- **WHEN** user logs in with "User@Example.Com" and CSV contains "user@example.com"
- **THEN** system finds match through case-insensitive comparison

#### Scenario: Uppercase email lookup
- **WHEN** user logs in with "USER@EXAMPLE.COM" and CSV contains "user@example.com"
- **THEN** system finds match

### Requirement: System must handle verification edge cases
The system SHALL handle edge cases in participant verification gracefully.

#### Scenario: Multiple matching entries
- **WHEN** CSV contains duplicate email addresses (should not happen)
- **THEN** system uses the first matching ticket number

#### Scenario: Empty email address
- **WHEN** authenticated user has empty or null email
- **THEN** system treats as unregistered participant

#### Scenario: Whitespace in email
- **WHEN** email contains leading or trailing whitespace
- **THEN** system trims whitespace before lookup

### Requirement: Verification must occur after authentication
The system SHALL only perform participant verification for authenticated users with valid sessions.

#### Scenario: Authenticated user verification
- **WHEN** user has valid authentication session
- **THEN** system performs participant lookup using session email

#### Scenario: Unauthenticated user handling
- **WHEN** user is not authenticated
- **THEN** system redirects to login without performing verification
