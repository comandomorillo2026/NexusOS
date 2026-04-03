/**
 * Premium Calculation API
 * 
 * POST: Calculate premium for various lines of business
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  calculateLifePremium,
  calculateHealthPremium,
  calculateMotorPremium,
  calculatePropertyPremium,
  calculateMarinePremium,
  convertPremium,
  LifeRatingInput,
  HealthRatingInput,
  MotorRatingInput,
  PropertyRatingInput,
  MarineRatingInput,
} from '@/lib/insurance/rating-engine';

export interface PremiumCalculationRequest {
  lineOfBusiness: 'life' | 'health' | 'motor' | 'property' | 'marine';
  currency?: string;
  
  // Life inputs
  lifeInput?: {
    sumAssured: number;
    insuredAge: number;
    insuredGender: 'male' | 'female';
    smokerStatus: 'smoker' | 'nonsmoker' | 'aggregate';
    region?: 'standard' | 'caribbean';
    planType: 'term' | 'whole_life' | 'endowment' | 'universal';
    termYears?: number;
    premiumFrequency: 'annual' | 'semi_annual' | 'quarterly' | 'monthly';
    healthClass: 'preferred' | 'standard' | 'rated';
    occupationClass: number;
    aviationHazard?: boolean;
    avocationHazard?: boolean;
  };
  
  // Health inputs
  healthInput?: {
    sumAssured: number;
    insuredAge: number;
    insuredGender: 'male' | 'female';
    smokerStatus: 'smoker' | 'nonsmoker';
    region?: 'standard' | 'caribbean';
    planType: 'individual' | 'family' | 'group';
    coverageType: 'comprehensive' | 'major_medical' | 'hospital_only' | 'critical_illness';
    deductible: number;
    coInsurancePercentage: number;
    outOfPocketMax: number;
    preExistingConditions: string[];
    familySize?: number;
    groupSize?: number;
  };
  
  // Motor inputs
  motorInput?: {
    vehicleType: 'private_car' | 'suv' | 'pickup' | 'motorcycle' | 'commercial' | 'taxi';
    vehicleMake: string;
    vehicleModel: string;
    vehicleYear: number;
    vehicleValue: number;
    driverAge: number;
    driverGender: 'male' | 'female';
    driverExperience: number;
    claimsHistory: number;
    trafficViolations: number;
    vehicleUse: 'personal' | 'business' | 'commercial';
    annualMileage: number;
    overnightParking: 'garage' | 'driveway' | 'street';
    antiTheftDevices: string[];
    coverageType: 'comprehensive' | 'third_party' | 'third_party_fire_theft';
    voluntaryExcess: number;
  };
  
  // Property inputs
  propertyInput?: {
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
  };
  
  // Marine inputs
  marineInput?: {
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
    voyageDuration: number;
    crewSize: number;
    masterExperience: number;
    piracyRisk: boolean;
    warRisk: boolean;
    coverageType: 'hull' | 'cargo' | 'protection_indemnity' | 'comprehensive';
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: PremiumCalculationRequest = await request.json();
    const currency = body.currency || 'TTD';

    let result;

    switch (body.lineOfBusiness) {
      case 'life':
        if (!body.lifeInput) {
          return NextResponse.json(
            { success: false, error: 'Missing life insurance input parameters' },
            { status: 400 }
          );
        }
        const lifeResult = calculateLifePremium({
          ...body.lifeInput,
          effectiveDate: new Date(),
          currency,
        });
        result = currency !== 'TTD' ? convertPremium(lifeResult, currency) : lifeResult;
        break;

      case 'health':
        if (!body.healthInput) {
          return NextResponse.json(
            { success: false, error: 'Missing health insurance input parameters' },
            { status: 400 }
          );
        }
        const healthResult = calculateHealthPremium({
          ...body.healthInput,
          effectiveDate: new Date(),
          currency,
        });
        result = currency !== 'TTD' ? convertPremium(healthResult, currency) : healthResult;
        break;

      case 'motor':
        if (!body.motorInput) {
          return NextResponse.json(
            { success: false, error: 'Missing motor insurance input parameters' },
            { status: 400 }
          );
        }
        const motorResult = calculateMotorPremium({
          ...body.motorInput,
          effectiveDate: new Date(),
          currency,
          sumAssured: body.motorInput.vehicleValue,
        });
        result = currency !== 'TTD' ? convertPremium(motorResult, currency) : motorResult;
        break;

      case 'property':
        if (!body.propertyInput) {
          return NextResponse.json(
            { success: false, error: 'Missing property insurance input parameters' },
            { status: 400 }
          );
        }
        const propertyResult = calculatePropertyPremium({
          ...body.propertyInput,
          effectiveDate: new Date(),
          currency,
          sumAssured: body.propertyInput.propertyValue + body.propertyInput.contentsValue,
        });
        result = currency !== 'TTD' ? convertPremium(propertyResult, currency) : propertyResult;
        break;

      case 'marine':
        if (!body.marineInput) {
          return NextResponse.json(
            { success: false, error: 'Missing marine insurance input parameters' },
            { status: 400 }
          );
        }
        const marineResult = calculateMarinePremium({
          ...body.marineInput,
          effectiveDate: new Date(),
          currency,
          sumAssured: body.marineInput.vesselValue + body.marineInput.cargoValue,
        });
        result = currency !== 'TTD' ? convertPremium(marineResult, currency) : marineResult;
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid line of business' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: {
        lineOfBusiness: body.lineOfBusiness,
        premium: result,
        calculatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error calculating premium:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate premium' },
      { status: 500 }
    );
  }
}
