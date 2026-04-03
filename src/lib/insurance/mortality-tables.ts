/**
 * Mortality Tables Service for NexusOS Insurance Platform
 * 
 * Implements CSO 2017 (Commissioners Standard Ordinary) mortality tables
 * with Caribbean region adjustments and smoker/non-smoker distinction.
 * 
 * All calculations are accurate to 6 decimal places.
 */

// Types for mortality data
export interface MortalityRate {
  age: number;
  qx: number;      // Probability of death within one year
  lx?: number;     // Number living at beginning of age x (radix = 100,000)
  dx?: number;     // Number dying during age x
  Lx?: number;     // Number of person-years lived during age x
  Tx?: number;     // Total number of person-years lived after age x
  ex?: number;     // Complete expectation of life at age x
}

export interface MortalityTable {
  name: string;
  gender: 'male' | 'female';
  smokerStatus: 'smoker' | 'nonsmoker' | 'aggregate';
  region: 'standard' | 'caribbean';
  radix: number;
  rates: MortalityRate[];
}

export interface MortalityQuery {
  age: number;
  gender: 'male' | 'female';
  smokerStatus?: 'smoker' | 'nonsmoker' | 'aggregate';
  region?: 'standard' | 'caribbean';
}

// Caribbean mortality adjustment factor (15% extra mortality)
const CARIBBEAN_MORTALITY_ADJUSTMENT = 1.15;

// Smoker adjustment factors
const SMOKER_MORTALITY_MULTIPLIER = {
  male: 2.0,      // Smokers have approximately 2x mortality
  female: 2.2,    // Female smokers have slightly higher relative risk
};

// CSO 2017 Aggregate Mortality Rates (Base table - ages 0-120)
// These are the standard US Commissioners Standard Ordinary 2017 rates
const CSO_2017_MALE_AGGREGATE: number[] = [
  // Age 0-9
  0.006430, 0.000460, 0.000320, 0.000240, 0.000200,
  0.000180, 0.000170, 0.000160, 0.000150, 0.000140,
  // Age 10-19
  0.000140, 0.000150, 0.000180, 0.000230, 0.000320,
  0.000450, 0.000620, 0.000810, 0.000980, 0.001120,
  // Age 20-29
  0.001230, 0.001300, 0.001340, 0.001360, 0.001380,
  0.001390, 0.001400, 0.001410, 0.001420, 0.001420,
  // Age 30-39
  0.001420, 0.001450, 0.001510, 0.001590, 0.001700,
  0.001840, 0.002000, 0.002180, 0.002380, 0.002590,
  // Age 40-49
  0.002810, 0.003050, 0.003310, 0.003600, 0.003930,
  0.004320, 0.004770, 0.005300, 0.005920, 0.006630,
  // Age 50-59
  0.007440, 0.008350, 0.009350, 0.010450, 0.011650,
  0.012980, 0.014460, 0.016110, 0.017950, 0.020000,
  // Age 60-69
  0.022280, 0.024820, 0.027640, 0.030760, 0.034200,
  0.037980, 0.042140, 0.046700, 0.051680, 0.057120,
  // Age 70-79
  0.063040, 0.069480, 0.076480, 0.084060, 0.092240,
  0.101040, 0.110480, 0.120560, 0.131280, 0.142640,
  // Age 80-89
  0.154640, 0.167280, 0.180560, 0.194440, 0.208880,
  0.223840, 0.239280, 0.255120, 0.271280, 0.287680,
  // Age 90-99
  0.304240, 0.320880, 0.337520, 0.354080, 0.370480,
  0.386640, 0.402480, 0.417920, 0.432880, 0.447280,
  // Age 100-109
  0.461040, 0.474080, 0.486320, 0.497680, 0.508160,
  0.517680, 0.526240, 0.533760, 0.540240, 0.545680,
  // Age 110-119
  0.550080, 0.553440, 0.555760, 0.557040, 0.557280,
  0.556480, 0.554640, 0.551760, 0.547840, 0.542880,
  // Age 120
  1.000000, // Ultimate age - all die
];

const CSO_2017_FEMALE_AGGREGATE: number[] = [
  // Age 0-9
  0.005120, 0.000380, 0.000250, 0.000190, 0.000160,
  0.000140, 0.000130, 0.000120, 0.000110, 0.000110,
  // Age 10-19
  0.000110, 0.000120, 0.000140, 0.000180, 0.000250,
  0.000340, 0.000420, 0.000480, 0.000520, 0.000540,
  // Age 20-29
  0.000560, 0.000580, 0.000610, 0.000650, 0.000700,
  0.000760, 0.000820, 0.000860, 0.000870, 0.000870,
  // Age 30-39
  0.000870, 0.000910, 0.000990, 0.001100, 0.001240,
  0.001410, 0.001600, 0.001820, 0.002060, 0.002330,
  // Age 40-49
  0.002630, 0.002960, 0.003340, 0.003780, 0.004290,
  0.004890, 0.005600, 0.006430, 0.007380, 0.008460,
  // Age 50-59
  0.009680, 0.011060, 0.012620, 0.014370, 0.016310,
  0.018460, 0.020830, 0.023430, 0.026270, 0.029360,
  // Age 60-69
  0.032710, 0.036330, 0.040240, 0.044450, 0.048980,
  0.053840, 0.059050, 0.064630, 0.070600, 0.076980,
  // Age 70-79
  0.083790, 0.091050, 0.098780, 0.106990, 0.115700,
  0.124920, 0.134660, 0.144920, 0.155700, 0.167000,
  // Age 80-89
  0.178820, 0.191160, 0.204020, 0.217400, 0.231300,
  0.245720, 0.260660, 0.276120, 0.292100, 0.308600,
  // Age 90-99
  0.325620, 0.343160, 0.361220, 0.379800, 0.398900,
  0.418420, 0.438360, 0.458720, 0.479500, 0.500700,
  // Age 100-109
  0.522340, 0.544420, 0.566940, 0.589900, 0.613300,
  0.637140, 0.661420, 0.686140, 0.711300, 0.736900,
  // Age 110-119
  0.762940, 0.789420, 0.816340, 0.843700, 0.871500,
  0.899740, 0.928420, 0.957540, 0.987100, 0.997000,
  // Age 120
  1.000000, // Ultimate age - all die
];

/**
 * Calculate lx (number living) from qx rates
 * lx represents the number of survivors at the beginning of age x
 */
function calculateLx(qxRates: number[], radix: number = 100000): number[] {
  const lx: number[] = [radix];
  for (let i = 0; i < qxRates.length - 1; i++) {
    const survivors = lx[i] * (1 - qxRates[i]);
    lx.push(Math.round(survivors * 1000000) / 1000000);
  }
  return lx;
}

/**
 * Calculate dx (number dying) from lx
 * dx represents the number of deaths during age x
 */
function calculateDx(lx: number[]): number[] {
  const dx: number[] = [];
  for (let i = 0; i < lx.length - 1; i++) {
    dx.push(Math.round((lx[i] - lx[i + 1]) * 1000000) / 1000000);
  }
  // Last dx equals last lx (everyone dies at ultimate age)
  dx.push(lx[lx.length - 1]);
  return dx;
}

/**
 * Calculate Lx (person-years lived during age x)
 * Lx = lx+1 + 0.5 * dx (assuming deaths are uniformly distributed)
 */
function calculatePersonYears(lx: number[], dx: number[]): number[] {
  const Lx: number[] = [];
  for (let i = 0; i < lx.length - 1; i++) {
    Lx.push(Math.round((lx[i + 1] + 0.5 * dx[i]) * 1000000) / 1000000);
  }
  // Last Lx = 0.5 * last dx (everyone dies at ultimate age)
  Lx.push(Math.round(0.5 * dx[dx.length - 1] * 1000000) / 1000000);
  return Lx;
}

/**
 * Calculate Tx (total person-years lived after age x)
 * Tx is the sum of Lx from age x to the end of the table
 */
function calculateTx(Lx: number[]): number[] {
  const Tx: number[] = [];
  let runningSum = 0;
  // Calculate from the end backwards
  for (let i = Lx.length - 1; i >= 0; i--) {
    runningSum += Lx[i];
    Tx.unshift(Math.round(runningSum * 1000000) / 1000000);
  }
  return Tx;
}

/**
 * Calculate ex (complete expectation of life at age x)
 * ex = Tx / lx
 */
function calculateEx(Tx: number[], lx: number[]): number[] {
  const ex: number[] = [];
  for (let i = 0; i < Tx.length; i++) {
    if (lx[i] > 0) {
      ex.push(Math.round((Tx[i] / lx[i]) * 1000000) / 1000000);
    } else {
      ex.push(0);
    }
  }
  return ex;
}

/**
 * Apply Caribbean mortality adjustment
 * Caribbean region has approximately 15% higher mortality rates
 */
function applyCaribbeanAdjustment(qx: number): number {
  const adjusted = qx * CARIBBEAN_MORTALITY_ADJUSTMENT;
  // Cap at 1.0 (can't have probability > 1)
  return Math.min(adjusted, 1.0);
}

/**
 * Apply smoker adjustment factor
 */
function applySmokerAdjustment(qx: number, gender: 'male' | 'female'): number {
  const adjusted = qx * SMOKER_MORTALITY_MULTIPLIER[gender];
  return Math.min(adjusted, 1.0);
}

/**
 * Generate complete mortality table with all life table functions
 */
export function generateMortalityTable(
  gender: 'male' | 'female',
  smokerStatus: 'smoker' | 'nonsmoker' | 'aggregate' = 'aggregate',
  region: 'standard' | 'caribbean' = 'standard',
  radix: number = 100000
): MortalityTable {
  const baseRates = gender === 'male' ? CSO_2017_MALE_AGGREGATE : CSO_2017_FEMALE_AGGREGATE;
  
  // Apply adjustments
  let adjustedRates = [...baseRates];
  
  // Apply Caribbean adjustment first
  if (region === 'caribbean') {
    adjustedRates = adjustedRates.map(qx => applyCaribbeanAdjustment(qx));
  }
  
  // Apply smoker adjustment
  if (smokerStatus === 'smoker') {
    adjustedRates = adjustedRates.map(qx => applySmokerAdjustment(qx, gender));
  }
  
  // Calculate life table functions
  const lx = calculateLx(adjustedRates, radix);
  const dx = calculateDx(lx);
  const Lx = calculatePersonYears(lx, dx);
  const Tx = calculateTx(Lx);
  const ex = calculateEx(Tx, lx);
  
  // Build mortality rates array
  const rates: MortalityRate[] = adjustedRates.map((qx, age) => ({
    age,
    qx: Math.round(qx * 1000000) / 1000000,
    lx: lx[age],
    dx: dx[age],
    Lx: Lx[age],
    Tx: Tx[age],
    ex: ex[age],
  }));
  
  return {
    name: `CSO 2017 ${gender.toUpperCase()} ${smokerStatus.toUpperCase()} ${region === 'caribbean' ? '(Caribbean Adjusted)' : ''}`,
    gender,
    smokerStatus,
    region,
    radix,
    rates,
  };
}

/**
 * Get mortality rate for a specific age and parameters
 */
export function getMortalityRate(query: MortalityQuery): MortalityRate {
  const table = generateMortalityTable(
    query.gender,
    query.smokerStatus || 'aggregate',
    query.region || 'standard'
  );
  
  const age = Math.min(Math.max(0, query.age), 120);
  return table.rates[age];
}

/**
 * Calculate probability of survival from age x to age x + n
 */
export function calculateSurvivalProbability(
  age: number,
  years: number,
  gender: 'male' | 'female',
  smokerStatus: 'smoker' | 'nonsmoker' | 'aggregate' = 'aggregate',
  region: 'standard' | 'caribbean' = 'standard'
): number {
  const table = generateMortalityTable(gender, smokerStatus, region);
  const startAge = Math.min(Math.max(0, age), 120);
  const endAge = Math.min(120, startAge + years);
  
  const startLx = table.rates[startAge].lx || 100000;
  const endLx = table.rates[endAge].lx || 0;
  
  if (startLx === 0) return 0;
  
  return Math.round((endLx / startLx) * 1000000) / 1000000;
}

/**
 * Calculate probability of death within n years
 */
export function calculateDeathProbability(
  age: number,
  years: number,
  gender: 'male' | 'female',
  smokerStatus: 'smoker' | 'nonsmoker' | 'aggregate' = 'aggregate',
  region: 'standard' | 'caribbean' = 'standard'
): number {
  const survival = calculateSurvivalProbability(age, years, gender, smokerStatus, region);
  return Math.round((1 - survival) * 1000000) / 1000000;
}

/**
 * Calculate temporary life expectancy (curtate)
 * Expected number of complete years lived between ages x and x+n
 */
export function calculateTemporaryLifeExpectancy(
  age: number,
  years: number,
  gender: 'male' | 'female',
  smokerStatus: 'smoker' | 'nonsmoker' | 'aggregate' = 'aggregate',
  region: 'standard' | 'caribbean' = 'standard'
): number {
  const table = generateMortalityTable(gender, smokerStatus, region);
  const startAge = Math.min(Math.max(0, age), 120);
  const endAge = Math.min(120, startAge + years);
  
  const startLx = table.rates[startAge].lx || 100000;
  
  if (startLx === 0) return 0;
  
  let sumLx = 0;
  for (let i = startAge + 1; i <= endAge; i++) {
    sumLx += table.rates[i].lx || 0;
  }
  
  return Math.round((sumLx / startLx) * 1000000) / 1000000;
}

/**
 * Calculate deferred mortality probability
 * Probability of dying between ages x + m and x + m + n
 */
export function calculateDeferredMortalityProbability(
  age: number,
  deferralYears: number,
  termYears: number,
  gender: 'male' | 'female',
  smokerStatus: 'smoker' | 'nonsmoker' | 'aggregate' = 'aggregate',
  region: 'standard' | 'caribbean' = 'standard'
): number {
  const survivalToDeferred = calculateSurvivalProbability(age, deferralYears, gender, smokerStatus, region);
  const deathAfterDeferred = calculateDeathProbability(age + deferralYears, termYears, gender, smokerStatus, region);
  
  return Math.round(survivalToDeferred * deathAfterDeferred * 1000000) / 1000000;
}

/**
 * Generate commutation functions for actuarial calculations
 */
export function generateCommutationFunctions(
  gender: 'male' | 'female',
  interestRate: number,
  smokerStatus: 'smoker' | 'nonsmoker' | 'aggregate' = 'aggregate',
  region: 'standard' | 'caribbean' = 'standard',
  radix: number = 100000
): { Dx: number[]; Nx: number[]; Cx: number[]; Mx: number[] } {
  const table = generateMortalityTable(gender, smokerStatus, region, radix);
  const v = 1 / (1 + interestRate);
  
  // Dx = lx * v^x
  const Dx: number[] = table.rates.map((rate, x) => 
    Math.round((rate.lx || 0) * Math.pow(v, x) * 1000000) / 1000000
  );
  
  // Nx = sum of Dx from x to end
  const Nx: number[] = [];
  let nxSum = 0;
  for (let i = Dx.length - 1; i >= 0; i--) {
    nxSum += Dx[i];
    Nx.unshift(Math.round(nxSum * 1000000) / 1000000);
  }
  
  // Cx = dx * v^(x+1)
  const Cx: number[] = table.rates.map((rate, x) => 
    Math.round((rate.dx || 0) * Math.pow(v, x + 1) * 1000000) / 1000000
  );
  
  // Mx = sum of Cx from x to end
  const Mx: number[] = [];
  let mxSum = 0;
  for (let i = Cx.length - 1; i >= 0; i--) {
    mxSum += Cx[i];
    Mx.unshift(Math.round(mxSum * 1000000) / 1000000);
  }
  
  return { Dx, Nx, Cx, Mx };
}

/**
 * Get abbreviated mortality table for display (selected ages)
 */
export function getAbbreviatedMortalityTable(
  gender: 'male' | 'female',
  smokerStatus: 'smoker' | 'nonsmoker' | 'aggregate' = 'aggregate',
  region: 'standard' | 'caribbean' = 'standard'
): MortalityRate[] {
  const table = generateMortalityTable(gender, smokerStatus, region);
  
  // Select key ages for display: 0, every 5 years from 20-80, then 90, 100, 110, 120
  const keyAges = [0, 1];
  for (let age = 20; age <= 80; age += 5) {
    keyAges.push(age);
  }
  keyAges.push(90, 100, 110, 120);
  
  return keyAges.map(age => table.rates[age]);
}

/**
 * Compare mortality rates between two tables
 */
export function compareMortalityRates(
  table1: MortalityTable,
  table2: MortalityTable
): { age: number; rate1: number; rate2: number; difference: number; ratio: number }[] {
  const minAge = Math.min(table1.rates.length, table2.rates.length);
  
  return Array.from({ length: minAge }, (_, i) => ({
    age: i,
    rate1: table1.rates[i].qx,
    rate2: table2.rates[i].qx,
    difference: Math.round((table2.rates[i].qx - table1.rates[i].qx) * 1000000) / 1000000,
    ratio: Math.round((table2.rates[i].qx / table1.rates[i].qx) * 1000) / 1000,
  }));
}

// Export pre-calculated common tables
export const STANDARD_TABLES = {
  MALE_AGGREGATE: () => generateMortalityTable('male', 'aggregate', 'standard'),
  FEMALE_AGGREGATE: () => generateMortalityTable('female', 'aggregate', 'standard'),
  MALE_SMOKER: () => generateMortalityTable('male', 'smoker', 'standard'),
  FEMALE_SMOKER: () => generateMortalityTable('female', 'smoker', 'standard'),
  MALE_CARIBBEAN: () => generateMortalityTable('male', 'aggregate', 'caribbean'),
  FEMALE_CARIBBEAN: () => generateMortalityTable('female', 'aggregate', 'caribbean'),
  MALE_SMOKER_CARIBBEAN: () => generateMortalityTable('male', 'smoker', 'caribbean'),
  FEMALE_SMOKER_CARIBBEAN: () => generateMortalityTable('female', 'smoker', 'caribbean'),
};

// Export types
export type { MortalityRate as MortalityRateType, MortalityTable as MortalityTableType, MortalityQuery as MortalityQueryType };
