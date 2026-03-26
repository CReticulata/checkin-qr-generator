## MODIFIED Requirements

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
- **THEN** system displays event name from settings (Blob Storage) or default value「活動報到」

## ADDED Requirements

### Requirement: 登入頁面顯示活動名稱
系統 SHALL 在登入頁面顯示當前活動名稱，讓使用者確認正在報到的活動。

#### Scenario: 顯示活動名稱
- **WHEN** 使用者進入登入頁面
- **THEN** 系統從 /api/event 取得並顯示活動名稱

#### Scenario: 未設定活動名稱
- **WHEN** 活動名稱未設定
- **THEN** 系統顯示預設值「活動報到」

### Requirement: Dashboard 頁面顯示活動名稱
系統 SHALL 在 Dashboard 頁面標題處顯示當前活動名稱。

#### Scenario: 顯示活動名稱於標題
- **WHEN** 使用者進入 Dashboard 頁面
- **THEN** 系統在頁面標題處顯示活動名稱

#### Scenario: 未設定活動名稱
- **WHEN** 活動名稱未設定
- **THEN** 系統顯示預設值「活動報到」
