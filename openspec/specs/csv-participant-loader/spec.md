## ADDED Requirements

### Requirement: System must parse CSV file with correct column mapping
The system SHALL parse the participants.csv file located in the project root directory, extracting email from column 5 (index 4) and ticket number from column 2 (index 1).

#### Scenario: CSV file parsing
- **WHEN** application starts
- **THEN** system reads participants.csv and parses all rows using csv-parse library

#### Scenario: Header row handling
- **WHEN** parsing CSV file
- **THEN** system skips the first row (header row) and only processes data rows

#### Scenario: Column extraction
- **WHEN** processing each CSV row
- **THEN** system extracts email from index 4 and ticket number from index 1

### Requirement: System must build email-to-ticket lookup map
The system SHALL create an in-memory Map structure with email as key and ticket number as value for O(1) lookup performance.

#### Scenario: Map construction
- **WHEN** CSV parsing completes
- **THEN** system builds Map<string, string> with email as key and ticket number as value

#### Scenario: Email normalization in map
- **WHEN** adding entries to the map
- **THEN** system converts all email keys to lowercase for case-insensitive lookup

#### Scenario: Duplicate email handling
- **WHEN** CSV contains duplicate email addresses
- **THEN** system uses the first occurrence and logs a warning

### Requirement: System must handle CSV parsing errors
The system SHALL validate CSV file format and handle parsing errors gracefully.

#### Scenario: Missing CSV file
- **WHEN** participants.csv file does not exist at startup
- **THEN** system logs critical error and prevents application from starting

#### Scenario: Malformed CSV data
- **WHEN** CSV file contains invalid format (e.g., quoted fields, embedded commas)
- **THEN** csv-parse library handles edge cases correctly

#### Scenario: Insufficient columns
- **WHEN** CSV row has fewer than 5 columns
- **THEN** system logs warning and skips the row

### Requirement: CSV loader must provide lookup function
The system SHALL expose a function to retrieve ticket number by email with O(1) time complexity.

#### Scenario: Successful email lookup
- **WHEN** lookup function is called with registered email
- **THEN** system returns corresponding ticket number

#### Scenario: Failed email lookup
- **WHEN** lookup function is called with unregistered email
- **THEN** system returns null

#### Scenario: Case-insensitive lookup
- **WHEN** lookup is performed with mixed-case email (e.g., User@Example.com)
- **THEN** system finds match regardless of case differences

### Requirement: CSV file must be stored securely
The system SHALL store participants.csv in src/data/ directory to prevent public URL access.

#### Scenario: File location validation
- **WHEN** application starts
- **THEN** system reads CSV from src/data/participants.csv (not public/ directory)

#### Scenario: Public access prevention
- **WHEN** user attempts to access CSV via URL (e.g., /data/participants.csv)
- **THEN** system returns 404 or prevents access
