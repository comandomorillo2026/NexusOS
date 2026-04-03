import { NextRequest, NextResponse } from 'next/server';

// Known drug interactions database (simplified for demo)
const drugInteractions: Array<{
  drug1: string;
  drug2: string;
  severity: 'major' | 'moderate' | 'minor';
  description: string;
  clinicalEffects: string;
  recommendation: string;
  onset: 'rapid' | 'delayed';
  documentation: 'well_established' | 'probable' | 'suspected' | 'possible';
}> = [
  {
    drug1: 'Warfarin',
    drug2: 'Amiodarone',
    severity: 'major',
    description: 'Amiodarone inhibits CYP2C9 and CYP1A2, significantly increasing warfarin plasma levels.',
    clinicalEffects: 'Increased INR, bleeding risk significantly elevated.',
    recommendation: 'Reduce warfarin dose by 30-50% when initiating amiodarone. Monitor INR closely for first 2 weeks.',
    onset: 'delayed',
    documentation: 'well_established',
  },
  {
    drug1: 'Warfarin',
    drug2: 'Aspirin',
    severity: 'major',
    description: 'Additive anticoagulant effect with increased bleeding risk.',
    clinicalEffects: 'Increased bleeding risk, GI ulceration, intracranial hemorrhage.',
    recommendation: 'Avoid combination if possible. If necessary, monitor closely for bleeding signs.',
    onset: 'rapid',
    documentation: 'well_established',
  },
  {
    drug1: 'Warfarin',
    drug2: 'Ibuprofen',
    severity: 'major',
    description: 'NSAIDs increase bleeding risk through platelet inhibition and GI mucosal damage.',
    clinicalEffects: 'Increased bleeding risk, GI ulceration and bleeding.',
    recommendation: 'Avoid NSAIDs in patients on warfarin. Consider acetaminophen for pain.',
    onset: 'rapid',
    documentation: 'well_established',
  },
  {
    drug1: 'Metformin',
    drug2: 'Ciprofloxacin',
    severity: 'moderate',
    description: 'Fluoroquinolones may enhance the hypoglycemic effect of metformin.',
    clinicalEffects: 'Risk of hypoglycemia, especially in elderly or patients with renal impairment.',
    recommendation: 'Monitor blood glucose more frequently. Adjust metformin dose if needed.',
    onset: 'delayed',
    documentation: 'probable',
  },
  {
    drug1: 'Atorvastatin',
    drug2: 'Clarithromycin',
    severity: 'major',
    description: 'Clarithromycin strongly inhibits CYP3A4, significantly increasing atorvastatin levels.',
    clinicalEffects: 'Increased risk of myopathy, rhabdomyolysis, and hepatotoxicity.',
    recommendation: 'CONTRAINDICATED. Suspend atorvastatin during clarithromycin therapy.',
    onset: 'rapid',
    documentation: 'well_established',
  },
  {
    drug1: 'Simvastatin',
    drug2: 'Amiodarone',
    severity: 'major',
    description: 'Amiodarone inhibits CYP3A4, increasing simvastatin levels.',
    clinicalEffects: 'Increased risk of myopathy and rhabdomyolysis.',
    recommendation: 'Do not exceed 20mg simvastatin daily with amiodarone.',
    onset: 'delayed',
    documentation: 'well_established',
  },
  {
    drug1: 'Lisinopril',
    drug2: 'Ibuprofen',
    severity: 'moderate',
    description: 'NSAIDs reduce the antihypertensive effect of ACE inhibitors.',
    clinicalEffects: 'Reduced blood pressure control, potential for acute kidney injury.',
    recommendation: 'Monitor blood pressure and renal function.',
    onset: 'delayed',
    documentation: 'well_established',
  },
  {
    drug1: 'Digoxin',
    drug2: 'Amiodarone',
    severity: 'major',
    description: 'Amiodarone reduces renal and non-renal clearance of digoxin.',
    clinicalEffects: 'Increased digoxin levels leading to toxicity.',
    recommendation: 'Reduce digoxin dose by 50% when starting amiodarone.',
    onset: 'delayed',
    documentation: 'well_established',
  },
];

// Allergy cross-sensitivity data
const allergyCrossSensitivity: Array<{
  allergen: string;
  crossReactive: string[];
  severity: 'high' | 'moderate' | 'low';
  notes: string;
}> = [
  {
    allergen: 'Penicillin',
    crossReactive: ['Amoxicillin', 'Ampicillin', 'Cephalosporins'],
    severity: 'high',
    notes: '10-20% cross-reactivity with cephalosporins.',
  },
  {
    allergen: 'Sulfonamides',
    crossReactive: ['Furosemide', 'Thiazide diuretics', 'Sulfonylureas'],
    severity: 'moderate',
    notes: 'Cross-reactivity controversial. Monitor closely.',
  },
  {
    allergen: 'NSAIDs',
    crossReactive: ['Ibuprofen', 'Naproxen', 'Diclofenac', 'Celecoxib'],
    severity: 'high',
    notes: 'Avoid all NSAIDs. Consider acetaminophen.',
  },
  {
    allergen: 'Codeine',
    crossReactive: ['Morphine', 'Hydrocodone', 'Oxycodone'],
    severity: 'moderate',
    notes: 'True allergy suggests cross-reactivity with all opioids.',
  },
];

// Drug database for lookup
const drugDatabase = [
  { name: 'Warfarin', generic: 'Warfarin', class: 'Anticoagulant' },
  { name: 'Amiodarone', generic: 'Amiodarone', class: 'Antiarrhythmic' },
  { name: 'Metformin', generic: 'Metformin', class: 'Antidiabetic' },
  { name: 'Lisinopril', generic: 'Lisinopril', class: 'ACE Inhibitor' },
  { name: 'Atorvastatin', generic: 'Atorvastatin', class: 'Statin' },
  { name: 'Simvastatin', generic: 'Simvastatin', class: 'Statin' },
  { name: 'Omeprazole', generic: 'Omeprazole', class: 'Proton Pump Inhibitor' },
  { name: 'Aspirin', generic: 'Aspirin', class: 'Antiplatelet' },
  { name: 'Clopidogrel', generic: 'Clopidogrel', class: 'Antiplatelet' },
  { name: 'Digoxin', generic: 'Digoxin', class: 'Cardiac Glycoside' },
  { name: 'Ibuprofen', generic: 'Ibuprofen', class: 'NSAID' },
  { name: 'Ciprofloxacin', generic: 'Ciprofloxacin', class: 'Fluoroquinolone' },
  { name: 'Clarithromycin', generic: 'Clarithromycin', class: 'Macrolide' },
  { name: 'Amoxicillin', generic: 'Amoxicillin', class: 'Penicillin' },
  { name: 'Fluoxetine', generic: 'Fluoxetine', class: 'SSRI' },
  { name: 'Sertraline', generic: 'Sertraline', class: 'SSRI' },
  { name: 'Carbamazepine', generic: 'Carbamazepine', class: 'Anticonvulsant' },
  { name: 'Phenytoin', generic: 'Phenytoin', class: 'Anticonvulsant' },
];

// GET /api/pharmacy/interactions - Check for drug interactions
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const drugs = searchParams.get('drugs')?.split(',').map(d => d.trim()) || [];
    const allergies = searchParams.get('allergies')?.split(',').map(a => a.trim()) || [];

    const interactions: typeof drugInteractions = [];
    const allergyAlerts: typeof allergyCrossSensitivity = [];

    // Check drug-drug interactions
    for (let i = 0; i < drugs.length; i++) {
      for (let j = i + 1; j < drugs.length; j++) {
        const drug1 = drugs[i];
        const drug2 = drugs[j];

        const interaction = drugInteractions.find(
          int => (int.drug1.toLowerCase() === drug1.toLowerCase() && int.drug2.toLowerCase() === drug2.toLowerCase()) ||
                 (int.drug1.toLowerCase() === drug2.toLowerCase() && int.drug2.toLowerCase() === drug1.toLowerCase())
        );

        if (interaction) {
          interactions.push(interaction);
        }
      }
    }

    // Check allergy cross-sensitivity
    allergies.forEach(allergy => {
      drugs.forEach(drug => {
        const sensitivity = allergyCrossSensitivity.find(
          s => s.allergen.toLowerCase() === allergy.toLowerCase() &&
               s.crossReactive.some(cr => cr.toLowerCase() === drug.toLowerCase())
        );

        if (sensitivity) {
          allergyAlerts.push({
            ...sensitivity,
            notes: `${drug} may cross-react with patient's allergy to ${sensitivity.allergen}. ${sensitivity.notes}`,
          });
        }
      });
    });

    // Calculate severity summary
    const severitySummary = {
      major: interactions.filter(i => i.severity === 'major').length,
      moderate: interactions.filter(i => i.severity === 'moderate').length,
      minor: interactions.filter(i => i.severity === 'minor').length,
      allergyAlerts: allergyAlerts.length,
    };

    return NextResponse.json({
      interactions,
      allergyAlerts,
      severitySummary,
      drugsChecked: drugs,
      allergiesChecked: allergies,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error checking interactions:', error);
    return NextResponse.json({ error: 'Failed to check interactions' }, { status: 500 });
  }
}

// POST /api/pharmacy/interactions - Log DUR override
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, prescriptionId, alertType, severity, overrideReason, overriddenBy } = body;

    // In a real implementation, this would save to the database
    // For now, we'll just return a success response
    
    return NextResponse.json({
      success: true,
      message: 'DUR override logged successfully',
      data: {
        tenantId,
        prescriptionId,
        alertType,
        severity,
        overrideReason,
        overriddenBy,
        overriddenAt: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Error logging DUR override:', error);
    return NextResponse.json({ error: 'Failed to log DUR override' }, { status: 500 });
  }
}
