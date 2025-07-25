# 📊 Serverless Loan Calculator

A sophisticated loan payment calculator built with Node.js and AWS Lambda, featuring advanced financial calculations including Internal Rate of Return (IRR) and flexible payment structures.

## 🚀 Features

- **Multi-tenure Support**: Calculate payments for 1, 2, and 4 payment periods
- **Advanced Fee Calculations**: Convenience fees, bank fees, taxes, and DST
- **IRR Calculations**: Accurate Internal Rate of Return using Newton-Raphson method
- **Flexible Loan Terms**: Customizable loan amounts, tenors, and payment frequencies
- **Serverless Architecture**: AWS Lambda deployment for scalability

## 🛠️ Tech Stack

- **Runtime**: Node.js 18.x
- **Framework**: Serverless Framework
- **Cloud**: AWS Lambda + API Gateway
- **Calculations**: Custom IRR implementation using Newton-Raphson method

## 📋 API Documentation

### POST /calculate

Calculate loan payment details based on salary and loan parameters.

**Request Body:**
```json
{
  "baseSalary": 50000,
  "netSalary": 35000,
  "currentLoans": 0,
  "maxLoan": 30000,
  "tenorInMonths": 12,
  "paymentPeriodsPerMonth": 2
}
```

**Response:**
```json
{
  "tenorInMonths": 12,
  "paymentPeriods": 24,
  "minLoan": 1000,
  "maxLoan": 30000,
  "feesTable": {
    "1000": {
      "paymentPerPeriod": 45.83,
      "effectiveRate": 12.50,
      "totalAmount": 1100
    }
  }
}
```

## 🧮 Financial Calculations

### Interest Rate Calculation
Uses Newton-Raphson method for precise IRR calculations:
- Net Present Value (NPV) computation
- Derivative-based convergence
- 100-iteration limit with 0.000001 precision

### Fee Structure
- **Convenience Fees**: Tiered based on payment periods (2.5%, 6%, 14%)
- **Bank Fees**: Fixed processing fees
- **Tax Calculations**: Configurable tax rates with inclusive/exclusive options
- **DST**: Documentary Stamp Tax calculations

## 🚀 Quick Start

### Local Development
```bash
# Install dependencies
npm install

# Start local server
npm run dev

# Test the endpoint
curl -X POST http://localhost:3000/calculate \
  -H "Content-Type: application/json" \
  -d '{"baseSalary": 50000, "maxLoan": 25000}'
```

### AWS Deployment
```bash
# Deploy to AWS
npm run deploy

# Deploy to specific stage
serverless deploy --stage production
```

## 📁 Project Structure

```
├── handler.js              # Lambda function handler
├── rate_calculator.js      # Core calculation logic
├── irr_calculator.js       # IRR mathematical implementation
├── serverless.yml          # Serverless configuration
├── tests/                  # Unit tests
├── docs/                   # Additional documentation
└── examples/               # Usage examples
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

## 📈 Performance

- **Cold Start**: ~200ms
- **Warm Execution**: ~50ms
- **Memory Usage**: 128MB average
- **Concurrent Executions**: 1000+ supported

## 🔒 Security Features

- Input validation and sanitization
- Rate limiting considerations
- No sensitive data logging
- Secure environment variable handling

## 📊 Use Cases

- **Personal Finance**: Loan affordability calculations
- **Banking Applications**: Payment schedule generation  
- **Financial Planning**: Compare different loan structures
- **Fintech Integration**: API for loan origination systems
