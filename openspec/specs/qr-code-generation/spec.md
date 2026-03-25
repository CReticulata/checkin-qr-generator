## ADDED Requirements

### Requirement: System must generate QR code with correct format
The system SHALL generate QR codes containing the string format EVENT_ID:Ticket_number where EVENT_ID is from environment configuration and Ticket_number is from CSV lookup.

#### Scenario: QR code content format
- **WHEN** generating QR code for verified participant
- **THEN** system creates QR code with content "${EVENT_ID}:${ticket_number}"

#### Scenario: EVENT_ID from environment
- **WHEN** constructing QR code content
- **THEN** system reads EVENT_ID from environment variable

#### Scenario: Ticket number from lookup
- **WHEN** constructing QR code content
- **THEN** system uses ticket number retrieved from CSV lookup for authenticated user's email

### Requirement: QR code must be generated server-side
The system SHALL generate QR codes on the server to prevent exposure of participant lookup logic to clients.

#### Scenario: Server-side generation
- **WHEN** dashboard page renders
- **THEN** server component generates QR code before sending HTML to client

#### Scenario: Data URL output
- **WHEN** QR code is generated
- **THEN** system produces base64-encoded data URL for image display

### Requirement: System must use qrcode library
The system SHALL use the qrcode npm package for QR code generation.

#### Scenario: QR code generation API
- **WHEN** generating QR code
- **THEN** system uses qrcode.toDataURL() method to create base64 image

#### Scenario: QR code readability
- **WHEN** QR code is generated
- **THEN** output must be scannable by standard QR code readers

### Requirement: QR code generation must handle errors
The system SHALL handle QR code generation errors and provide fallback behavior.

#### Scenario: Generation failure
- **WHEN** QR code generation fails due to invalid input
- **THEN** system logs error and displays error message to user

#### Scenario: Missing EVENT_ID
- **WHEN** EVENT_ID environment variable is not set
- **THEN** system logs error and prevents QR code generation
