# Regression Test Suite Documentation

## Overview
This document outlines the regression test suite implemented for the application. The tests are located in `e2e/regression.spec.ts`.

## Test Categories

### 1. Authentication and Navigation
- **Test**: `should successfully log in with valid credentials`
  - Verifies successful login with valid credentials
  - Checks user profile visibility
  - Validates dashboard URL

- **Test**: `should maintain session after page refresh`
  - Verifies session persistence
  - Validates user remains logged in after refresh

- **Test**: `should navigate to all main sections`
  - Tests navigation to Dashboard, Inventory Search, Reports, and Settings
  - Verifies each section loads correctly

### 2. Dashboard
- **Test**: `should display all dashboard widgets`
  - Verifies visibility of:
    - Inventory Summary
    - Recent Activity
    - Alerts
    - Performance Metrics

- **Test**: `should update dashboard data on refresh`
  - Validates data updates after page refresh
  - Compares initial and refreshed data

### 3. Notifications
- **Test**: `should display notification badge`
  - Verifies notification badge visibility
  - Tests notification list display
  - Validates mark as read functionality

### 4. Search Functionality
- **Test**: `should perform global search`
  - Tests search input functionality
  - Verifies search results display
  - Tests search filters

### 5. Inventory Search
- **Test**: `should load inventory search page`
  - Verifies search form visibility
  - Tests basic search functionality
  - Validates error handling

### 6. Reports
- **Test**: `should generate and download reports`
  - Tests report generation
  - Validates PDF download
  - Tests report scheduling

### 7. Settings
- **Test**: `should update user preferences`
  - Tests preference updates
  - Validates password change functionality

### 8. Accessibility and Performance
- **Test**: `should meet accessibility standards`
  - Verifies ARIA attributes
  - Tests keyboard navigation
  - Validates page load performance

## Implementation Details

### Prerequisites
- Node.js and npm installed
- Playwright installed
- Environment variables configured in `.env`:
  ```
  AUTH0_DOMAIN=your-domain
  AUTH0_USERNAME=your-username
  AUTH0_PASSWORD=your-password
  ```

### Running Tests
```bash
# Run all regression tests
npx playwright test e2e/regression.spec.ts

# Run specific test category
npx playwright test e2e/regression.spec.ts --grep "Authentication"

# Run with UI mode
npx playwright test e2e/regression.spec.ts --ui
```

### Test Data
The tests use the following test data:
- Dates: January 2024, February 2024, March 2024
- Locations: Main Warehouse, East Warehouse, West Warehouse
- Carriers: SHIPPER, CARRIER

## ADO Integration
To link this test suite to an ADO user story:

1. Add this documentation as a link in your ADO user story
2. Reference the test file location: `e2e/regression.spec.ts`
3. Add test results as attachments to the user story
4. Update test status in ADO test cases

## Maintenance
- Update selectors when UI changes
- Modify test data as needed
- Add new test cases for new features
- Review and update environment variables

## Related Files
- `e2e/regression.spec.ts`: Main test file
- `.env`: Environment configuration
- `playwright.config.ts`: Playwright configuration 