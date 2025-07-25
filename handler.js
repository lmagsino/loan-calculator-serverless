var rate = require('./rate_calculator');

'use strict';

module.exports.getRateDetails = (event, context, callback) => {
  let payload = JSON.parse(event.body);
  let baseSalary = payload['baseSalary'];
  let netSalary = payload['netSalary'];
  let averageSalary = payload['averageSalary'];
  let netSalaryPercentage = payload['netSalaryPercentage'];
  let baseSalaryPercentage = payload['baseSalaryPercentage'];
  let paymentPeriodsPerMonth = payload['paymentPeriodsPerMonth'];
  let tenorInMonths = payload['tenorInMonths'];
  let minLoan = payload['minLoan'];
  let maxLoan = payload['maxLoan'];
  let currentLoans = payload['currentLoans'];
  let increment = payload['increment'];
  let convenienceFeePercentage = payload['convenienceFeePercentage'];
  let convenienceFeePercentage1 = payload['convenienceFeePercentage1'];
  let convenienceFeePercentage4 = payload['convenienceFeePercentage4'];
  let bankFee = payload['bankFee'];
  let taxPercentage = payload['taxPercentage'];
  let interestPercentage1 = payload['interestPercentage1'];
  let interestPercentage = payload['interestPercentage'];
  let interestPercentage4 = payload['interestPercentage4'];
  let dstPercentage = payload['dstPercentage'];
  let isFeesInclusive = payload['isFeesInclusive'];

  salary = new rate.Salary (
    baseSalary,
    averageSalary,
    netSalary,
    baseSalaryPercentage,
    netSalaryPercentage
  );

  fees = new rate.Fees (
    convenienceFeePercentage,
    convenienceFeePercentage1,
    convenienceFeePercentage4,
    bankFee,
    taxPercentage,
    interestPercentage1,
    interestPercentage,
    interestPercentage4,
    dstPercentage,
    isFeesInclusive
  );

  rates = new rate.Details (
    salary,
    fees,
    currentLoans,
    paymentPeriodsPerMonth,
    tenorInMonths,
    minLoan,
    maxLoan,
    increment
  );

  const response = {
    'statusCode': 200,
    'headers': { 'Content-Type': 'application/json' },
    'body': JSON.stringify(rates.build()),
    'isBase64Encoded': false
  };

  callback(null, response);
};
