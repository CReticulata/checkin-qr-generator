## ADDED Requirements

### Requirement: Dashboard must display QR code for registered participants
The system SHALL display a personalized QR code on the dashboard page when the authenticated user is a registered participant.

#### Scenario: Successful QR code display
- **WHEN** registered participant accesses dashboard
- **THEN** system displays QR code image containing their EVENT_ID:Ticket_number

#### Scenario: QR code visibility
- **WHEN** QR code is displayed
- **THEN** image must be large enough to scan easily on mobile devices

#### Scenario: Event information display
- **WHEN** dashboard renders with QR code
- **THEN** system displays event name or identifier alongside QR code

### Requirement: Dashboard must show user information
The system SHALL display the authenticated user's email address and ticket number on the dashboard.

#### Scenario: User email display
- **WHEN** dashboard loads
- **THEN** system shows authenticated user's email address

#### Scenario: Ticket number display
- **WHEN** dashboard loads for registered participant
- **THEN** system displays their ticket number

### Requirement: Dashboard must redirect unregistered users to error page
The system SHALL redirect authenticated users without valid registration to a dedicated error page.

#### Scenario: Unregistered user redirection
- **WHEN** authenticated user's email is not found in CSV data
- **THEN** system redirects to /error page

#### Scenario: Error page content
- **WHEN** user lands on error page
- **THEN** page displays "Registration Not Found" message with explanation

#### Scenario: Error page logout option
- **WHEN** user is on error page
- **THEN** page provides option to logout and try different account

### Requirement: Dashboard must be responsive
The system SHALL ensure dashboard displays correctly on both mobile and desktop devices.

#### Scenario: Mobile display
- **WHEN** dashboard is accessed on mobile device
- **THEN** QR code and text are properly sized and readable

#### Scenario: Desktop display
- **WHEN** dashboard is accessed on desktop browser
- **THEN** layout is centered and appropriately sized

### Requirement: Dashboard must provide logout functionality
The system SHALL allow authenticated users to log out from the dashboard.

#### Scenario: Logout action
- **WHEN** user clicks logout button
- **THEN** system terminates session and redirects to login page

#### Scenario: Post-logout state
- **WHEN** user logs out
- **THEN** subsequent dashboard access requires re-authentication

### Requirement: Dashboard must handle loading states
The system SHALL display appropriate loading indicators while generating QR code and fetching data.

#### Scenario: Initial load
- **WHEN** dashboard page is loading
- **THEN** system shows loading indicator before displaying QR code

#### Scenario: Generation completion
- **WHEN** QR code generation completes
- **THEN** system hides loading indicator and displays QR code
