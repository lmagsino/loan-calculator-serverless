var irr = require('./irr_calculator');

const defaultPaymentPeriodsPerMonth = 2;
const defaultTenorInMonths = 1;
const defaultMinLoan = 1000.00;
const defaultMaxLoan = 50000.00;
const defaultIncrement = 1000.00;

const defaultNetSalaryPercentage = 0.5;
const defaultBaseSalaryPercentage = 0.35;

const defaultConvenienceFeePercentage = 0.06;
const defaultConvenienceFeePercentage1 = 0.025;
const defaultConvenienceFeePercentage4 = 0.14;
const defaultBankFee = 70.00;
const defaultTaxPercentage = 0.12;
const defaultInterestPercentage1 = 0;
const defaultInterestPercentage = 0;
const defaultInterestPercentage4 = 0;
const defaultDstPercentage = 0.00063;



class Details {
  constructor(
    salary,
    fees,
    currentLoans,
    paymentPeriodsPerMonth,
    tenorInMonths,
    minLoan,
    maxLoan,
    increment
  ) {
    this.salary = salary || new Salary();
    this.fees = fees || new Fees();
    this.currentLoans = parseFloat(currentLoans) || 0;
    this.paymentPeriodsPerMonth =
      parseInt(paymentPeriodsPerMonth) || defaultPaymentPeriodsPerMonth;
    this.tenorInMonths = parseInt(tenorInMonths) || defaultTenorInMonths;
    this.minLoan = parseFloat(minLoan) || defaultMinLoan;
    this.increment = parseFloat(increment) || defaultIncrement;
    this.maxLoan = parseFloat(maxLoan);
  }

  build(){
    return {
      'tenorInMonths': this.tenorInMonths,
      'paymentPeriods': this._paymentPeriods(),
      'paymentPeriodsPerMonth': this.paymentPeriodsPerMonth,
      'minLoan': this.minLoan,
      'maxLoan': this._loanableAmount(),
      'increment': this.increment,
      'feesTable': this._feesTable()
    }
  }

  _feesTable() {
    let fees = {};
    let paymentPeriods = this._paymentPeriods()
    for (
      let i = this.increment;
      i <= this._loanableAmount();
      i = i + this.increment
    ) {
      if (i === 0) break;

      fees[i] = {
        'grossLoanAmountPerPayPeriod': this.fees.splitEquallyAndRoundUp(
          i, paymentPeriods
        ),
        'grossBankFeePerPayPeriod': this.fees.grossItemPerPayPeriod(
          this.fees.bankFee, paymentPeriods
        ),
        'grossBankFee': this.fees.grossItem(this.fees.bankFee, paymentPeriods),
        'bankFee': this.fees.netItem(this.fees.bankFee, paymentPeriods),
        'dst': this.fees.combineInstallments(
          this.fees.dstPerPayPeriod(i, paymentPeriods), paymentPeriods
        ),
        'dstPerPayPeriod': this.fees.dstPerPayPeriod(i, paymentPeriods),
        'tax': this.fees.tax(i, paymentPeriods),
        'effectiveRate': this.fees.netEffectiveRate(i, paymentPeriods),
        'taxPerPayPeriod': this.fees.taxPerPayPeriod(i, paymentPeriods)
      };

      for ( let j = 1; j <= 4; j = j * 2 ) {
        let label = j == 2 ? '' : j.toString()
        let count = j == 2 ? paymentPeriods : j

        fees[i]['convenienceFeePerPayPeriod' + label] =
          this.fees.grossItemPerPayPeriod(
            this.fees.itemPercentage(i, count), count
          )
        fees[i]['grossConvenienceFee' + label] = this.fees.grossItem(
          this.fees.itemPercentage(i, count), count
        )
        fees[i]['convenienceFee' + label] = this.fees.netItem(
          this.fees.itemPercentage(i, count), count
        )
        fees[i]['interestPerPayPeriod' + label] =
          this.fees.grossItemPerPayPeriod(
            this.fees.itemPercentage(i, count, 'interest'), count
          )
        fees[i]['grossInterest' + label] = this.fees.grossItem(
          this.fees.itemPercentage(i, count, 'interest'), count
        ),
        fees[i]['interest' + label] = this.fees.netItem(
          this.fees.itemPercentage(i, count, 'interest'), count
        )
        fees[i]['paymentPerPeriod' + label] =
          this.fees.paymentPerPeriod(i, count)

        fees[i]['totalAmount' + label] = this.fees.totalAmount(i, count)
      }
    }

    return fees;
  }

  _loanableAmount() {
    let loanableAmount =
      this.salary.loanableAmount(
        this.maxLoan, this.minLoan, this.currentLoans, this.increment
      );
    return loanableAmount;
  }

  _paymentPeriods() {
    return this.tenorInMonths * this.paymentPeriodsPerMonth;
  }
}

class Salary {
  constructor(base, average, net, basePercentage, netPercentage) {
    this.base = parseFloat(base) || 0;
    this.average = parseFloat(average) || 0;
    this.net = parseFloat(net) || 0;
    this.basePercentage =
      parseFloat(basePercentage) || defaultBaseSalaryPercentage;
    this.netPercentage =
      parseFloat(netPercentage) || defaultNetSalaryPercentage;
  }

  loanableAmount(maxLoan, minLoan, currentLoans, increment) {
    let loanable = maxLoan < defaultMaxLoan ? maxLoan : defaultMaxLoan;
    loanable = loanable - currentLoans;
    loanable = Math.round(loanable / increment) * increment;

    if (currentLoans === 0 && loanable !== 0) {
      loanable = loanable > minLoan ? loanable : minLoan;
    }

    return loanable
  }
}

class Fees {
  constructor(
    convenienceFeePercentage,
    convenienceFeePercentage1,
    convenienceFeePercentage4,
    bankFee,
    taxPercentage,
    interestPercentage1,
    interestPercentage,
    interestPercentage4,
    dstPercentage,
    isFeesInclusive,
  ) {
    this.convenienceFeePercentage = convenienceFeePercentage !== undefined ?
      parseFloat(convenienceFeePercentage) : defaultConvenienceFeePercentage;
    this.convenienceFeePercentage1 = convenienceFeePercentage1 !== undefined ?
      parseFloat(convenienceFeePercentage1) : defaultConvenienceFeePercentage1;
    this.convenienceFeePercentage4 = convenienceFeePercentage4 !== undefined ?
      parseFloat(convenienceFeePercentage4) : defaultConvenienceFeePercentage4;
    this.bankFee = bankFee !== undefined ?
      parseFloat(bankFee) : defaultBankFee;
    this.taxPercentage = taxPercentage !== undefined ?
      parseFloat(taxPercentage) : defaultTaxPercentage;
    this.interestPercentage1 = interestPercentage1 !== undefined ?
      parseFloat(interestPercentage1) : defaultInterestPercentage1;
    this.interestPercentage = interestPercentage !== undefined ?
      parseFloat(interestPercentage) : defaultInterestPercentage;
    this.interestPercentage4 = interestPercentage4 !== undefined ?
      parseFloat(interestPercentage4) : defaultInterestPercentage4;
    this.dstPercentage = dstPercentage !== undefined ?
      parseFloat(dstPercentage) : defaultDstPercentage;
    this.isFeesInclusive = isFeesInclusive !== undefined ?
      isFeesInclusive : false;
  }

  combineInstallments(amount, paymentPeriods) {
    return this.roundNearest(amount * paymentPeriods)
  }

  splitEquallyAndRoundUp(amount, paymentPeriods) {
    return this.roundUp(amount / paymentPeriods)
  }

  taxPerPayPeriod(loanAmount, paymentPeriods) {
    let tax = this.tax(loanAmount, paymentPeriods) / paymentPeriods;
    return Math.round(tax * 100) / 100;
  }

  dstPerPayPeriod(amount, paymentPeriods) {
    let dst = amount * this.dstPercentage
    return this.splitEquallyAndRoundUp(dst, paymentPeriods)
  }

  rate(paymentPeriods, type = 'convenienceFee') {
    let itemRate = 0
    let label = paymentPeriods == 2 ? '' : paymentPeriods.toString()
    return this[type + 'Percentage' + label]
  }

  itemPercentage(amount, paymentPeriods, type = 'convenienceFee') {
    return this.rate(paymentPeriods, type) * amount
  }

  netLoanAmount(amount, paymentPeriods){
    let loanAmount = this.splitEquallyAndRoundUp(amount, paymentPeriods)
    return this.roundNearest(loanAmount * paymentPeriods)
  }

  paymentPerPeriod(loanAmount, paymentPeriods) {
    let paymentPerPeriod =
      this.totalAmount(loanAmount, paymentPeriods) / paymentPeriods
    return this.roundNearest(paymentPerPeriod)
  }

  totalAmount(loanAmount, paymentPeriods) {
    let totalAmount =
      this.netLoanAmount(loanAmount, paymentPeriods) +
      this.netItem(this.bankFee, paymentPeriods) +
      this.netItem(
        this.itemPercentage(loanAmount, paymentPeriods), paymentPeriods
      ) +
      this.netItem(
        this.itemPercentage(loanAmount, paymentPeriods, 'interest'),
        paymentPeriods
      )

    return this.roundNearest(totalAmount)
  }

  grossItemPerPayPeriod(amount, paymentPeriods) {
    let item = amount / paymentPeriods

    if (this.isFeesInclusive) {
      let tax = this.itemTaxPerPayPeriod(amount, paymentPeriods)
      return this.roundDown(item - tax)
    }

    return this.roundUp(item)
  }

  grossItem(amount, paymentPeriods) {
    let item = this.grossItemPerPayPeriod(amount, paymentPeriods)
    item = item * paymentPeriods
    return this.roundNearest(item)
  }

  netItem(amount, paymentPeriods) {
    let item = this.isFeesInclusive ?
      this.grossItem(amount, paymentPeriods) : amount

    let tax = this.itemTax(amount, paymentPeriods)

    return this.roundNearest(item + tax)
  }

  itemTaxPerPayPeriod(amount, paymentPeriods) {
    let itemTax = 0

    if (!this.isFeesInclusive) {
      itemTax = (amount * this.taxPercentage) / paymentPeriods
    }
    else {
      let grossItemAmount = (amount / (1 + this.taxPercentage))
      itemTax = (amount - grossItemAmount) / paymentPeriods
    }

    return this.roundUp(itemTax)
  }

  itemTax(amount, paymentPeriods) {
    let itemTax =
      this.itemTaxPerPayPeriod(amount, paymentPeriods) * paymentPeriods

    return this.roundNearest(itemTax)
  }

  tax(loanAmount, paymentPeriods) {
    let convenienceFee = this.itemPercentage(loanAmount, paymentPeriods)
    let convenienceFeeTax = this.itemTax(convenienceFee, paymentPeriods)
    let bankFeeTax = this.itemTax(this.bankFee, paymentPeriods)

    return this.roundNearest(convenienceFeeTax + bankFeeTax)
  }

  roundUp(amount) {
    return parseFloat((Math.ceil((amount) * 100) / 100).toFixed(2))
  }

  roundDown(amount) {
    return parseFloat((Math.floor((amount) * 100) / 100).toFixed(2))
  }

  roundNearest(amount) {
    return parseFloat((Math.round((amount) * 100) / 100).toFixed(2))
  }

  netEffectiveRate(amount, paymentPeriods) {
    let installment = this.paymentPerPeriod(amount, paymentPeriods)
    let cashflows = [-amount]

    for (let i = 0; i < paymentPeriods; i++) cashflows.push(installment)
    let EIR = Math.pow((1 + irr.calculator.IRR(cashflows)), paymentPeriods) - 1

    return this.roundNearest(EIR * 100)
  }
}

module.exports.Salary = Salary;
module.exports.Details = Details;
module.exports.Fees = Fees;
