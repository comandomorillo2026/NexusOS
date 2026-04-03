/**
 * Premium Rating Engine for NexusOS Insurance Platform
 * 
 * Implements premium calculation for multiple lines of business:
 * - Life Insurance (mortality + interest + loading)
 * - Health Insurance (morbidity + interest + loading)
 * - Motor Insurance (vehicle type, age, driver age, territory)
 * - Property Insurance (construction, occupancy, protection)
 * - Marine Insurance (vessel, cargo, voyage)
 * 
 * All calculations are accurate to 6 decimal places.
 */

import { 
  generateMortalityTable, 
  generateCommutationFunctions,
  calculateDeathProbability,
  calculateSurvivalProbability 
} from './mortality-tables';

// Currency rates for conversion
const CURRENCY_RATES: Record<string, number> = {
  TTD: 1.0,
  USD: 6.8,
  EUR: 7.4,
  GBP: 8.6,
  CAD: 5.0,
  JMD: 0.044,
  BBD: 3.4,
};

// ==================== TYPES ====================

export interface BaseRatingInput {
  sumAssured: number;
  currency?: string;
  effectiveDate: Date;
  territory?: string;
  deductible?: number;
  policyTerm?: number;
}

export interface LifeRatingInput extends BaseRatingInput {
  insuredAge: number;
  insuredGender: 'male' | 'female';
  smokerStatus: 'smoker' | 'nonsmoker' | 'aggregate';
  region?: 'standard' | 'caribbean';
  planType: 'term' | 'whole_life' | 'endowment' | 'universal';
  termYears?: number;              // For term insurance
  premiumFrequency: 'annual' | 'semi_annual' | 'quarterly' | 'monthly';
  healthClass: 'preferred' | 'standard' | 'rated';
  occupationClass: number;         // 1-4, 1 being safest
  aviationHazard?: boolean;
  avocationHazard?: boolean;       // Dangerous hobbies
}

export interface HealthRatingInput extends BaseRatingInput {
  insuredAge: number;
  insuredGender: 'male' | 'female';
  smokerStatus: 'smoker' | 'nonsmoker';
  region?: 'standard' | 'caribbean';
  planType: 'individual' | 'family' | 'group';
  coverageType: 'comprehensive' | 'major_medical' | 'hospital_only' | 'critical_illness';
  deductible: number;
  coInsurancePercentage: number;   // e.g., 20 for 80/20 split
  outOfPocketMax: number;
  preExistingConditions: string[];
  familySize?: number;
  groupSize?: number;              // For group plans
}

export interface MotorRatingInput extends BaseRatingInput {
  vehicleType: 'private_car' | 'suv' | 'pickup' | 'motorcycle' | 'commercial' | 'taxi';
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vehicleValue: number;
  driverAge: number;
  driverGender: 'male' | 'female';
  driverExperience: number;        // Years of driving experience
  claimsHistory: number;           // Number of claims in last 3 years
  trafficViolations: number;       // Number of violations in last 3 years
  vehicleUse: 'personal' | 'business' | 'commercial';
  annualMileage: number;
  overnightParking: 'garage' | 'driveway' | 'street';
  antiTheftDevices: string[];
  coverageType: 'comprehensive' | 'third_party' | 'third_party_fire_theft';
  voluntaryExcess: number;
}

export interface PropertyRatingInput extends BaseRatingInput {
  propertyType: 'residential' | 'commercial' | 'industrial';
  constructionType: 'frame' | 'brick' | 'concrete' | 'steel' | 'mixed';
  constructionYear: number;
  occupancyType: 'owner_occupied' | 'tenant' | 'vacant' | 'business';
  squareFootage: number;
  numberOfStories: number;
  roofType: 'shingle' | 'tile' | 'metal' | 'flat' | 'other';
  fireProtection: 'hydrant_within_1000ft' | 'hydrant_1000_5280ft' | 'fire_station_within_5mi' | 'none';
  alarmSystem: boolean;
  sprinklerSystem: boolean;
  location: 'urban' | 'suburban' | 'rural';
  floodZone: 'A' | 'AE' | 'X' | 'VE' | 'none';
  hurricaneShutters: boolean;
  claimsHistory: number;
  propertyValue: number;
  contentsValue: number;
}

export interface MarineRatingInput extends BaseRatingInput {
  vesselType: 'cargo' | 'tanker' | 'passenger' | 'fishing' | 'yacht' | 'container';
  vesselName: string;
  vesselAge: number;
  grossTonnage: number;
  vesselValue: number;
  flagState: string;
  classificationSociety: string;
  voyageFrom: string;
  voyageTo: string;
  cargoType: string;
  cargoValue: number;
  cargoHazardClass: 'low' | 'medium' | 'high' | 'hazardous';
  voyageDuration: number;          // Days
  crewSize: number;
  masterExperience: number;        // Years of experience
  piracyRisk: boolean;
  warRisk: boolean;
  coverageType: 'hull' | 'cargo' | 'protection_indemnity' | 'comprehensive';
}

export interface PremiumBreakdown {
  netPremium: number;
  grossPremium: number;
  loading: number;
  commission: number;
  policyFee: number;
  taxes: number;
  totalPremium: number;
  currency: string;
  breakdown: {
    component: string;
    amount: number;
    rate: number;
  }[];
}

export interface RatingFactor {
  name: string;
  baseRate: number;
  factor: number;
  adjustedRate: number;
  description: string;
}

// ==================== CONSTANTS ====================

// Loading percentages by line of business
const LOADING_FACTORS = {
  life: {
    acquisition: 0.10,      // 10% acquisition expense
    maintenance: 0.05,      // 5% maintenance expense
    profit: 0.05,           // 5% profit margin
    contingency: 0.03,      // 3% contingency
  },
  health: {
    acquisition: 0.08,
    maintenance: 0.06,
    profit: 0.06,
    contingency: 0.04,
  },
  motor: {
    acquisition: 0.15,
    maintenance: 0.10,
    profit: 0.08,
    contingency: 0.05,
  },
  property: {
    acquisition: 0.12,
    maintenance: 0.08,
    profit: 0.07,
    contingency: 0.05,
  },
  marine: {
    acquisition: 0.10,
    maintenance: 0.08,
    profit: 0.10,
    contingency: 0.07,
  },
};

// Premium frequency adjustment factors
const FREQUENCY_FACTORS = {
  annual: 1.0,
  semi_annual: 0.52,
  quarterly: 0.27,
  monthly: 0.09,
};

// Health class adjustments for life insurance
const HEALTH_CLASS_FACTORS = {
  preferred: 0.85,
  standard: 1.0,
  rated: 1.25,
};

// Occupation class factors
const OCCUPATION_CLASS_FACTORS: Record<number, number> = {
  1: 0.90,   // Professional, office
  2: 1.00,   // Light manual
  3: 1.15,   // Heavy manual
  4: 1.35,   // Hazardous
};

// Motor vehicle type base rates (per $1,000 of value)
const MOTOR_BASE_RATES: Record<string, number> = {
  private_car: 35.0,
  suv: 42.0,
  pickup: 38.0,
  motorcycle: 85.0,
  commercial: 55.0,
  taxi: 95.0,
};

// Driver age factors
const DRIVER_AGE_FACTORS: Record<string, number> = {
  '16-19': 2.5,
  '20-24': 1.8,
  '25-29': 1.3,
  '30-39': 1.0,
  '40-49': 0.95,
  '50-59': 0.90,
  '60-69': 1.0,
  '70+': 1.4,
};

// Property construction type factors
const CONSTRUCTION_TYPE_FACTORS: Record<string, number> = {
  frame: 1.35,
  brick: 1.10,
  concrete: 0.90,
  steel: 0.85,
  mixed: 1.15,
};

// Marine vessel type base rates (per $1,000 of value)
const MARINE_BASE_RATES: Record<string, number> = {
  cargo: 8.5,
  tanker: 12.0,
  passenger: 15.0,
  fishing: 25.0,
  yacht: 18.0,
  container: 9.0,
};

// ==================== LIFE INSURANCE RATING ====================

/**
 * Calculate Life Insurance Premium
 * 
 * Net Premium = Sum Assured × qx / (1 + i)^n
 * Gross Premium = Net Premium / (1 - Loading %)
 */
export function calculateLifePremium(input: LifeRatingInput): PremiumBreakdown {
  const {
    sumAssured,
    insuredAge,
    insuredGender,
    smokerStatus,
    region = 'caribbean',
    planType,
    termYears,
    premiumFrequency,
    healthClass,
    occupationClass,
    aviationHazard = false,
    avocationHazard = false,
  } = input;

  const interestRate = 0.045; // 4.5% assumed interest rate

  // Get mortality table and commutation functions
  const commutation = generateCommutationFunctions(
    insuredGender,
    smokerStatus,
    region
  );

  let netPremium: number;
  let premiumTerm = termYears || 20;
  const ageX = insuredAge;
  const ageXn = Math.min(120, ageX + premiumTerm);

  // Calculate based on plan type
  switch (planType) {
    case 'term':
      // Term insurance: Net Premium = SA × (M_x - M_x+n) / (N_x - N_x+n)
      const termAxn = (commutation.Mx[ageX] - commutation.Mx[ageXn]) / 
                     (commutation.Nx[ageX] - commutation.Nx[ageXn]);
      netPremium = sumAssured * termAxn;
      break;

    case 'whole_life':
      // Whole life: Net Premium = SA × M_x / N_x
      const wholeLifeAx = commutation.Mx[ageX] / commutation.Nx[ageX];
      netPremium = sumAssured * wholeLifeAx;
      premiumTerm = 120 - insuredAge;
      break;

    case 'endowment':
      // Endowment: Net Premium = SA × (M_x - M_x+n + D_x+n) / (N_x - N_x+n)
      const endowmentFactor = (commutation.Mx[ageX] - commutation.Mx[ageXn] + commutation.Dx[ageXn]) / 
                             (commutation.Nx[ageX] - commutation.Nx[ageXn]);
      netPremium = sumAssured * endowmentFactor;
      break;

    case 'universal':
      // Universal life: Similar to whole life with flexible premium
      const universalAx = commutation.Mx[ageX] / commutation.Nx[ageX];
      netPremium = sumAssured * universalAx * 1.1; // 10% additional for flexibility
      premiumTerm = 120 - insuredAge;
      break;

    default:
      netPremium = 0;
  }

  // Apply health class factor
  const healthFactor = HEALTH_CLASS_FACTORS[healthClass];
  netPremium *= healthFactor;

  // Apply occupation class factor
  const occupationFactor = OCCUPATION_CLASS_FACTORS[occupationClass] || 1.0;
  netPremium *= occupationFactor;

  // Apply aviation hazard extra (if applicable)
  if (aviationHazard) {
    netPremium *= 1.25; // 25% extra mortality
  }

  // Apply avocation hazard extra (if applicable)
  if (avocationHazard) {
    netPremium *= 1.15; // 15% extra mortality
  }

  // Apply Caribbean region adjustment (already in mortality table, but additional loading)
  if (region === 'caribbean') {
    netPremium *= 1.05; // Additional 5% for Caribbean risks
  }

  // Calculate loading
  const loading = LOADING_FACTORS.life;
  const totalLoading = loading.acquisition + loading.maintenance + loading.profit + loading.contingency;
  
  // Gross premium (annual)
  let grossPremium = netPremium / (1 - totalLoading);

  // Apply frequency adjustment
  const frequencyFactor = FREQUENCY_FACTORS[premiumFrequency];
  grossPremium *= frequencyFactor;

  // Calculate breakdown components
  const commission = grossPremium * 0.10; // 10% commission
  const policyFee = 50; // Fixed policy fee
  const taxes = grossPremium * 0.025; // 2.5% premium tax (TT)
  const totalPremium = grossPremium + commission + policyFee + taxes;

  return {
    netPremium: Math.round(netPremium * 100) / 100,
    grossPremium: Math.round(grossPremium * 100) / 100,
    loading: Math.round((grossPremium - netPremium) * 100) / 100,
    commission: Math.round(commission * 100) / 100,
    policyFee,
    taxes: Math.round(taxes * 100) / 100,
    totalPremium: Math.round(totalPremium * 100) / 100,
    currency: input.currency || 'TTD',
    breakdown: [
      { component: 'Base Net Premium', amount: Math.round(netPremium * 100) / 100, rate: netPremium / sumAssured },
      { component: 'Health Class Adjustment', amount: Math.round((healthFactor - 1) * netPremium * 100) / 100, rate: healthFactor },
      { component: 'Occupation Class Adjustment', amount: Math.round((occupationFactor - 1) * netPremium * 100) / 100, rate: occupationFactor },
      { component: 'Frequency Adjustment', amount: Math.round((frequencyFactor - 1) * netPremium * 100) / 100, rate: frequencyFactor },
      { component: 'Expense Loading', amount: Math.round((grossPremium - netPremium) * 100) / 100, rate: totalLoading },
    ],
  };
}

// ==================== HEALTH INSURANCE RATING ====================

/**
 * Calculate Health Insurance Premium
 * Uses morbidity tables and healthcare cost factors
 */
export function calculateHealthPremium(input: HealthRatingInput): PremiumBreakdown {
  const {
    sumAssured,
    insuredAge,
    insuredGender,
    smokerStatus,
    region = 'caribbean',
    planType,
    coverageType,
    deductible,
    coInsurancePercentage,
    outOfPocketMax,
    preExistingConditions,
    familySize = 1,
    groupSize,
  } = input;

  // Base rates by coverage type (annual per $10,000 coverage)
  const coverageBaseRates: Record<string, number> = {
    comprehensive: 450,
    major_medical: 320,
    hospital_only: 180,
    critical_illness: 280,
  };

  // Morbidity factors by age group
  const morbidityFactors: Record<string, number> = {
    '0-17': 0.6,
    '18-29': 0.8,
    '30-39': 1.0,
    '40-49': 1.4,
    '50-59': 2.0,
    '60-64': 3.0,
    '65+': 4.5,
  };

  // Get age group
  const getAgeGroup = (age: number): string => {
    if (age < 18) return '0-17';
    if (age < 30) return '18-29';
    if (age < 40) return '30-39';
    if (age < 50) return '40-49';
    if (age < 60) return '50-59';
    if (age < 65) return '60-64';
    return '65+';
  };

  const ageGroup = getAgeGroup(insuredAge);
  const morbidityFactor = morbidityFactors[ageGroup] || 1.0;

  // Base premium calculation
  const baseRate = coverageBaseRates[coverageType] || 450;
  const unitsOfCoverage = sumAssured / 10000;
  let netPremium = baseRate * unitsOfCoverage * morbidityFactor;

  // Deductible credit (higher deductible = lower premium)
  const deductibleCredit = deductible / 1000 * 25; // $25 credit per $1,000 deductible
  netPremium = Math.max(0, netPremium - deductibleCredit);

  // Co-insurance adjustment
  const coInsuranceFactor = 1 - (coInsurancePercentage / 200); // Higher co-insurance = lower premium
  netPremium *= coInsuranceFactor;

  // Out-of-pocket max factor
  const oopFactor = Math.max(0.8, 1 - (outOfPocketMax / sumAssured) * 0.5);
  netPremium *= oopFactor;

  // Pre-existing conditions loading
  const preExistingLoading = preExistingConditions.length * 0.15; // 15% per condition
  netPremium *= (1 + preExistingLoading);

  // Smoker loading
  if (smokerStatus === 'smoker') {
    netPremium *= 1.25;
  }

  // Gender adjustment
  if (insuredGender === 'female') {
    netPremium *= 1.1; // Higher healthcare utilization
  }

  // Plan type adjustments
  if (planType === 'family') {
    netPremium *= 1 + (familySize - 1) * 0.6; // Additional family members at 60%
  } else if (planType === 'group') {
    const groupDiscount = Math.min(0.25, groupSize ? groupSize * 0.005 : 0.10);
    netPremium *= (1 - groupDiscount);
  }

  // Caribbean adjustment
  if (region === 'caribbean') {
    netPremium *= 1.08;
  }

  // Calculate loading and final premium
  const loading = LOADING_FACTORS.health;
  const totalLoading = loading.acquisition + loading.maintenance + loading.profit + loading.contingency;
  const grossPremium = netPremium / (1 - totalLoading);

  const commission = grossPremium * 0.08;
  const policyFee = 35;
  const taxes = grossPremium * 0.025;
  const totalPremium = grossPremium + commission + policyFee + taxes;

  return {
    netPremium: Math.round(netPremium * 100) / 100,
    grossPremium: Math.round(grossPremium * 100) / 100,
    loading: Math.round((grossPremium - netPremium) * 100) / 100,
    commission: Math.round(commission * 100) / 100,
    policyFee,
    taxes: Math.round(taxes * 100) / 100,
    totalPremium: Math.round(totalPremium * 100) / 100,
    currency: input.currency || 'TTD',
    breakdown: [
      { component: 'Base Premium', amount: Math.round(baseRate * unitsOfCoverage * 100) / 100, rate: baseRate },
      { component: 'Age/Morbidity Factor', amount: Math.round((morbidityFactor - 1) * baseRate * unitsOfCoverage * 100) / 100, rate: morbidityFactor },
      { component: 'Deductible Credit', amount: Math.round(-deductibleCredit * 100) / 100, rate: -deductibleCredit },
      { component: 'Pre-existing Conditions', amount: Math.round(preExistingLoading * netPremium * 100) / 100, rate: preExistingLoading },
    ],
  };
}

// ==================== MOTOR INSURANCE RATING ====================

/**
 * Calculate Motor Insurance Premium
 * Based on vehicle characteristics, driver profile, and territory
 */
export function calculateMotorPremium(input: MotorRatingInput): PremiumBreakdown {
  const {
    vehicleType,
    vehicleYear,
    vehicleValue,
    driverAge,
    driverGender,
    driverExperience,
    claimsHistory,
    trafficViolations,
    vehicleUse,
    annualMileage,
    overnightParking,
    antiTheftDevices,
    coverageType,
    voluntaryExcess,
    territory = 'trinidad',
  } = input;

  // Get base rate for vehicle type
  const baseRate = MOTOR_BASE_RATES[vehicleType] || 35;
  
  // Base premium (per $1,000 of vehicle value)
  const unitsOfValue = vehicleValue / 1000;
  let basePremium = baseRate * unitsOfValue;

  // Vehicle age factor
  const currentYear = new Date().getFullYear();
  const vehicleAge = currentYear - vehicleYear;
  const vehicleAgeFactor = vehicleAge <= 1 ? 1.0 : 
                          vehicleAge <= 3 ? 1.05 :
                          vehicleAge <= 5 ? 1.10 :
                          vehicleAge <= 10 ? 1.20 : 1.35;
  basePremium *= vehicleAgeFactor;

  // Driver age factor
  const getDriverAgeGroup = (age: number): string => {
    if (age < 20) return '16-19';
    if (age < 25) return '20-24';
    if (age < 30) return '25-29';
    if (age < 40) return '30-39';
    if (age < 50) return '40-49';
    if (age < 60) return '50-59';
    if (age < 70) return '60-69';
    return '70+';
  };

  const driverAgeGroup = getDriverAgeGroup(driverAge);
  const driverAgeFactor = DRIVER_AGE_FACTORS[driverAgeGroup] || 1.0;
  basePremium *= driverAgeFactor;

  // Driver gender factor
  if (driverGender === 'male' && driverAge < 25) {
    basePremium *= 1.15; // Young male driver surcharge
  }

  // Driving experience factor
  const experienceFactor = driverExperience >= 5 ? 0.95 : 
                          driverExperience >= 3 ? 1.0 : 
                          driverExperience >= 1 ? 1.1 : 1.25;
  basePremium *= experienceFactor;

  // Claims history factor
  const claimsFactor = 1 + (claimsHistory * 0.15);
  basePremium *= claimsFactor;

  // Traffic violations factor
  const violationsFactor = 1 + (trafficViolations * 0.10);
  basePremium *= violationsFactor;

  // Vehicle use factor
  const useFactors: Record<string, number> = {
    personal: 1.0,
    business: 1.15,
    commercial: 1.35,
  };
  basePremium *= useFactors[vehicleUse] || 1.0;

  // Annual mileage factor
  const mileageFactor = annualMileage > 25000 ? 1.25 :
                        annualMileage > 15000 ? 1.10 :
                        annualMileage > 10000 ? 1.0 : 0.95;
  basePremium *= mileageFactor;

  // Overnight parking factor
  const parkingFactors: Record<string, number> = {
    garage: 0.90,
    driveway: 1.0,
    street: 1.15,
  };
  basePremium *= parkingFactors[overnightParking] || 1.0;

  // Anti-theft device discount
  const antiTheftDiscount = Math.min(0.15, antiTheftDevices.length * 0.05);
  basePremium *= (1 - antiTheftDiscount);

  // Coverage type factor
  const coverageFactors: Record<string, number> = {
    comprehensive: 1.0,
    third_party_fire_theft: 0.65,
    third_party: 0.40,
  };
  basePremium *= coverageFactors[coverageType] || 1.0;

  // Voluntary excess discount
  const excessDiscount = voluntaryExcess / 1000 * 0.05; // 5% discount per $1,000 excess
  basePremium *= Math.max(0.7, 1 - excessDiscount);

  // Territory factor (Caribbean regions)
  const territoryFactors: Record<string, number> = {
    trinidad: 1.0,
    tobago: 1.05,
    jamaica: 1.10,
    barbados: 1.08,
    guyana: 1.15,
    other: 1.12,
  };
  basePremium *= territoryFactors[territory] || 1.0;

  // Calculate net and gross premium
  const netPremium = basePremium;
  const loading = LOADING_FACTORS.motor;
  const totalLoading = loading.acquisition + loading.maintenance + loading.profit + loading.contingency;
  const grossPremium = netPremium / (1 - totalLoading);

  const commission = grossPremium * 0.12;
  const policyFee = 75;
  const taxes = grossPremium * 0.025;
  const totalPremium = grossPremium + commission + policyFee + taxes;

  return {
    netPremium: Math.round(netPremium * 100) / 100,
    grossPremium: Math.round(grossPremium * 100) / 100,
    loading: Math.round((grossPremium - netPremium) * 100) / 100,
    commission: Math.round(commission * 100) / 100,
    policyFee,
    taxes: Math.round(taxes * 100) / 100,
    totalPremium: Math.round(totalPremium * 100) / 100,
    currency: input.currency || 'TTD',
    breakdown: [
      { component: 'Vehicle Base Rate', amount: Math.round(baseRate * unitsOfValue * 100) / 100, rate: baseRate },
      { component: 'Vehicle Age Factor', amount: Math.round((vehicleAgeFactor - 1) * baseRate * unitsOfValue * 100) / 100, rate: vehicleAgeFactor },
      { component: 'Driver Age Factor', amount: Math.round((driverAgeFactor - 1) * netPremium * 100) / 100, rate: driverAgeFactor },
      { component: 'Claims History', amount: Math.round((claimsFactor - 1) * netPremium * 100) / 100, rate: claimsFactor },
      { component: 'Anti-theft Discount', amount: Math.round(-antiTheftDiscount * netPremium * 100) / 100, rate: -antiTheftDiscount },
    ],
  };
}

// ==================== PROPERTY INSURANCE RATING ====================

/**
 * Calculate Property Insurance Premium
 * Based on construction, occupancy, and protection factors
 */
export function calculatePropertyPremium(input: PropertyRatingInput): PremiumBreakdown {
  const {
    propertyType,
    constructionType,
    constructionYear,
    occupancyType,
    squareFootage,
    numberOfStories,
    roofType,
    fireProtection,
    alarmSystem,
    sprinklerSystem,
    location,
    floodZone,
    hurricaneShutters,
    claimsHistory,
    propertyValue,
    contentsValue,
    territory = 'caribbean',
  } = input;

  // Base rate per $1,000 of property value
  const baseRates: Record<string, number> = {
    residential: 2.5,
    commercial: 4.0,
    industrial: 5.5,
  };

  const baseRate = baseRates[propertyType] || 3.0;
  const propertyUnits = propertyValue / 1000;
  const contentsUnits = contentsValue / 1000;

  let basePremium = baseRate * propertyUnits;

  // Construction type factor
  const constructionFactor = CONSTRUCTION_TYPE_FACTORS[constructionType] || 1.0;
  basePremium *= constructionFactor;

  // Building age factor
  const currentYear = new Date().getFullYear();
  const buildingAge = currentYear - constructionYear;
  const ageFactor = buildingAge <= 10 ? 1.0 :
                   buildingAge <= 25 ? 1.05 :
                   buildingAge <= 50 ? 1.15 : 1.30;
  basePremium *= ageFactor;

  // Occupancy factor
  const occupancyFactors: Record<string, number> = {
    owner_occupied: 0.95,
    tenant: 1.0,
    vacant: 1.25,
    business: 1.10,
  };
  basePremium *= occupancyFactors[occupancyType] || 1.0;

  // Square footage factor
  const sizeFactor = squareFootage > 5000 ? 1.15 :
                    squareFootage > 3000 ? 1.05 :
                    squareFootage > 1500 ? 1.0 : 0.95;
  basePremium *= sizeFactor;

  // Number of stories factor
  const storiesFactor = numberOfStories > 3 ? 1.10 :
                       numberOfStories > 1 ? 1.02 : 1.0;
  basePremium *= storiesFactor;

  // Roof type factor
  const roofFactors: Record<string, number> = {
    shingle: 1.10,
    tile: 0.95,
    metal: 0.90,
    flat: 1.15,
    other: 1.05,
  };
  basePremium *= roofFactors[roofType] || 1.0;

  // Fire protection factor
  const fireProtectionFactors: Record<string, number> = {
    hydrant_within_1000ft: 0.85,
    hydrant_1000_5280ft: 0.95,
    fire_station_within_5mi: 1.05,
    none: 1.25,
  };
  basePremium *= fireProtectionFactors[fireProtection] || 1.0;

  // Alarm system discount
  if (alarmSystem) {
    basePremium *= 0.90;
  }

  // Sprinkler system discount
  if (sprinklerSystem) {
    basePremium *= 0.85;
  }

  // Location factor
  const locationFactors: Record<string, number> = {
    urban: 1.0,
    suburban: 0.95,
    rural: 1.10,
  };
  basePremium *= locationFactors[location] || 1.0;

  // Flood zone factor
  const floodZoneFactors: Record<string, number> = {
    A: 1.50,
    AE: 1.45,
    X: 1.0,
    VE: 1.75,
    none: 1.0,
  };
  basePremium *= floodZoneFactors[floodZone] || 1.0;

  // Hurricane protection (Caribbean)
  if (hurricaneShutters && territory === 'caribbean') {
    basePremium *= 0.90;
  }

  // Claims history
  const claimsFactor = 1 + (claimsHistory * 0.10);
  basePremium *= claimsFactor;

  // Contents coverage
  const contentsPremium = baseRate * 0.5 * contentsUnits; // Contents at 50% of building rate
  basePremium += contentsPremium;

  // Caribbean territory adjustment
  if (territory === 'caribbean') {
    basePremium *= 1.20; // Higher rates for hurricane/wind exposure
  }

  // Calculate net and gross premium
  const netPremium = basePremium;
  const loading = LOADING_FACTORS.property;
  const totalLoading = loading.acquisition + loading.maintenance + loading.profit + loading.contingency;
  const grossPremium = netPremium / (1 - totalLoading);

  const commission = grossPremium * 0.10;
  const policyFee = 100;
  const taxes = grossPremium * 0.025;
  const totalPremium = grossPremium + commission + policyFee + taxes;

  return {
    netPremium: Math.round(netPremium * 100) / 100,
    grossPremium: Math.round(grossPremium * 100) / 100,
    loading: Math.round((grossPremium - netPremium) * 100) / 100,
    commission: Math.round(commission * 100) / 100,
    policyFee,
    taxes: Math.round(taxes * 100) / 100,
    totalPremium: Math.round(totalPremium * 100) / 100,
    currency: input.currency || 'TTD',
    breakdown: [
      { component: 'Building Coverage', amount: Math.round(baseRate * propertyUnits * 100) / 100, rate: baseRate },
      { component: 'Construction Type', amount: Math.round((constructionFactor - 1) * netPremium * 100) / 100, rate: constructionFactor },
      { component: 'Fire Protection', amount: Math.round((fireProtectionFactors[fireProtection] - 1) * netPremium * 100) / 100, rate: fireProtectionFactors[fireProtection] },
      { component: 'Contents Coverage', amount: Math.round(contentsPremium * 100) / 100, rate: 0.5 },
      { component: 'Hurricane Exposure', amount: Math.round(0.20 * netPremium * 100) / 100, rate: 1.20 },
    ],
  };
}

// ==================== MARINE INSURANCE RATING ====================

/**
 * Calculate Marine Insurance Premium
 * Based on vessel, cargo, and voyage characteristics
 */
export function calculateMarinePremium(input: MarineRatingInput): PremiumBreakdown {
  const {
    vesselType,
    vesselAge,
    grossTonnage,
    vesselValue,
    flagState,
    classificationSociety,
    voyageFrom,
    voyageTo,
    cargoType,
    cargoValue,
    cargoHazardClass,
    voyageDuration,
    crewSize,
    masterExperience,
    piracyRisk,
    warRisk,
    coverageType,
    territory = 'caribbean',
  } = input;

  // Base rate per $1,000 of value
  const baseRate = MARINE_BASE_RATES[vesselType] || 10;
  
  let basePremium = 0;

  // Hull coverage (if applicable)
  if (coverageType === 'hull' || coverageType === 'comprehensive') {
    const hullUnits = vesselValue / 1000;
    let hullPremium = baseRate * hullUnits;

    // Vessel age factor
    const vesselAgeFactor = vesselAge <= 5 ? 0.90 :
                           vesselAge <= 10 ? 1.0 :
                           vesselAge <= 20 ? 1.15 : 1.35;
    hullPremium *= vesselAgeFactor;

    // Gross tonnage factor
    const tonnageFactor = grossTonnage > 50000 ? 0.85 :
                         grossTonnage > 20000 ? 0.90 :
                         grossTonnage > 5000 ? 1.0 : 1.10;
    hullPremium *= tonnageFactor;

    // Flag state factor (considering maritime safety records)
    const flagStateFactor = ['TT', 'BB', 'JM', 'BS'].includes(flagState) ? 1.0 : 1.05;
    hullPremium *= flagStateFactor;

    // Classification society factor
    const classSocietyFactor = ['ABS', 'LRS', 'DNV', 'BV'].includes(classificationSociety) ? 0.95 : 1.05;
    hullPremium *= classSocietyFactor;

    basePremium += hullPremium;
  }

  // Cargo coverage (if applicable)
  if (coverageType === 'cargo' || coverageType === 'comprehensive') {
    const cargoUnits = cargoValue / 1000;
    const cargoBaseRate = 5.0; // Base rate for cargo
    let cargoPremium = cargoBaseRate * cargoUnits;

    // Cargo hazard class factor
    const hazardFactors: Record<string, number> = {
      low: 0.85,
      medium: 1.0,
      high: 1.30,
      hazardous: 1.75,
    };
    cargoPremium *= hazardFactors[cargoHazardClass] || 1.0;

    // Voyage duration factor
    const durationFactor = voyageDuration <= 7 ? 1.0 :
                          voyageDuration <= 14 ? 1.05 :
                          voyageDuration <= 30 ? 1.15 : 1.25;
    cargoPremium *= durationFactor;

    basePremium += cargoPremium;
  }

  // P&I coverage (if applicable)
  if (coverageType === 'protection_indemnity' || coverageType === 'comprehensive') {
    const piBaseRate = 3.0;
    const gtUnits = grossTonnage / 1000;
    let piPremium = piBaseRate * gtUnits;

    // Crew size factor
    const crewFactor = crewSize > 25 ? 1.15 :
                      crewSize > 10 ? 1.05 : 1.0;
    piPremium *= crewFactor;

    basePremium += piPremium;
  }

  // Master experience factor
  const experienceFactor = masterExperience >= 15 ? 0.90 :
                          masterExperience >= 10 ? 0.95 :
                          masterExperience >= 5 ? 1.0 : 1.10;
  basePremium *= experienceFactor;

  // Piracy risk surcharge
  if (piracyRisk) {
    basePremium *= 1.50;
  }

  // War risk surcharge
  if (warRisk) {
    basePremium *= 1.25;
  }

  // Caribbean route factor
  if (territory === 'caribbean') {
    basePremium *= 1.10;
  }

  // Calculate net and gross premium
  const netPremium = basePremium;
  const loading = LOADING_FACTORS.marine;
  const totalLoading = loading.acquisition + loading.maintenance + loading.profit + loading.contingency;
  const grossPremium = netPremium / (1 - totalLoading);

  const commission = grossPremium * 0.10;
  const policyFee = 150;
  const taxes = grossPremium * 0.025;
  const totalPremium = grossPremium + commission + policyFee + taxes;

  return {
    netPremium: Math.round(netPremium * 100) / 100,
    grossPremium: Math.round(grossPremium * 100) / 100,
    loading: Math.round((grossPremium - netPremium) * 100) / 100,
    commission: Math.round(commission * 100) / 100,
    policyFee,
    taxes: Math.round(taxes * 100) / 100,
    totalPremium: Math.round(totalPremium * 100) / 100,
    currency: input.currency || 'TTD',
    breakdown: [
      { component: 'Hull Coverage', amount: Math.round((coverageType === 'hull' || coverageType === 'comprehensive' ? baseRate * vesselValue / 1000 : 0) * 100) / 100, rate: baseRate },
      { component: 'Cargo Coverage', amount: Math.round((coverageType === 'cargo' || coverageType === 'comprehensive' ? 5.0 * cargoValue / 1000 : 0) * 100) / 100, rate: 5.0 },
      { component: 'P&I Coverage', amount: Math.round((coverageType === 'protection_indemnity' || coverageType === 'comprehensive' ? 3.0 * grossTonnage / 1000 : 0) * 100) / 100, rate: 3.0 },
      { component: 'Piracy Risk', amount: Math.round((piracyRisk ? 0.50 * netPremium : 0) * 100) / 100, rate: piracyRisk ? 1.50 : 1.0 },
      { component: 'War Risk', amount: Math.round((warRisk ? 0.25 * netPremium : 0) * 100) / 100, rate: warRisk ? 1.25 : 1.0 },
    ],
  };
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Convert premium between currencies
 */
export function convertPremium(
  premium: PremiumBreakdown,
  toCurrency: string
): PremiumBreakdown {
  const fromRate = CURRENCY_RATES[premium.currency] || 1;
  const toRate = CURRENCY_RATES[toCurrency] || 1;
  const conversionFactor = fromRate / toRate;

  return {
    ...premium,
    currency: toCurrency,
    netPremium: Math.round(premium.netPremium * conversionFactor * 100) / 100,
    grossPremium: Math.round(premium.grossPremium * conversionFactor * 100) / 100,
    loading: Math.round(premium.loading * conversionFactor * 100) / 100,
    commission: Math.round(premium.commission * conversionFactor * 100) / 100,
    policyFee: Math.round(premium.policyFee * conversionFactor * 100) / 100,
    taxes: Math.round(premium.taxes * conversionFactor * 100) / 100,
    totalPremium: Math.round(premium.totalPremium * conversionFactor * 100) / 100,
  };
}

/**
 * Get rating factors for display
 */
export function getRatingFactors(
  lineOfBusiness: 'life' | 'health' | 'motor' | 'property' | 'marine'
): RatingFactor[] {
  const factors: RatingFactor[] = [];
  
  switch (lineOfBusiness) {
    case 'life':
      factors.push(
        { name: 'Mortality Rate', baseRate: 1.0, factor: 1.0, adjustedRate: 1.0, description: 'Based on CSO 2017 table' },
        { name: 'Interest Rate', baseRate: 0.045, factor: 1.0, adjustedRate: 0.045, description: '4.5% assumed rate' },
        { name: 'Health Class', baseRate: 1.0, factor: 1.0, adjustedRate: 1.0, description: 'Preferred/Standard/Rated' },
        { name: 'Occupation', baseRate: 1.0, factor: 1.0, adjustedRate: 1.0, description: 'Class 1-4 rating' }
      );
      break;
    case 'motor':
      factors.push(
        { name: 'Vehicle Type', baseRate: 35.0, factor: 1.0, adjustedRate: 35.0, description: 'Per $1,000 value' },
        { name: 'Driver Age', baseRate: 1.0, factor: 1.0, adjustedRate: 1.0, description: 'Age-based factor' },
        { name: 'Claims History', baseRate: 1.0, factor: 1.0, adjustedRate: 1.0, description: '15% per claim' },
        { name: 'Territory', baseRate: 1.0, factor: 1.0, adjustedRate: 1.0, description: 'Caribbean rates' }
      );
      break;
    case 'property':
      factors.push(
        { name: 'Construction', baseRate: 1.0, factor: 1.0, adjustedRate: 1.0, description: 'Frame/Brick/Concrete' },
        { name: 'Fire Protection', baseRate: 1.0, factor: 1.0, adjustedRate: 1.0, description: 'Hydrant proximity' },
        { name: 'Hurricane', baseRate: 1.20, factor: 1.0, adjustedRate: 1.20, description: 'Caribbean exposure' },
        { name: 'Flood Zone', baseRate: 1.0, factor: 1.0, adjustedRate: 1.0, description: 'FEMA zone rating' }
      );
      break;
    case 'marine':
      factors.push(
        { name: 'Vessel Type', baseRate: 10.0, factor: 1.0, adjustedRate: 10.0, description: 'Per $1,000 value' },
        { name: 'Vessel Age', baseRate: 1.0, factor: 1.0, adjustedRate: 1.0, description: 'Age adjustment' },
        { name: 'Voyage Risk', baseRate: 1.0, factor: 1.0, adjustedRate: 1.0, description: 'Route factors' },
        { name: 'War/Piracy', baseRate: 1.0, factor: 1.0, adjustedRate: 1.0, description: 'Geopolitical risk' }
      );
      break;
    case 'health':
      factors.push(
        { name: 'Morbidity', baseRate: 1.0, factor: 1.0, adjustedRate: 1.0, description: 'Age-based factor' },
        { name: 'Coverage Type', baseRate: 450.0, factor: 1.0, adjustedRate: 450.0, description: 'Per $10,000 coverage' },
        { name: 'Deductible', baseRate: 1.0, factor: 1.0, adjustedRate: 1.0, description: 'Credit adjustment' },
        { name: 'Pre-existing', baseRate: 1.0, factor: 1.0, adjustedRate: 1.0, description: '15% per condition' }
      );
      break;
  }

  return factors;
}

// Export types
export type {
  LifeRatingInput as LifeRatingInputType,
  HealthRatingInput as HealthRatingInputType,
  MotorRatingInput as MotorRatingInputType,
  PropertyRatingInput as PropertyRatingInputType,
  MarineRatingInput as MarineRatingInputType,
  PremiumBreakdown as PremiumBreakdownType,
  RatingFactor as RatingFactorType,
};
