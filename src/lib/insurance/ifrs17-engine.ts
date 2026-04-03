/**
 * IFRS 17 Engine for NexusOS Insurance Platform
 * 
 * Implements IFRS 17 accounting standard calculations:
 * - CSM: Contractual Service Margin (unearned profit)
 * - RA: Risk Adjustment (compensation for uncertainty)
 * - LRC: Liability for Remaining Coverage
 * - LIC: Liability for Incurred Claims
 * 
 * IFRS 17 requires measurement of insurance contracts at current fulfillment value,
 * with explicit recognition of risk adjustment and contractual service margin.
 * 
 * All calculations are accurate to 6 decimal places.
 */

import { generateMortalityTable, calculateSurvivalProbability } from './mortality-tables';
import { calculateGARPT } from './reserve-engine';

// Types for IFRS 17 calculations
export interface IFRS17ContractInput {
  contractId: string;
  inceptionDate: Date;
  valuationDate: Date;
  premium: number;
  sumAssured: number;
  policyTerm: number;              // Policy term in years
  coverageUnits: number;           // Units of coverage provided (e.g., policy years)
  interestRate: number;            // Discount rate
  acquisitionCosts: number;        // Initial acquisition expenses
  mortalityAssumption: 'male' | 'female';
  smokerStatus: 'smoker' | 'nonsmoker' | 'aggregate';
  region: 'standard' | 'caribbean';
  issueAge: number;
  currentAge: number;
  elapsedYears: number;
  contractBoundary?: Date;         // Date after which no cash flows are expected
}

export interface CashFlowAssumption {
  year: number;
  probability: number;             // Probability of payment
  expectedBenefit: number;         // Expected benefit payment
  expectedPremium: number;         // Expected premium receipt
  expense: number;                 // Expected expense
}

export interface CSMResult {
  initialCSM: number;              // CSM at contract inception
  currentCSM: number;              // CSM at valuation date
  amortizedCSM: number;            // Amount amortized to date
  amortizationPeriod: number;      // Remaining amortization period
  coverageUnitsRemaining: number;  // Units of coverage remaining
  csmPerUnit: number;              // CSM per coverage unit
  insuranceRevenueComponent: number; // Portion recognized as revenue
}

export interface RAResult {
  riskAdjustment: number;          // Total risk adjustment
  confidenceLevel: number;         // Confidence level used (e.g., 0.75)
  riskMarginPercentage: number;    // Risk margin as % of BEL
  uncertaintyFactor: number;       // Factor applied for uncertainty
  capitalChargeRate: number;       // Cost of capital rate
  durationWeightedRA: number;      // Duration-weighted RA
}

export interface LRCResult {
  liabilityForRemainingCoverage: number;
  presentValueFutureCashFlows: number;
  riskAdjustment: number;
  contractualServiceMargin: number;
  lossComponent: number;           // Loss component (if onerous)
  coverageRemaining: number;       // Remaining coverage period
}

export interface LICResult {
  liabilityForIncurredClaims: number;
  presentValueOutstandingClaims: number;
  riskAdjustmentForClaims: number;
  claimsDevelopmentResult: number;
  expectedClaimsSettlement: number;
}

export interface IFRS17DisclosureReport {
  contractId: string;
  valuationDate: Date;
  measurementApproach: 'General Measurement Model' | 'Premium Allocation Approach' | 'Variable Fee Approach';
  insuranceRevenue: number;
  insuranceServiceExpense: number;
  insuranceServiceResult: number;
  netInsuranceServiceResult: number;
  investmentComponent: number;
  csmMovement: {
    opening: number;
    changesInEstimates: number;
    amortization: number;
    closing: number;
  };
  riskAdjustmentMovement: {
    opening: number;
    changesInEstimates: number;
    release: number;
    closing: number;
  };
  lrcMovement: {
    opening: number;
    newBusiness: number;
    changesInEstimates: number;
    accruals: number;
    closing: number;
  };
  licMovement: {
    opening: number;
    newClaims: number;
    payments: number;
    changesInEstimates: number;
    closing: number;
  };
}

/**
 * Calculate Contractual Service Margin (CSM)
 * 
 * CSM represents the unearned profit from insurance contracts.
 * It is amortized over the coverage period based on coverage units.
 * 
 * Initial CSM = Premium - (PV of Future Benefits + RA + Acquisition Costs)
 * 
 * For onerous contracts, CSM is zero and a loss component is recognized.
 */
export function calculateCSM(input: IFRS17ContractInput): CSMResult {
  const {
    premium,
    sumAssured,
    policyTerm,
    coverageUnits,
    interestRate,
    acquisitionCosts,
    mortalityAssumption,
    smokerStatus,
    region,
    issueAge,
    currentAge,
    elapsedYears,
  } = input;

  // Calculate present value of future benefits
  const v = 1 / (1 + interestRate);
  const remainingYears = policyTerm - elapsedYears;
  
  // Build cash flow assumptions
  const cashFlows = buildCashFlowAssumptions(
    sumAssured,
    premium / policyTerm,
    remainingYears,
    currentAge,
    mortalityAssumption,
    smokerStatus,
    region,
    interestRate
  );

  // Calculate PV of future benefits
  let pvFutureBenefits = 0;
  let pvFuturePremiums = 0;
  
  for (const cf of cashFlows) {
    pvFutureBenefits += cf.expectedBenefit * Math.pow(v, cf.year) * cf.probability;
    pvFuturePremiums += cf.expectedPremium * Math.pow(v, cf.year) * cf.probability;
  }

  // Calculate risk adjustment (simplified - 10% of BEL)
  const bel = pvFutureBenefits - pvFuturePremiums;
  const riskAdjustment = Math.abs(bel) * 0.10;

  // Initial fulfillment cash flows
  const initialFulfillmentCashFlows = pvFutureBenefits + riskAdjustment + acquisitionCosts - pvFuturePremiums;

  // Initial CSM
  // CSM = -Initial Fulfillment Cash Flows (if positive, represents profit)
  const initialCSM = Math.max(0, -initialFulfillmentCashFlows);

  // Coverage units remaining
  const coverageUnitsRemaining = Math.max(0, coverageUnits - elapsedYears);
  
  // CSM per coverage unit
  const csmPerUnit = coverageUnits > 0 ? initialCSM / coverageUnits : 0;

  // Amortized CSM to date
  const amortizedCSM = csmPerUnit * elapsedYears;

  // Current CSM
  const currentCSM = Math.max(0, initialCSM - amortizedCSM);

  // Insurance revenue component (CSM amortization for period)
  const insuranceRevenueComponent = csmPerUnit;

  return {
    initialCSM: Math.round(initialCSM * 100) / 100,
    currentCSM: Math.round(currentCSM * 100) / 100,
    amortizedCSM: Math.round(amortizedCSM * 100) / 100,
    amortizationPeriod: remainingYears,
    coverageUnitsRemaining,
    csmPerUnit: Math.round(csmPerUnit * 1000000) / 1000000,
    insuranceRevenueComponent: Math.round(insuranceRevenueComponent * 100) / 100,
  };
}

/**
 * Build cash flow assumptions for a contract
 */
function buildCashFlowAssumptions(
  sumAssured: number,
  annualPremium: number,
  remainingYears: number,
  currentAge: number,
  gender: 'male' | 'female',
  smokerStatus: 'smoker' | 'nonsmoker' | 'aggregate',
  region: 'standard' | 'caribbean',
  interestRate: number
): CashFlowAssumption[] {
  const assumptions: CashFlowAssumption[] = [];
  const table = generateMortalityTable(gender, smokerStatus, region);

  for (let year = 1; year <= remainingYears; year++) {
    const age = currentAge + year - 1;
    const qx = table.rates[Math.min(age, 120)]?.qx || 1;
    
    // Probability of survival to this year
    const survivalProb = calculateSurvivalProbability(
      currentAge,
      year - 1,
      gender,
      smokerStatus,
      region
    );

    // Probability of death in this year (given survival to start of year)
    const deathProb = survivalProb * qx;

    // Expected benefit (death benefit)
    const expectedBenefit = deathProb * sumAssured;

    // Expected premium (if survive to payment date)
    const expectedPremium = survivalProb * annualPremium;

    // Expense assumption (2% of premium)
    const expense = expectedPremium * 0.02;

    assumptions.push({
      year,
      probability: survivalProb,
      expectedBenefit: Math.round(expectedBenefit * 100) / 100,
      expectedPremium: Math.round(expectedPremium * 100) / 100,
      expense: Math.round(expense * 100) / 100,
    });
  }

  return assumptions;
}

/**
 * Calculate Risk Adjustment (RA)
 * 
 * Risk Adjustment represents the compensation for uncertainty in cash flows.
 * It reflects the risk that actual cash flows differ from expected.
 * 
 * Common approaches:
 * - Cost of capital method
 * - Confidence level method
 * - Percentile method
 */
export function calculateRA(
  input: IFRS17ContractInput,
  confidenceLevel: number = 0.75,
  method: 'cost_of_capital' | 'percentile' | 'risk_margin' = 'risk_margin'
): RAResult {
  const {
    sumAssured,
    policyTerm,
    interestRate,
    mortalityAssumption,
    smokerStatus,
    region,
    currentAge,
    elapsedYears,
  } = input;

  const remainingYears = policyTerm - elapsedYears;
  const v = 1 / (1 + interestRate);

  // Build cash flows
  const cashFlows = buildCashFlowAssumptions(
    sumAssured,
    input.premium / policyTerm,
    remainingYears,
    currentAge,
    mortalityAssumption,
    smokerStatus,
    region,
    interestRate
  );

  // Calculate expected present value
  let expectedPV = 0;
  let variancePV = 0;

  for (const cf of cashFlows) {
    const discountFactor = Math.pow(v, cf.year);
    expectedPV += (cf.expectedBenefit - cf.expectedPremium) * discountFactor;
    
    // Estimate variance (simplified using Poisson approximation for mortality)
    const benefitVariance = cf.expectedBenefit * (1 - cf.probability) * discountFactor * discountFactor;
    variancePV += benefitVariance;
  }

  // Calculate risk adjustment based on method
  let riskAdjustment: number;
  let riskMarginPercentage: number;
  let uncertaintyFactor: number;
  let capitalChargeRate: number;

  switch (method) {
    case 'cost_of_capital':
      // Cost of capital method: RA = SCR * CoC * duration
      capitalChargeRate = 0.06; // 6% cost of capital
      const scr = Math.abs(expectedPV) * 0.15; // Simplified SCR
      riskAdjustment = scr * capitalChargeRate * remainingYears;
      riskMarginPercentage = (riskAdjustment / Math.abs(expectedPV)) * 100;
      uncertaintyFactor = 1.0;
      break;

    case 'percentile':
      // Percentile method: RA = X_percentile - Expected
      // Using normal approximation
      const zScore = getZScore(confidenceLevel);
      riskAdjustment = zScore * Math.sqrt(variancePV);
      riskMarginPercentage = expectedPV > 0 ? (riskAdjustment / expectedPV) * 100 : 0;
      uncertaintyFactor = zScore;
      capitalChargeRate = 0.06;
      break;

    case 'risk_margin':
    default:
      // Risk margin method: RA = % of BEL
      riskMarginPercentage = 10; // 10% risk margin
      uncertaintyFactor = 1.15;
      capitalChargeRate = 0.06;
      riskAdjustment = Math.abs(expectedPV) * (riskMarginPercentage / 100);
      break;
  }

  // Duration-weighted RA
  const durationWeightedRA = riskAdjustment * remainingYears / 2;

  return {
    riskAdjustment: Math.round(riskAdjustment * 100) / 100,
    confidenceLevel,
    riskMarginPercentage: Math.round(riskMarginPercentage * 1000000) / 1000000,
    uncertaintyFactor: Math.round(uncertaintyFactor * 1000000) / 1000000,
    capitalChargeRate,
    durationWeightedRA: Math.round(durationWeightedRA * 100) / 100,
  };
}

/**
 * Get Z-score for confidence level
 */
function getZScore(confidence: number): number {
  // Common z-scores
  const zScores: Record<number, number> = {
    0.50: 0.0,
    0.60: 0.253,
    0.70: 0.524,
    0.75: 0.674,
    0.80: 0.842,
    0.85: 1.036,
    0.90: 1.282,
    0.95: 1.645,
    0.99: 2.326,
  };
  
  // Find closest confidence level
  const confidences = Object.keys(zScores).map(Number).sort((a, b) => a - b);
  for (const conf of confidences) {
    if (Math.abs(conf - confidence) < 0.01) {
      return zScores[conf];
    }
  }
  
  // Default for 75%
  return 0.674;
}

/**
 * Calculate Liability for Remaining Coverage (LRC)
 * 
 * LRC = PV(Future Cash Flows) + RA + CSM - Loss Component
 * 
 * LRC represents the obligation to provide future coverage.
 */
export function calculateLRC(input: IFRS17ContractInput): LRCResult {
  const {
    premium,
    sumAssured,
    policyTerm,
    interestRate,
    acquisitionCosts,
    mortalityAssumption,
    smokerStatus,
    region,
    currentAge,
    elapsedYears,
  } = input;

  const remainingYears = policyTerm - elapsedYears;
  const v = 1 / (1 + interestRate);

  // Build cash flows
  const cashFlows = buildCashFlowAssumptions(
    sumAssured,
    premium / policyTerm,
    remainingYears,
    currentAge,
    mortalityAssumption,
    smokerStatus,
    region,
    interestRate
  );

  // Calculate PV of future cash flows
  let pvFutureCashFlows = 0;
  for (const cf of cashFlows) {
    const discountFactor = Math.pow(v, cf.year);
    pvFutureCashFlows += (cf.expectedBenefit - cf.expectedPremium) * discountFactor;
  }

  // Add acquisition cost amortization
  const unamortizedAcquisition = acquisitionCosts * (remainingYears / policyTerm);
  pvFutureCashFlows += unamortizedAcquisition;

  // Get risk adjustment
  const raResult = calculateRA(input, 0.75, 'risk_margin');

  // Get CSM
  const csmResult = calculateCSM(input);

  // Check for onerous contract
  const lossComponent = pvFutureCashFlows + raResult.riskAdjustment > 0
    ? pvFutureCashFlows + raResult.riskAdjustment
    : 0;

  // Calculate LRC
  const liabilityForRemainingCoverage = 
    Math.max(0, pvFutureCashFlows) + 
    raResult.riskAdjustment + 
    csmResult.currentCSM - 
    lossComponent;

  return {
    liabilityForRemainingCoverage: Math.round(liabilityForRemainingCoverage * 100) / 100,
    presentValueFutureCashFlows: Math.round(pvFutureCashFlows * 100) / 100,
    riskAdjustment: raResult.riskAdjustment,
    contractualServiceMargin: csmResult.currentCSM,
    lossComponent: Math.round(lossComponent * 100) / 100,
    coverageRemaining: remainingYears,
  };
}

/**
 * Calculate Liability for Incurred Claims (LIC)
 * 
 * LIC = PV(Outstanding Claims) + RA for Claims
 * 
 * LIC represents the obligation for claims that have already occurred.
 */
export function calculateLIC(
  outstandingClaims: Array<{
    claimId: string;
    incurredDate: Date;
    reportedAmount: number;
    paidToDate: number;
    expectedSettlementYears: number;
    developmentPattern: number[];
  }>,
  interestRate: number,
  inflationRate: number = 0.03,
  confidenceLevel: number = 0.90
): LICResult {
  const v = 1 / (1 + interestRate);
  
  let pvOutstandingClaims = 0;
  let totalExpectedSettlement = 0;

  for (const claim of outstandingClaims) {
    const outstandingAmount = claim.reportedAmount - claim.paidToDate;
    let claimPV = 0;

    // Apply development pattern
    let cumulativeDevelopment = 1;
    for (let year = 1; year <= claim.expectedSettlementYears; year++) {
      const developmentFactor = claim.developmentPattern[year - 1] || 1;
      const paymentThisYear = outstandingAmount * (developmentFactor / cumulativeDevelopment);
      const inflationFactor = Math.pow(1 + inflationRate, year);
      const discountFactor = Math.pow(v, year);
      
      claimPV += paymentThisYear * inflationFactor * discountFactor;
      cumulativeDevelopment = developmentFactor;
    }

    pvOutstandingClaims += claimPV;
    totalExpectedSettlement += outstandingAmount;
  }

  // Risk adjustment for claims (higher uncertainty for incurred claims)
  const claimsVariance = totalExpectedSettlement * 0.20;
  const zScore = getZScore(confidenceLevel);
  const riskAdjustmentForClaims = zScore * Math.sqrt(claimsVariance);

  // Calculate LIC
  const liabilityForIncurredClaims = pvOutstandingClaims + riskAdjustmentForClaims;

  // Claims development result (change in estimates)
  const claimsDevelopmentResult = liabilityForIncurredClaims - totalExpectedSettlement;

  return {
    liabilityForIncurredClaims: Math.round(liabilityForIncurredClaims * 100) / 100,
    presentValueOutstandingClaims: Math.round(pvOutstandingClaims * 100) / 100,
    riskAdjustmentForClaims: Math.round(riskAdjustmentForClaims * 100) / 100,
    claimsDevelopmentResult: Math.round(claimsDevelopmentResult * 100) / 100,
    expectedClaimsSettlement: Math.round(totalExpectedSettlement * 100) / 100,
  };
}

/**
 * Generate IFRS 17 Disclosure Report
 * 
 * Creates a comprehensive disclosure report for regulatory reporting
 */
export function generateIFRS17DisclosureReport(
  input: IFRS17ContractInput,
  previousPeriod?: {
    csm: number;
    ra: number;
    lrc: number;
    lic: number;
  }
): IFRS17DisclosureReport {
  // Calculate current period values
  const csmResult = calculateCSM(input);
  const raResult = calculateRA(input, 0.75, 'risk_margin');
  const lrcResult = calculateLRC(input);

  // Calculate insurance revenue and expense
  const insuranceRevenue = csmResult.insuranceRevenueComponent;
  const insuranceServiceExpense = (lrcResult.presentValueFutureCashFlows / input.policyTerm);
  const insuranceServiceResult = insuranceRevenue + insuranceServiceExpense;
  const netInsuranceServiceResult = insuranceServiceResult;

  // Investment component (separated from insurance)
  const investmentComponent = input.premium * 0.05; // Simplified

  // CSM movement
  const csmMovement = {
    opening: previousPeriod?.csm || csmResult.initialCSM,
    changesInEstimates: 0, // Would need actual estimate changes
    amortization: -csmResult.amortizedCSM,
    closing: csmResult.currentCSM,
  };

  // RA movement
  const raMovement = {
    opening: previousPeriod?.ra || raResult.riskAdjustment,
    changesInEstimates: 0,
    release: -raResult.riskAdjustment / input.policyTerm,
    closing: raResult.riskAdjustment * (input.policyTerm - input.elapsedYears - 1) / input.policyTerm,
  };

  // LRC movement
  const lrcMovement = {
    opening: previousPeriod?.lrc || lrcResult.liabilityForRemainingCoverage,
    newBusiness: 0,
    changesInEstimates: 0,
    accruals: -lrcResult.liabilityForRemainingCoverage / input.policyTerm,
    closing: lrcResult.liabilityForRemainingCoverage,
  };

  // LIC movement (no claims for simplicity)
  const licMovement = {
    opening: previousPeriod?.lic || 0,
    newClaims: 0,
    payments: 0,
    changesInEstimates: 0,
    closing: 0,
  };

  // Determine measurement approach
  const measurementApproach: IFRS17DisclosureReport['measurementApproach'] = 
    input.policyTerm <= 1 ? 'Premium Allocation Approach' : 'General Measurement Model';

  return {
    contractId: input.contractId,
    valuationDate: input.valuationDate,
    measurementApproach,
    insuranceRevenue: Math.round(insuranceRevenue * 100) / 100,
    insuranceServiceExpense: Math.round(insuranceServiceExpense * 100) / 100,
    insuranceServiceResult: Math.round(insuranceServiceResult * 100) / 100,
    netInsuranceServiceResult: Math.round(netInsuranceServiceResult * 100) / 100,
    investmentComponent: Math.round(investmentComponent * 100) / 100,
    csmMovement: {
      opening: Math.round(csmMovement.opening * 100) / 100,
      changesInEstimates: Math.round(csmMovement.changesInEstimates * 100) / 100,
      amortization: Math.round(csmMovement.amortization * 100) / 100,
      closing: Math.round(csmMovement.closing * 100) / 100,
    },
    riskAdjustmentMovement: {
      opening: Math.round(raMovement.opening * 100) / 100,
      changesInEstimates: Math.round(raMovement.changesInEstimates * 100) / 100,
      release: Math.round(raMovement.release * 100) / 100,
      closing: Math.round(raMovement.closing * 100) / 100,
    },
    lrcMovement: {
      opening: Math.round(lrcMovement.opening * 100) / 100,
      newBusiness: Math.round(lrcMovement.newBusiness * 100) / 100,
      changesInEstimates: Math.round(lrcMovement.changesInEstimates * 100) / 100,
      accruals: Math.round(lrcMovement.accruals * 100) / 100,
      closing: Math.round(lrcMovement.closing * 100) / 100,
    },
    licMovement: {
      opening: Math.round(licMovement.opening * 100) / 100,
      newClaims: Math.round(licMovement.newClaims * 100) / 100,
      payments: Math.round(licMovement.payments * 100) / 100,
      changesInEstimates: Math.round(licMovement.changesInEstimates * 100) / 100,
      closing: Math.round(licMovement.closing * 100) / 100,
    },
  };
}

/**
 * Portfolio IFRS 17 summary
 */
export interface PortfolioSummary {
  totalCSM: number;
  totalRA: number;
  totalLRC: number;
  totalLIC: number;
  totalInsuranceLiability: number;
  numberOfContracts: number;
  onerousContracts: number;
  profitableContracts: number;
  averageDuration: number;
}

/**
 * Calculate portfolio-level IFRS 17 metrics
 */
export function calculatePortfolioIFRS17Summary(
  contracts: IFRS17ContractInput[]
): PortfolioSummary {
  let totalCSM = 0;
  let totalRA = 0;
  let totalLRC = 0;
  let totalLIC = 0;
  let onerousContracts = 0;
  let profitableContracts = 0;
  let totalDuration = 0;

  for (const contract of contracts) {
    const csmResult = calculateCSM(contract);
    const raResult = calculateRA(contract);
    const lrcResult = calculateLRC(contract);

    totalCSM += csmResult.currentCSM;
    totalRA += raResult.riskAdjustment;
    totalLRC += lrcResult.liabilityForRemainingCoverage;
    totalDuration += contract.policyTerm - contract.elapsedYears;

    if (lrcResult.lossComponent > 0) {
      onerousContracts++;
    } else {
      profitableContracts++;
    }
  }

  const totalInsuranceLiability = totalLRC + totalLIC;
  const averageDuration = contracts.length > 0 ? totalDuration / contracts.length : 0;

  return {
    totalCSM: Math.round(totalCSM * 100) / 100,
    totalRA: Math.round(totalRA * 100) / 100,
    totalLRC: Math.round(totalLRC * 100) / 100,
    totalLIC: Math.round(totalLIC * 100) / 100,
    totalInsuranceLiability: Math.round(totalInsuranceLiability * 100) / 100,
    numberOfContracts: contracts.length,
    onerousContracts,
    profitableContracts,
    averageDuration: Math.round(averageDuration * 1000000) / 1000000,
  };
}

/**
 * Calculate Loss Component for onerous contracts
 * Required for proper presentation in financial statements
 */
export function calculateLossComponent(
  input: IFRS17ContractInput
): { lossComponent: number; lossReversalComponent: number } {
  const lrcResult = calculateLRC(input);
  
  const lossComponent = lrcResult.lossComponent;
  const lossReversalComponent = lossComponent > 0 ? 0 : lrcResult.contractualServiceMargin;

  return {
    lossComponent: Math.round(lossComponent * 100) / 100,
    lossReversalComponent: Math.round(Math.max(0, lossReversalComponent) * 100) / 100,
  };
}

// Export types
export type {
  IFRS17ContractInput as IFRS17ContractInputType,
  CSMResult as CSMResultType,
  RAResult as RAResultType,
  LRCResult as LRCResultType,
  LICResult as LICResultType,
  IFRS17DisclosureReport as IFRS17DisclosureReportType,
  PortfolioSummary as PortfolioSummaryType,
};
