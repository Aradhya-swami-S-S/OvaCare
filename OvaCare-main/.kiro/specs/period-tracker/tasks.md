# Period Tracker Implementation Plan

- [ ] 1. Backend Data Models and Database Setup
  - Create Period and PeriodNote MongoDB models with proper schemas
  - Set up database indexes for efficient querying
  - Implement data validation and constraints
  - _Requirements: 1.1, 7.1, 7.2_

- [x] 1.1 Create Period model


  - Define Period schema with userId, dates, cycle length, predictions, and reminder flags
  - Add indexes for userId and startDate for efficient queries
  - Implement validation for date ranges and cycle lengths
  - _Requirements: 1.1, 1.2_




- [ ] 1.2 Create PeriodNote model
  - Define PeriodNote schema with symptoms, medications, and custom notes
  - Add relationship to Period model via periodId
  - Implement validation for symptom enums and note length limits
  - _Requirements: 3.2, 3.3_

- [ ] 2. Backend API Endpoints
  - Implement RESTful API endpoints for period tracking operations
  - Add authentication middleware to protect all period endpoints



  - Implement cycle calculation and prediction logic
  - Create reminder checking functionality
  - _Requirements: 1.1, 1.2, 2.5, 7.4_

- [x] 2.1 Implement period CRUD endpoints

  - Create GET /api/period/cycles endpoint to fetch user's period data
  - Create POST /api/period/start endpoint to log new period
  - Create POST /api/period/end endpoint to mark period end
  - Create PUT /api/period/update endpoint for manual adjustments
  - Create DELETE /api/period/reset endpoint to clear all data
  - _Requirements: 1.1, 4.2, 4.3, 4.4_


- [ ] 2.2 Implement cycle calculation logic
  - Create function to calculate next period date (30-day default)
  - Implement average cycle length calculation from past cycles
  - Add logic to use average after 3+ logged cycles
  - Create function to calculate current cycle day

  - _Requirements: 1.2, 1.3, 1.4, 1.5_

- [ ] 2.3 Implement note management endpoints
  - Create GET /api/period/notes/:periodId endpoint to fetch notes
  - Create POST /api/period/notes endpoint to add new note
  - Create PUT /api/period/notes/:noteId endpoint to update note
  - Create DELETE /api/period/notes/:noteId endpoint to delete note
  - _Requirements: 3.1, 3.3, 3.4, 3.5_

- [ ] 2.4 Implement reminder system
  - Create GET /api/period/reminders endpoint to check pending reminders
  - Implement logic to detect 3-day advance and on-day reminders
  - Create POST /api/period/reminders/dismiss endpoint


  - Add reminder flag updates to prevent duplicate notifications
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 3. Frontend Core Components
  - Create main PeriodTracker component structure
  - Implement state management for period data
  - Add API integration for fetching and updating data
  - Create context or hooks for period tracking functionality
  - _Requirements: 1.3, 6.3, 6.5_

- [ ] 3.1 Create PeriodTracker main component
  - Build main container component with layout structure
  - Implement data fetching on component mount
  - Add state management for current cycle, past cycles, and notes
  - Create loading and error states
  - _Requirements: 1.3, 5.5_

- [ ] 3.2 Implement current cycle display
  - Show current cycle day calculation
  - Display days until next expected period
  - Add visual indicators for cycle phase
  - Show average cycle length if available
  - _Requirements: 1.3, 1.4_

- [ ] 3.3 Create action buttons
  - Implement "Add Note" button with modal trigger
  - Implement "Set Tracker" button with date picker modal
  - Implement "Reset Tracker" button with confirmation dialog
  - Add proper button styling and icons
  - _Requirements: 3.1, 4.1, 4.3_

- [ ] 4. Calendar and Timeline Components
  - Create visual calendar component with cycle highlighting
  - Implement cycle timeline with past periods display
  - Add expandable notes view for each cycle
  - Ensure responsive design for mobile devices
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.4_

- [ ] 4.1 Create PeriodCalendar component
  - Build calendar grid showing current month
  - Highlight period days, predicted period, and current day
  - Add color coding for different cycle phases
  - Implement month navigation
  - _Requirements: 1.3, 5.1_

- [ ] 4.2 Create CycleTimeline component
  - Display list of past cycles in chronological order
  - Show cycle start date, length, and note count for each cycle
  - Implement expand/collapse functionality for cycle details
  - Add empty state message when no cycles logged
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 4.3 Implement timeline note display
  - Show all notes for expanded cycle
  - Display symptom icons and severity
  - Format medications and custom notes
  - Add edit and delete options for notes
  - _Requirements: 3.4, 3.5, 5.3_

- [ ] 5. Modal Components
  - Create AddNoteModal for symptom logging
  - Create SetTrackerModal for date selection
  - Create ResetConfirmModal for tracker reset
  - Implement form validation and submission
  - _Requirements: 3.1, 3.2, 4.1, 4.2, 4.3, 4.4_

- [ ] 5.1 Create AddNoteModal component
  - Build form with cramps, flow, mood, and pain inputs
  - Add dynamic medication list with add/remove functionality
  - Implement custom notes text area
  - Add form validation and submission logic
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 5.2 Create SetTrackerModal component
  - Implement date picker for last period start date
  - Add validation to prevent future dates
  - Show confirmation of cycle recalculation
  - Handle API submission and success feedback
  - _Requirements: 4.1, 4.2_

- [ ] 5.3 Create ResetConfirmModal component
  - Display warning message about data deletion
  - Add confirmation checkbox or double-confirm button
  - Implement reset API call on confirmation
  - Show success message and prompt to set new date
  - _Requirements: 4.3, 4.4, 4.5_

- [ ] 6. Reminder Notification System
  - Create ReminderNotification component
  - Implement reminder checking on app load and login
  - Add notification display with dismiss functionality
  - Store dismissed reminders to prevent re-showing
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 6.1 Create ReminderNotification component
  - Build notification banner/toast component
  - Display 3-day advance and on-day reminder messages
  - Add dismiss button with API integration
  - Implement auto-dismiss after period is logged
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 6.2 Implement reminder checking logic
  - Check for pending reminders on component mount


  - Poll for reminders periodically while app is open
  - Display notifications in appropriate UI location
  - Handle multiple simultaneous reminders
  - _Requirements: 2.3, 2.4, 2.5_

- [ ] 7. UI Updates and Rebranding
  - Replace all "Symptom Tracker" references with "Period Tracker"
  - Update icons from old design to calendar/flower combination
  - Ensure consistent styling with existing dashboard
  - Verify mobile responsiveness across all components
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 7.1 Update TrackerPage component
  - Rename page title from "Symptom Tracker" to "Period Tracker"
  - Replace old tracker component with new PeriodTracker
  - Update page metadata and route information
  - Ensure navbar link text is updated
  - _Requirements: 6.1_

- [ ] 7.2 Update icons and visual elements
  - Replace tracker icon with Calendar + Flower2 combination
  - Update symptom icons (cramps, flow, mood, pain)
  - Ensure all icons are from lucide-react library
  - Maintain consistent icon sizing and colors
  - _Requirements: 6.2_

- [ ] 7.3 Apply consistent styling
  - Use existing purple theme colors throughout
  - Match button styles with dashboard components
  - Ensure card and modal styling is consistent
  - Apply proper spacing and typography
  - _Requirements: 6.3_

- [ ] 7.4 Implement responsive design
  - Test all components on mobile devices
  - Adjust calendar layout for small screens
  - Ensure modals are mobile-friendly
  - Optimize touch targets for mobile interaction
  - _Requirements: 6.4, 6.5_

- [ ] 8. Testing and Quality Assurance
  - Test cycle calculation accuracy
  - Verify reminder system triggers correctly
  - Test all CRUD operations for periods and notes
  - Ensure data privacy and security measures
  - Perform cross-browser and device testing
  - _Requirements: All requirements validation_

- [ ] 8.1 Test cycle calculations
  - Verify 30-day default prediction works correctly
  - Test average cycle length calculation with various data
  - Ensure predictions update when new periods are logged
  - Test edge cases (very short/long cycles)
  - _Requirements: 1.2, 1.3, 1.4, 1.5_

- [ ] 8.2 Test reminder system
  - Verify 3-day advance reminders trigger correctly
  - Test on-day reminders appear at right time
  - Ensure dismissed reminders don't reappear
  - Test reminder recalculation after new period logged
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 8.3 Test data operations
  - Test period logging, updating, and deletion
  - Verify note creation, editing, and deletion
  - Test tracker reset functionality
  - Ensure data is user-specific and secure
  - _Requirements: 3.3, 3.5, 4.2, 4.4, 7.1, 7.4_

- [ ] 8.4 Perform integration testing
  - Test complete user flow from setup to tracking
  - Verify all components work together correctly
  - Test error handling and edge cases
  - Ensure mobile and desktop experiences are smooth
  - _Requirements: 6.4, 6.5_