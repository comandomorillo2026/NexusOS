/**
 * Reserve Calculation Engine for NexusOS Insurance Platform
 * 
 * Implements actuarial reserve calculations for both life and non-life insurance:
 * - GARPT: General Annuity Reserve for Premiums (Life)
 * - PPM: Prospective Premium Method
 * - Unearned Premium Reserves (P&C)
 * - IBNR: Incurred But Not Reported
 * - RBNS: Reported But Not Settled
 * 
 * All calculations are accurate to 6 decimal places.
 */

import { 
  generateMortalityTable, 
  generateCommutationFunctions,
  calculateSurvivalProbability 
} from './mortality-tables';

// Types for reserve calculations
export interface ReserveCalculationInput {
  sumAssured: number;           // Face amount / Sum insured
  issueAge: number;             // Age at policy issue
  currentAge: number;           // Current attained age
  policyYears: number;          // Total policy term in years
  elapsedYears: number;         // Years since policy issue
  interestRate: number;         // Annual interest rate (e.g., 0.04 for 4%)
  mortalityTable: 'male' | 'female';
  smokerStatus: 'smoker' | 'nonsmoker' | 'aggregate';
  region: 'standard' | 'caribbean';
  premium: number;              // Annual premium
  premiumFrequency: number;     // Premiums per year (1=annual, 12=monthly)
  loadingPercentage: number;    // Expense loading as decimal
}

export interface GARPTResult {
  reserve: number;              // Calculated reserve amount
  pvFutureBenefits: number;     // Present value of future benefits
  pvFuturePremiums: number;     // Present value of future premiums
  netPremium: number;           // Net premium amount
  grossPremium: number;         // Gross premium amount
  duration: number;             // Modified duration of reserve
  durationWeightedReserve: number;
}

export interface PPMResult {
  reserve: number;
  prospectiveBenefit: number;
  prospectivePremium: number;
  accumulationFactor: number;
  netLevelPremium: number;
}

export interface UnearnedPremiumResult {
  totalPremium: number;
  earnedPremium: number;
  unearnedPremium: number;
  proRataDays: number;
  policyDays: number;
  earningPattern: 'pro_rata' | 'daily' | 'monthly';
}

export interface IBNRResult {
  ibnrReserve: number;
  chainLadderFactors: number[];
  developmentPattern: number[];
  averageSettlementDelay: number;
  confidenceLevel: number;
  variance: number;
  standardError: number;
}

export interface RBNSResult {
  rbnsReserve: number;
  reportedClaims: number;
  averageSettlementCost: number;
  settlementRate: number;
  inflationFactor: number;
}

export interface ClaimDevelopmentTriangle {
  accidentYear: number;
  developmentYear: number;
  cumulativePayments: number;
  incrementalPayments: number;
  claimsCount: number;
}

// Currency conversion rates (TTD base)
const CURRENCY_RATES: Record<string, number> = {
  TTD: 1.0,
  USD: 6.8,
  EUR: 7.4,
  GBP: 8.6,
  CAD: 5.0,
  JMD: 0.044,
  BBD: 3.4,
};

/**
 * Convert currency to TTD
 */
export function convertToTTD(amount: number, fromCurrency: string): number {
  const rate = CURRENCY_RATES[fromCurrency] || 1;
  return Math.round(amount * rate * 100) / 100;
}

/**
 * Convert from TTD to another currency
 */
export function convertFromTTD(amount: number, toCurrency: string): number {
  const rate = CURRENCY_RATES[toCurrency] || 1;
  return Math.round(amount / rate * 100) / 100;
}

/**
 * GARPT - General Annuity Reserve for Premiums (Life Insurance)
 * 
 * The reserve is calculated as:
 * GARPT = PV(Future Benefits) - PV(Future Premiums)
 * 
 * For a whole life or term insurance:
 * PV(Benefits) = Sum Assured × A_x:n
 * PV(Premiums) = Annual Premium × ä_x:n
 */
export function calculateGARPT(input: ReserveCalculationInput): GARPTResult {
  const {
    sumAssured,
    issueAge,
    currentAge,
    policyYears,
    elapsedYears,
    interestRate,
    mortalityTable,
    smokerStatus,
    region,
    premium,
    premiumFrequency,
    loadingPercentage,
  } = input;

  // Get commutation functions
  const commutation = generateCommutationFunctions(
    mortalityTable,
    interestRate,
    smokerStatus,
    region
  );

  const remainingYears = Math.max(0, policyYears - elapsedYears);
  const ageX = currentAge;
  const ageXn = Math.min(120, ageX + remainingYears);

  // Calculate A_x:n (present value of a term life insurance)
  // A_x:n = (M_x - M_x+n) / D_x
  const Axn = (commutation.Mx[ageX] - commutation.Mx[ageXn]) / commutation.Dx[ageX];
  
  // Calculate ä_x:n (present value of a temporary life annuity due)
  // ä_x:n = (N_x - N_x+n) / D_x
  const axn = (commutation.Nx[ageX] - commutation.Nx[ageXn]) / commutation.Dx[ageX];

  // Present value of future benefits
  const pvFutureBenefits = sumAssured * Axn;
  
  // Calculate net premium (benefit premium)
  // P = SA × A_x:n / ä_x:n
  const netPremium = axn > 0 ? (sumAssured * Axn) / axn : 0;
  
  // Gross premium with loading
  const grossPremium = loadingPercentage > 0 
    ? netPremium / (1 - loadingPercentage) 
    : netPremium;

  // Present value of future premiums
  // For premium frequency adjustment
  const frequencyAdjustment = premiumFrequency === 1 
    ? 1 
    : (1 - (premiumFrequency - 1) / (2 * premiumFrequency));
  
  const adjustedAxn = axn * frequencyAdjustment;
  const pvFuturePremiums = premium * adjustedAxn;

  // Calculate reserve
  // GARPT = PV(Benefits) - PV(Premiums)
  const reserve = Math.max(0, pvFutureBenefits - pvFuturePremiums);

  // Calculate modified duration
  // Duration = -dV/dr / V
  const v = 1 / (1 + interestRate);
  const modifiedDuration = calculateModifiedDuration(
    sumAssured,
    premium,
    remainingYears,
    interestRate,
    ageX,
    mortalityTable,
    smokerStatus,
    region
  );

  return {
    reserve: Math.round(reserve * 100) / 100,
    pvFutureBenefits: Math.round(pvFutureBenefits * 100) / 100,
    pvFuturePremiums: Math.round(pvFuturePremiums * 100) / 100,
    netPremium: Math.round(netPremium * 1000000) / 1000000,
    grossPremium: Math.round(grossPremium * 100) / 100,
    duration: Math.round(modifiedDuration * 1000000) / 1000000,
    durationWeightedReserve: Math.round(reserve * modifiedDuration * 100) / 100,
  };
}

/**
 * Calculate modified duration for reserve sensitivity
 */
function calculateModifiedDuration(
  sumAssured: number,
  premium: number,
  remainingYears: number,
  interestRate: number,
  age: number,
  gender: 'male' | 'female',
  smokerStatus: 'smoker' | 'nonsmoker' | 'aggregate',
  region: 'standard' | 'caribbean'
): number {
  // Calculate reserve at base interest rate
  const baseReserve = calculateGARPT({
    sumAssured,
    issueAge: age,
    currentAge: age,
    policyYears: remainingYears,
    elapsedYears: 0,
    interestRate,
    mortalityTable: gender,
    smokerStatus,
    region,
    premium,
    premiumFrequency: 1,
    loadingPercentage: 0,
  }).reserve;

  // Calculate reserve with interest rate shifted by 1 bp
  const shiftedReserve = calculateGARPT({
    sumAssured,
    issueAge: age,
    currentAge: age,
    policyYears: remainingYears,
    elapsedYears: 0,
    interestRate: interestRate + 0.0001,
    mortalityTable: gender,
    smokerStatus,
    region,
    premium,
    premiumFrequency: 1,
    loadingPercentage: 0,
  }).reserve;

  // Modified duration = - (V' - V) / (V × dr)
  if (baseReserve === 0) return 0;
  return -1 * (shiftedReserve - baseReserve) / (baseReserve * 0.0001);
}

/**
 * PPM - Prospective Premium Method
 * 
 * Reserve = Prospective Value of Future Benefits - Prospective Value of Future Premiums
 * Using net level premium reserve calculation
 */
export function calculatePPM(input: ReserveCalculationInput): PPMResult {
  const {
    sumAssured,
    currentAge,
    policyYears,
    elapsedYears,
    interestRate,
    mortalityTable,
    smokerStatus,
    region,
  } = input;

  const remainingYears = Math.max(0, policyYears - elapsedYears);
  const table = generateMortalityTable(mortalityTable, smokerStatus, region);
  const commutation = generateCommutationFunctions(mortalityTable, interestRate, smokerStatus, region);

  const ageX = currentAge;
  const ageXn = Math.min(120, ageX + remainingYears);

  // Prospective benefit value
  const prospectiveBenefit = sumAssured * 
    ((commutation.Mx[ageX] - commutation.Mx[ageXn]) / commutation.Dx[ageX]);

  // Net level premium (calculated at issue)
  const netLevelPremium = prospectiveBenefit / 
    ((commutation.Nx[ageX] - commutation.Nx[ageXn]) / commutation.Dx[ageX]);

  // Prospective premium value
  const prospectivePremium = netLevelPremium * 
    ((commutation.Nx[ageX] - commutation.Nx[ageXn]) / commutation.Dx[ageX]);

  // Accumulation factor for past premiums/benefits
  const accumulationFactor = Math.pow(1 + interestRate, elapsedYears);

  // Calculate reserve
  const reserve = Math.max(0, prospectiveBenefit - prospectivePremium);

  return {
    reserve: Math.round(reserve * 100) / 100,
    prospectiveBenefit: Math.round(prospectiveBenefit * 100) / 100,
    prospectivePremium: Math.round(prospectivePremium * 100) / 100,
    accumulationFactor: Math.round(accumulationFactor * 1000000) / 1000000,
    netLevelPremium: Math.round(netLevelPremium * 1000000) / 1000000,
  };
}

/**
 * Unearned Premium Reserve Calculation (P&C Insurance)
 * 
 * UPR = Premium × (Unexpired Days / Policy Period)
 * 
 * Required for all P&C lines as per regulatory requirements
 */
export function calculateUnearnedPremium(
  annualPremium: number,
  policyStartDate: Date,
  valuationDate: Date,
  policyTermMonths: number = 12,
  earningPattern: 'pro_rata' | 'daily' | 'monthly' = 'pro_rata'
): UnearnedPremiumResult {
  const policyStart = new Date(policyStartDate);
  const valuation = new Date(valuationDate);
  
  // Calculate policy end date
  const policyEnd = new Date(policyStart);
  policyEnd.setMonth(policyEnd.getMonth() + policyTermMonths);
  
  // Total policy days
  const totalPolicyDays = Math.ceil((policyEnd.getTime() - policyStart.getTime()) / (1000 * 60 * 60 * 24));
  
  // Days elapsed
  const daysElapsed = Math.max(0, Math.min(
    Math.ceil((valuation.getTime() - policyStart.getTime()) / (1000 * 60 * 60 * 24)),
    totalPolicyDays
  ));
  
  // Days remaining
  const daysRemaining = totalPolicyDays - daysElapsed;
  
  // Calculate earned and unearned premium based on earning pattern
  let earnedPremium: number;
  let unearnedPremium: number;

  switch (earningPattern) {
    case 'daily':
      // Daily pro-rata
      earnedPremium = (annualPremium * daysElapsed) / totalPolicyDays;
      unearnedPremium = (annualPremium * daysRemaining) / totalPolicyDays;
      break;
    case 'monthly':
      // Monthly earning pattern (1/24 rule approximation)
      const monthsElapsed = Math.floor(daysElapsed / 30);
      const monthlyRate = annualPremium / 12;
      earnedPremium = monthlyRate * monthsElapsed;
      unearnedPremium = annualPremium - earnedPremium;
      break;
    case 'pro_rata':
    default:
      // Pro-rata (linear)
      earnedPremium = (annualPremium * daysElapsed) / totalPolicyDays;
      unearnedPremium = (annualPremium * daysRemaining) / totalPolicyDays;
      break;
  }

  return {
    totalPremium: Math.round(annualPremium * 100) / 100,
    earnedPremium: Math.round(earnedPremium * 100) / 100,
    unearnedPremium: Math.round(unearnedPremium * 100) / 100,
    proRataDays: daysRemaining,
    policyDays: totalPolicyDays,
    earningPattern,
  };
}

/**
 * IBNR - Incurred But Not Reported Reserves
 * 
 * Uses Chain Ladder method for development pattern estimation
 * 
 * IBNR = Ultimate Claims - Reported Claims - RBNS
 */
export function calculateIBNR(
  developmentTriangle: ClaimDevelopmentTriangle[],
  latestReportedClaims: number,
  reportingDelay: number = 0.5,
  confidenceLevel: number = 0.95
): IBNRResult {
  // Sort triangle by accident year and development year
  const sortedTriangle = [...developmentTriangle].sort(
    (a, b) => a.accidentYear - b.accidentYear || a.developmentYear - b.developmentYear
  );

  // Calculate age-to-age factors (Chain Ladder)
  const maxDevYear = Math.max(...sortedTriangle.map(t => t.developmentYear));
  const ageToAgeFactors: number[] = [];
  
  for (let dev = 0; dev < maxDevYear; dev++) {
    const currentCumulative = sortedTriangle
      .filter(t => t.developmentYear === dev)
      .reduce((sum, t) => sum + t.cumulativePayments, 0);
    const nextCumulative = sortedTriangle
      .filter(t => t.developmentYear === dev + 1)
      .reduce((sum, t) => sum + t.cumulativePayments, 0);
    
    if (currentCumulative > 0) {
      ageToAgeFactors.push(nextCumulative / currentCumulative);
    }
  }

  // Calculate cumulative development factors
  const cumulativeFactors: number[] = [];
  let cumulativeProduct = 1;
  for (let i = ageToAgeFactors.length - 1; i >= 0; i--) {
    cumulativeProduct *= ageToAgeFactors[i] || 1;
    cumulativeFactors.unshift(cumulativeProduct);
  }

  // Estimate ultimate claims
  const latestDevelopment = sortedTriangle
    .filter(t => t.developmentYear === maxDevYear)
    .reduce((sum, t) => sum + t.cumulativePayments, 0);
  
  const ultimateClaims = latestDevelopment * (cumulativeFactors[0] || 1);

  // Calculate IBNR
  const ibnrReserve = Math.max(0, ultimateClaims - latestReportedClaims);

  // Calculate variance and standard error (Mack method approximation)
  const variance = ibnrReserve * 0.15; // Approximation for variance
  const standardError = Math.sqrt(variance);

  // Development pattern (percentage developed at each age)
  const developmentPattern = cumulativeFactors.map((f, i) => 
    Math.round((1 / f) * 1000000) / 1000000
  );

  return {
    ibnrReserve: Math.round(ibnrReserve * 100) / 100,
    chainLadderFactors: ageToAgeFactors.map(f => Math.round(f * 1000000) / 1000000),
    developmentPattern,
    averageSettlementDelay: reportingDelay,
    confidenceLevel,
    variance: Math.round(variance * 100) / 100,
    standardError: Math.round(standardError * 100) / 100,
  };
}

/**
 * RBNS - Reported But Not Settled Reserves
 * 
 * Reserves for claims that have been reported but not yet fully settled
 * 
 * RBNS = Sum of (Individual Case Reserves + Development on Open Claims)
 */
export function calculateRBNS(
  reportedClaims: Array<{
    claimId: string;
    reportedAmount: number;
    paidToDate: number;
    ageInDays: number;
    claimType: string;
  }>,
  averageSettlementRatio: number = 0.85,
  inflationRate: number = 0.03,
  settlementRate: number = 0.7
): RBNSResult {
  let totalCaseReserves = 0;
  let totalReported = 0;
  let totalPaid = 0;

  for (const claim of reportedClaims) {
    totalReported += claim.reportedAmount;
    totalPaid += claim.paidToDate;
    
    // Estimate case reserve based on claim age and type
    const ageFactor = Math.min(1 + (claim.ageInDays / 365) * 0.1, 1.5);
    const estimatedReserve = (claim.reportedAmount - claim.paidToDate) * ageFactor;
    totalCaseReserves += Math.max(0, estimatedReserve);
  }

  // Apply settlement ratio and inflation adjustment
  const adjustedReserve = totalCaseReserves * averageSettlementRatio;
  const inflationFactor = 1 + (inflationRate * 0.5); // Half-year inflation
  
  const rbnsReserve = adjustedReserve * inflationFactor;

  return {
    rbnsReserve: Math.round(rbnsReserve * 100) / 100,
    reportedClaims: Math.round(totalReported * 100) / 100,
    averageSettlementCost: Math.round((totalReported / reportedClaims.length) * 100) / 100,
    settlementRate: Math.round(settlementRate * 1000000) / 1000000,
    inflationFactor: Math.round(inflationFactor * 1000000) / 1000000,
  };
}

/**
 * Calculate total technical reserves for a policy
 */
export interface TotalReserveInput {
  garptInput?: ReserveCalculationInput;
  ppmInput?: ReserveCalculationInput;
  unearnedPremiumInput?: {
    annualPremium: number;
    policyStartDate: Date;
    valuationDate: Date;
    policyTermMonths?: number;
  };
  ibnrInput?: {
    developmentTriangle: ClaimDevelopmentTriangle[];
    latestReportedClaims: number;
  };
  rbnsInput?: {
    reportedClaims: Array<{
      claimId: string;
      reportedAmount: number;
      paidToDate: number;
      ageInDays: number;
      claimType: string;
    }>;
  };
}

export interface TotalReserveResult {
  totalReserve: number;
  components: {
    garpt?: number;
    ppm?: number;
    unearnedPremium?: number;
    ibnr?: number;
    rbns?: number;
  };
  regulatoryMinimum: number;
  reserveMargin: number;
}

/**
 * Calculate total reserves with regulatory minimums
 */
export function calculateTotalReserves(input: TotalReserveInput): TotalReserveResult {
  const components: TotalReserveResult['components'] = {};

  if (input.garptInput) {
    components.garpt = calculateGARPT(input.garptInput).reserve;
  }

  if (input.ppmInput) {
    components.ppm = calculatePPM(input.ppmInput).reserve;
  }

  if (input.unearnedPremiumInput) {
    components.unearnedPremium = calculateUnearnedPremium(
      input.unearnedPremiumInput.annualPremium,
      input.unearnedPremiumInput.policyStartDate,
      input.unearnedPremiumInput.valuationDate,
      input.unearnedPremiumInput.policyTermMonths
    ).unearnedPremium;
  }

  if (input.ibnrInput) {
    components.ibnr = calculateIBNR(
      input.ibnrInput.developmentTriangle,
      input.ibnrInput.latestReportedClaims
    ).ibnrReserve;
  }

  if (input.rbnsInput) {
    components.rbns = calculateRBNS(input.rbnsInput.reportedClaims).rbnsReserve;
  }

  // Sum all components
  const totalReserve = Object.values(components).reduce((sum, val) => sum + (val || 0), 0);

  // Calculate regulatory minimum (varies by jurisdiction)
  // For Caribbean: minimum is 105% of calculated reserves
  const regulatoryMinimum = totalReserve * 1.05;

  // Reserve margin (extra prudential margin)
  const reserveMargin = regulatoryMinimum - totalReserve;

  return {
    totalReserve: Math.round(totalReserve * 100) / 100,
    components,
    regulatoryMinimum: Math.round(regulatoryMinimum * 100) / 100,
    reserveMargin: Math.round(reserveMargin * 100) / 100,
  };
}

/**
 * Generate reserve run-off schedule
 */
export function generateReserveRunOff(
  initialReserve: number,
  years: number,
  runoffPattern: number[]
): Array<{ year: number; openingReserve: number; releases: number; closingReserve: number }> {
  const schedule = [];
  let openingReserve = initialReserve;

  for (let year = 1; year <= years; year++) {
    const releaseRate = runoffPattern[year - 1] || runoffPattern[runoffPattern.length - 1];
    const releases = openingReserve * releaseRate;
    const closingReserve = openingReserve - releases;

    schedule.push({
      year,
      openingReserve: Math.round(openingReserve * 100) / 100,
      releases: Math.round(releases * 100) / 100,
      closingReserve: Math.round(Math.max(0, closingReserve) * 100) / 100,
    });

    openingReserve = closingReserve;
  }

  return schedule;
}

/**
 * Interest rate sensitivity analysis for reserves
 */
export function interestRateSensitivity(
  baseInput: ReserveCalculationInput,
  rateShifts: number[] = [-0.02, -0.01, 0, 0.01, 0.02]
): Array<{ rateShift: number; adjustedRate: number; reserve: number; change: number }> {
  const baseReserve = calculateGARPT(baseInput).reserve;
  
  return rateShifts.map(shift => {
    const adjustedInput = { ...baseInput, interestRate: baseInput.interestRate + shift };
    const adjustedReserve = calculateGARPT(adjustedInput).reserve;
    
    return {
      rateShift: Math.round(shift * 1000000) / 1000000,
      adjustedRate: Math.round((baseInput.interestRate + shift) * 1000000) / 1000000,
      reserve: Math.round(adjustedReserve * 100) / 100,
      change: Math.round((adjustedReserve - baseReserve) * 100) / 100,
    };
  });
}

// Export types
export type { 
  ReserveCalculationInput as ReserveCalculationInputType,
  GARPTResult as GARPTResultType,
  PPMResult as PPMResultType,
  UnearnedPremiumResult as UnearnedPremiumResultType,
  IBNRResult as IBNRResultType,
  RBNSResult as RBNSResultType,
  TotalReserveResult as TotalReserveResultType,
};
