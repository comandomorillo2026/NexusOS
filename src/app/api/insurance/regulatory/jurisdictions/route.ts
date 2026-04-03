import { NextResponse } from 'next/server';
import {
  ALL_JURISDICTIONS,
  REGIONS,
  getJurisdictionByCode,
  getJurisdictionsByRegion,
  JurisdictionConfig,
} from '@/lib/insurance/jurisdictions';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const region = searchParams.get('region');
    const includeFilings = searchParams.get('includeFilings') === 'true';

    // Get specific jurisdiction by code
    if (code) {
      const jurisdiction = getJurisdictionByCode(code);
      if (!jurisdiction) {
        return NextResponse.json(
          { error: 'Jurisdiction not found', code },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: jurisdiction,
      });
    }

    // Get jurisdictions by region
    if (region) {
      const jurisdictions = getJurisdictionsByRegion(region);
      return NextResponse.json({
        success: true,
        data: jurisdictions,
        count: jurisdictions.length,
        region,
      });
    }

    // Return all jurisdictions with optional filing summary
    const jurisdictions = ALL_JURISDICTIONS.map(j => {
      const summary: Partial<JurisdictionConfig> = {
        code: j.code,
        name: j.name,
        region: j.region,
        currency: j.currency,
        regulator: {
          name: j.regulator.name,
          shortName: j.regulator.shortName,
          website: j.regulator.website,
          email: j.regulator.email,
          phone: j.regulator.phone,
          address: j.regulator.address,
        },
        capitalRequirements: j.capitalRequirements,
        electronicSubmissionEnabled: j.electronicSubmissionEnabled,
        digitalSignatureRequired: j.digitalSignatureRequired,
        reportingBasis: j.reportingBasis,
      };

      if (includeFilings) {
        return {
          ...summary,
          filingRequirements: j.filingRequirements.map(f => ({
            id: f.id,
            type: f.type,
            name: f.name,
            description: f.description,
            dueDay: f.dueDay,
            dueMonth: f.dueMonth,
            dataFormat: f.dataFormat,
            penaltyAmount: f.penaltyAmount,
            penaltyCurrency: f.penaltyCurrency,
          })),
        };
      }

      return summary;
    });

    return NextResponse.json({
      success: true,
      data: jurisdictions,
      count: jurisdictions.length,
      regions: REGIONS,
    });
  } catch (error) {
    console.error('Error fetching jurisdictions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jurisdictions' },
      { status: 500 }
    );
  }
}
