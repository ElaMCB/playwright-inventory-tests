# Regression Test Suite

This directory contains regression tests for the application. These tests are separate from the main test suite to avoid conflicts and provide focused testing of critical functionality.

## Structure

```
e2e/
├── pages/              # Page Object Models
├── utils/              # Test utilities
└── *.regression.spec.ts # Regression test files
```

## Running Tests

To run the regression test suite locally:

```bash
npm run test:regression
```

## Automated Testing

Tests are automatically run using GitHub Actions on:
- Every push to `main` and `feature/regression-tests` branches
- Every pull request targeting these branches

The workflow:
1. Sets up Node.js environment
2. Installs dependencies
3. Runs regression tests
4. Uploads test reports and screenshots as artifacts

### Test Reports

After each run, you can find:
- HTML test reports in the `playwright-report` artifact
- Test screenshots in the `test-screenshots` artifact

### Environment Setup

For GitHub Actions to work:
1. Add your test environment URL as a secret in GitHub repository settings:
   - Name: `BASE_URL`
   - Value: Your test environment URL

## Configuration

The regression tests use a separate configuration file: `playwright.regression.config.ts`

Key features:
- Runs only files matching `*.regression.spec.ts`
- Generates reports in `playwright-report/regression`
- Takes screenshots on test failures
- Runs tests in parallel
- Supports multiple browsers (Chrome, Firefox, Safari)

## Environment Variables

For local development, create a `.env` file in the root directory with:

```env
BASE_URL=your_test_environment_url
```

## Adding New Tests

1. Create a new test file with the pattern: `*.regression.spec.ts`
2. Import necessary Page Object Models
3. Write tests using the Playwright test framework
4. Run tests to verify

## Best Practices

1. Use Page Object Models for all page interactions
2. Keep tests independent and atomic
3. Use meaningful test descriptions
4. Add comments for complex test scenarios
5. Verify critical business functionality 