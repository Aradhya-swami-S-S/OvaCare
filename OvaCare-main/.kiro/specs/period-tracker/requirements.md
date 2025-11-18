# Period Tracker Requirements

## Introduction

This specification outlines the replacement of the existing Symptom Tracker with a comprehensive Period Tracker system designed specifically for logged-in users. The system will track menstrual cycles, provide automatic reminders, and allow users to log detailed notes about their periods.

## Requirements

### Requirement 1: Period Cycle Tracking

**User Story:** As a logged-in user, I want to track my menstrual cycles so that I can monitor my reproductive health and predict future periods.

#### Acceptance Criteria

1. WHEN a user logs their last period date THEN the system SHALL store this information in the database associated with their user account
2. WHEN the system calculates the next expected period THEN it SHALL use a default 30-day interval from the last logged period
3. WHEN a user views their period tracker THEN the system SHALL display their current cycle day and days until next expected period
4. WHEN a user has multiple logged periods THEN the system SHALL calculate their average cycle length
5. IF a user has logged 3 or more periods THEN the system SHALL use the average cycle length for predictions instead of the default 30 days

### Requirement 2: Automatic Reminder System

**User Story:** As a user, I want to receive reminders about my upcoming period so that I can be prepared.

#### Acceptance Criteria

1. WHEN the expected period date is 3 days away THEN the system SHALL send a reminder notification to the user
2. WHEN the expected period date arrives THEN the system SHALL send an on-day reminder notification
3. WHEN a user is logged in THEN the system SHALL check for pending reminders and display them
4. WHEN a user dismisses a reminder THEN it SHALL not appear again for that cycle
5. IF the user logs a new period THEN the reminder system SHALL recalculate based on the new date

### Requirement 3: Period Logging and Notes

**User Story:** As a user, I want to log detailed information about my periods so that I can track symptoms and patterns over time.

#### Acceptance Criteria

1. WHEN a user clicks "Add Note" THEN the system SHALL display a form to log period details
2. WHEN logging a note THEN the user SHALL be able to record: cramps intensity, flow level, mood, pain level, medications taken, and custom notes
3. WHEN a user saves a note THEN it SHALL be associated with the current cycle and stored in the database
4. WHEN viewing past cycles THEN the user SHALL see all notes logged for each cycle
5. WHEN a user edits a note THEN the system SHALL update the existing note without creating duplicates

### Requirement 4: Manual Tracker Controls

**User Story:** As a user, I want to manually control my period tracker settings so that I can ensure accurate tracking.

#### Acceptance Criteria

1. WHEN a user clicks "Set Tracker" THEN the system SHALL display a date picker to select their last period start date
2. WHEN a user selects a date THEN the system SHALL save it and recalculate the next expected period
3. WHEN a user clicks "Reset Tracker" THEN the system SHALL display a confirmation dialog
4. WHEN a user confirms reset THEN the system SHALL clear all logged periods and notes for that user
5. IF a user resets the tracker THEN they SHALL be prompted to set a new starting date

### Requirement 5: Cycle Timeline Display

**User Story:** As a user, I want to view a timeline of my past cycles so that I can see patterns and history at a glance.

#### Acceptance Criteria

1. WHEN a user views the period tracker THEN the system SHALL display a timeline of past cycles
2. WHEN displaying the timeline THEN each cycle SHALL show: start date, cycle length, and number of notes
3. WHEN a user clicks on a past cycle THEN the system SHALL expand to show all notes for that cycle
4. WHEN viewing the timeline THEN cycles SHALL be ordered from most recent to oldest
5. IF there are no logged cycles THEN the system SHALL display a helpful message prompting the user to start tracking

### Requirement 6: UI/UX Updates

**User Story:** As a user, I want the period tracker to have a clean, modern interface that is easy to use on any device.

#### Acceptance Criteria

1. WHEN the application loads THEN all instances of "Symptom Tracker" SHALL be replaced with "Period Tracker"
2. WHEN viewing the period tracker icon THEN it SHALL use a calendar or flower icon (not pink teardrops)
3. WHEN using the period tracker THEN the styling SHALL be consistent with the existing dashboard design
4. WHEN accessing the tracker on mobile THEN the layout SHALL be responsive and touch-friendly
5. WHEN navigating between tracker features THEN transitions SHALL be smooth and intuitive

### Requirement 7: Data Privacy and Security

**User Story:** As a user, I want my period tracking data to be private and secure so that my personal health information is protected.

#### Acceptance Criteria

1. WHEN a user logs period data THEN it SHALL only be accessible to that specific user
2. WHEN the system stores period data THEN it SHALL be encrypted in the database
3. WHEN a user logs out THEN their period data SHALL not be cached in the browser
4. WHEN accessing period data THEN the system SHALL require valid authentication
5. IF a user deletes their account THEN all period tracking data SHALL be permanently deleted

## Technical Considerations

- Period data should be stored in a new MongoDB collection with user association
- Reminder system should use scheduled jobs or check on user login
- Date calculations should account for timezone differences
- Average cycle length should be calculated from at least 3 cycles for accuracy
- UI should use existing color scheme and component patterns

## Success Criteria

- Users can successfully log and track their menstrual cycles
- Automatic reminders are delivered at appropriate times
- Users can add detailed notes about symptoms and experiences
- Timeline displays past cycles clearly and intuitively
- All UI references updated from "Symptom Tracker" to "Period Tracker"
- Mobile-responsive design works smoothly on all devices
- Data is secure and private to each user