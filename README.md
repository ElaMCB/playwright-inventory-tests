# Playwright Regression Tests

A comprehensive regression test suite built with Playwright for automated end-to-end testing.

## Overview

This repository contains automated regression tests that verify critical functionality of the application. The test suite is designed to run independently of the main application codebase, making it easy to maintain and update.

## Features

- 🧪 Comprehensive regression test suite
- 🔄 Automated testing with GitHub Actions
- 📊 Detailed test reports and screenshots
- 🌐 Cross-browser testing support
- 📱 Responsive design testing
- ♿ Accessibility testing
- 🔍 Visual regression testing

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/your-username/playwright-regression-tests.git
cd playwright-regression-tests
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your test environment details
```

4. Run tests:
```bash
npm run test:regression
```

## Test Structure

```
├── e2e/
│   ├── pages/              # Page Object Models
│   ├── utils/              # Test utilities
│   └── *.regression.spec.ts # Test files
├── playwright.regression.config.ts
└── package.json
```

## Documentation

- [Test Documentation](e2e/README.md)
- [Page Object Models](e2e/pages/README.md)
- [Test Utilities](e2e/utils/README.md)

## Contributing

1. Create a new branch for your changes
2. Write your tests
3. Run the test suite locally
4. Submit a pull request

## License

ISC 