/**
 * Mortality Tables API
 * 
 * GET: Retrieve mortality table data
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  generateMortalityTable,
  getMortalityRate,
  calculateSurvivalProbability,
  calculateDeathProbability,
  generateCommutationFunctions,
  getAbbreviatedMortalityTable,
  compareMortalityRates,
  STANDARD_TABLES,
} from '@/lib/insurance/mortality-tables';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const gender = (searchParams.get('gender') as 'male' | 'female') || 'male';
    const smokerStatus = (searchParams.get('smokerStatus') as 'smoker' | 'nonsmoker' | 'aggregate') || 'aggregate';
    const region = (searchParams.get('region') as 'standard' | 'caribbean') || 'caribbean';
    const format = searchParams.get('format') || 'full'; // 'full', 'abbreviated', 'compare'
    const age = searchParams.get('age');
    const years = searchParams.get('years');
    const interestRate = searchParams.get('interestRate');

    // Handle specific age query
    if (age) {
      const ageNum = parseInt(age);
      const rate = getMortalityRate({
        age: ageNum,
        gender,
        smokerStatus,
        region,
      });

      return NextResponse.json({
        success: true,
        data: {
          query: { age: ageNum, gender, smokerStatus, region },
          rate,
        },
      });
    }

    // Handle survival probability query
    if (years) {
      const yearsNum = parseInt(years);
      const ageNum = age ? parseInt(age) : 30;
      
      const survivalProb = calculateSurvivalProbability(
        ageNum,
        yearsNum,
        gender,
        smokerStatus,
        region
      );
      
      const deathProb = calculateDeathProbability(
        ageNum,
        yearsNum,
        gender,
        smokerStatus,
        region
      );

      return NextResponse.json({
        success: true,
        data: {
          query: { age: ageNum, years: yearsNum, gender, smokerStatus, region },
          survivalProbability: survivalProb,
          deathProbability: deathProb,
        },
      });
    }

    // Handle commutation functions query
    if (interestRate) {
      const rate = parseFloat(interestRate);
      const commutation = generateCommutationFunctions(gender, rate, smokerStatus, region);
      
      // Get abbreviated table for display
      const table = getAbbreviatedMortalityTable(gender, smokerStatus, region);

      return NextResponse.json({
        success: true,
        data: {
          table: {
            name: `CSO 2017 ${gender.toUpperCase()} ${smokerStatus.toUpperCase()} ${region === 'caribbean' ? '(Caribbean Adjusted)' : ''}`,
            gender,
            smokerStatus,
            region,
            interestRate: rate,
            rates: table,
          },
          commutationFunctions: {
            Dx: commutation.Dx.slice(0, 100),
            Nx: commutation.Nx.slice(0, 100),
            Cx: commutation.Cx.slice(0, 100),
            Mx: commutation.Mx.slice(0, 100),
          },
        },
      });
    }

    // Handle comparison query
    if (format === 'compare') {
      const maleTable = generateMortalityTable('male', smokerStatus, region);
      const femaleTable = generateMortalityTable('female', smokerStatus, region);
      const comparison = compareMortalityRates(maleTable, femaleTable);

      return NextResponse.json({
        success: true,
        data: {
          comparison: comparison.filter((_, i) => i % 5 === 0 || i === 0 || i === 120),
        },
      });
    }

    // Handle abbreviated format
    if (format === 'abbreviated') {
      const table = getAbbreviatedMortalityTable(gender, smokerStatus, region);

      return NextResponse.json({
        success: true,
        data: {
          table: {
            name: `CSO 2017 ${gender.toUpperCase()} ${smokerStatus.toUpperCase()} ${region === 'caribbean' ? '(Caribbean Adjusted)' : ''}`,
            gender,
            smokerStatus,
            region,
            rates: table,
          },
        },
      });
    }

    // Return full table (limited for API response)
    const fullTable = generateMortalityTable(gender, smokerStatus, region);
    
    // Return key ages for full table display
    const keyAges = [0, 1];
    for (let a = 20; a <= 80; a += 5) keyAges.push(a);
    keyAges.push(90, 100, 110, 120);
    
    const filteredRates = fullTable.rates.filter(r => keyAges.includes(r.age));

    return NextResponse.json({
      success: true,
      data: {
        table: {
          name: fullTable.name,
          gender: fullTable.gender,
          smokerStatus: fullTable.smokerStatus,
          region: fullTable.region,
          radix: fullTable.radix,
          rates: filteredRates,
        },
        summary: {
          totalAges: fullTable.rates.length,
          expectationAtBirth: fullTable.rates[0].ex,
          expectationAt65: fullTable.rates[65].ex,
          expectationAt85: fullTable.rates[85].ex,
        },
        availableTables: Object.keys(STANDARD_TABLES),
      },
    });
  } catch (error) {
    console.error('Error fetching mortality tables:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch mortality tables' },
      { status: 500 }
    );
  }
}
