# Moralis API Test Suite

This test suite is designed for testing the Moralis Wallet History API endpoint as part of the QA Engineer Practical Exercise.

## Overview

This test suite covers:
- **Task 1**: Test plan scenarios and edge cases
- **Task 2**: Hands-on API testing with transaction data validation
- **Task 3**: Reliability and monitoring considerations (documented in test scenarios)

## Prerequisites

1. Node.js (v14 or higher)
2. npm or yarn
3. Moralis API Key (get one at https://admin.moralis.com/api-keys)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Edit `.env` and add your Moralis API key:
```
MORALIS_API_KEY=your_api_key_here
MORALIS_API_BASE_URL=https://deep-index.moralis.io/api/v2.2
```

## Running Tests

### Run all tests:
```bash
npm test
```

### Run specific scenarios:
```bash
npm test -- --tags @smoke
npm test -- --tags @wallet_history
npm test -- --tags @edge_case
npm test -- --tags @data_accuracy
```

### Run with specific tags:
```bash
npm test -- --tags "@wallet_history and @validation"
```

## Test Scenarios

### Basic Functionality Tests
- Get wallet history with default parameters
- Validate transaction data structure and format
- Validate transaction ordering

### Edge Cases
- Empty wallet address
- Block range filtering
- Limit parameter testing
- Invalid address format
- Invalid chain parameter
- Boundary conditions (very large block numbers, limit of 1)


### Assumptions

- API requires valid API key in X-API-Key header
- Default chain is Ethereum (eth) if not specified

## Project Structure

```
e2e/moralis/
├── api/
│   ├── config/
│   │   ├── cucumber.cjs      # Cucumber configuration
│   │   ├── hooks.ts          # Before/After hooks
│   │   └── world.ts          # World setup
│   ├── enums/
│   │   └── chainTypeEnum.ts  # Chain type enumerations
│   ├── features/
│   │   └── wallet-service/   # Feature files
│   ├── interfaces/
│   │   └── wallet.ts         # TypeScript interfaces
│   ├── models/
│   │   └── wallet.ts         # API model classes
│   ├── schemas/
│   │   └── wallet_history_response_schema.json  # JSON schema
│   ├── steps/
│   │   ├── wallet_steps.ts   # Wallet-related steps
│   │   └── transaction_validation_steps.ts  # Validation steps
│   ├── utils/
│   │   └── blockchain.ts     # Blockchain utility functions
│   └── constants.ts          # Constants
├── moralisContext.ts         # Custom context
├── package.json
└── README.md
```

## Notes

- Tests use Cucumber/Gherkin for BDD-style test definitions
- Schema validation uses JSON Schema (Ajv)
- Soft assertions allow multiple validations per scenario
- All API calls are logged with cURL commands for debugging

## Troubleshooting

### API Key Issues
- Ensure `MORALIS_API_KEY` is set in `.env`
- Check API key is valid at https://admin.moralis.com/api-keys

### Schema Validation Failures
- Check schema file exists at `api/schemas/wallet_history_response_schema.json`
- Verify response structure matches expected schema

### Test Failures
- Check network connectivity
- Verify wallet address has transaction history
- Review logs for detailed error messages