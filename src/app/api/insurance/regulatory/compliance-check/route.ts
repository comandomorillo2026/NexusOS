import { NextResponse } from 'next/server';
import {
  ComplianceMonitor,
} from '@/lib/insurance/compliance-monitor';
import { getJurisdictionByCode, ALL_JURISDICTIONS } from '@/lib/insurance/jurisdictions';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jurisdictionCode = searchParams.get('jurisdiction');
    const action = searchParams.get('action');
    const days = parseInt(searchParams.get('days') || '90');

    // Get upcoming deadlines
    if (action === 'deadlines') {
      const jurisdictions = jurisdictionCode 
        ? [jurisdictionCode] 
        : undefined;
      
      const deadlines = ComplianceMonitor.getUpcomingDeadlines(jurisdictions, days);
      
      return NextResponse.json({
        success: true,
        data: deadlines,
        count: deadlines.length,
      });
    }

    // Get alerts
    if (action === 'alerts') {
      const alerts = jurisdictionCode
        ? ComplianceMonitor.getAlerts(jurisdictionCode)
        : ComplianceMonitor.getAllAlerts();
      
      return NextResponse.json({
        success: true,
        data: alerts,
        count: alerts.length,
        criticalCount: alerts.filter(a => a.severity === 'CRITICAL').length,
        highCount: alerts.filter(a => a.severity === 'HIGH').length,
      });
    }

    // Generate compliance report
    if (action === 'report') {
      if (!jurisdictionCode) {
        return NextResponse.json(
          { error: 'Jurisdiction code is required for report generation' },
          { status: 400 }
        );
      }

      const report = ComplianceMonitor.generateComplianceReport(jurisdictionCode);
      
      return NextResponse.json({
        success: true,
        data: report,
      });
    }

    // Get overview of all jurisdictions
    if (action === 'overview') {
      const overview = ALL_JURISDICTIONS.slice(0, 10).map(j => {
        try {
          const status = ComplianceMonitor.getComplianceStatus(j.code);
          return {
            code: j.code,
            name: j.name,
            region: j.region,
            regulator: j.regulator.shortName,
            overallStatus: status.overallStatus,
            score: status.score,
            alertsCount: status.alerts.length,
            criticalAlerts: status.alerts.filter(a => a.severity === 'CRITICAL').length,
          };
        } catch {
          return {
            code: j.code,
            name: j.name,
            region: j.region,
            regulator: j.regulator.shortName,
            overallStatus: 'UNKNOWN',
            score: 0,
            alertsCount: 0,
            criticalAlerts: 0,
          };
        }
      });

      return NextResponse.json({
        success: true,
        data: overview,
        totalJurisdictions: ALL_JURISDICTIONS.length,
      });
    }

    // Get specific jurisdiction compliance status
    if (jurisdictionCode) {
      const jurisdiction = getJurisdictionByCode(jurisdictionCode);
      if (!jurisdiction) {
        return NextResponse.json(
          { error: 'Jurisdiction not found', code: jurisdictionCode },
          { status: 404 }
        );
      }

      const status = ComplianceMonitor.getComplianceStatus(jurisdictionCode);
      
      return NextResponse.json({
        success: true,
        data: {
          jurisdiction: {
            code: jurisdiction.code,
            name: jurisdiction.name,
            region: jurisdiction.region,
            regulator: jurisdiction.regulator,
            currency: jurisdiction.currency,
          },
          compliance: status,
        },
      });
    }

    // Default: return summary of compliance across all monitored jurisdictions
    const monitoredJurisdictions = ALL_JURISDICTIONS.slice(0, 20);
    const summary = monitoredJurisdictions.map(j => {
      try {
        const status = ComplianceMonitor.getComplianceStatus(j.code);
        return {
          code: j.code,
          name: j.name,
          status: status.overallStatus,
          score: status.score,
        };
      } catch {
        return {
          code: j.code,
          name: j.name,
          status: 'UNKNOWN' as const,
          score: 0,
        };
      }
    });

    const statusCounts = {
      COMPLIANT: summary.filter(s => s.status === 'COMPLIANT').length,
      WARNING: summary.filter(s => s.status === 'WARNING').length,
      NON_COMPLIANT: summary.filter(s => s.status === 'NON_COMPLIANT').length,
      CRITICAL: summary.filter(s => s.status === 'CRITICAL').length,
    };

    return NextResponse.json({
      success: true,
      data: {
        summary,
        statusCounts,
        totalMonitored: monitoredJurisdictions.length,
        totalJurisdictions: ALL_JURISDICTIONS.length,
      },
    });
  } catch (error) {
    console.error('Error checking compliance:', error);
    return NextResponse.json(
      { error: 'Failed to check compliance' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, jurisdictionCode, data } = body;

    if (!jurisdictionCode) {
      return NextResponse.json(
        { error: 'Jurisdiction code is required' },
        { status: 400 }
      );
    }

    const jurisdiction = getJurisdictionByCode(jurisdictionCode);
    if (!jurisdiction) {
      return NextResponse.json(
        { error: 'Jurisdiction not found', code: jurisdictionCode },
        { status: 404 }
      );
    }

    // Update capital adequacy metrics
    if (action === 'update-capital') {
      ComplianceMonitor.updateCapitalMetrics({
        jurisdictionCode,
        ...data,
      });

      const status = ComplianceMonitor.getComplianceStatus(jurisdictionCode);
      
      return NextResponse.json({
        success: true,
        message: 'Capital metrics updated',
        data: status.areas.capitalAdequacy,
      });
    }

    // Update investment metrics
    if (action === 'update-investments') {
      ComplianceMonitor.updateInvestmentMetrics({
        jurisdictionCode,
        ...data,
      });

      const status = ComplianceMonitor.getComplianceStatus(jurisdictionCode);
      
      return NextResponse.json({
        success: true,
        message: 'Investment metrics updated',
        data: status.areas.investmentLimits,
      });
    }

    // Update governance status
    if (action === 'update-governance') {
      ComplianceMonitor.updateGovernanceStatus({
        jurisdictionCode,
        ...data,
      });

      const status = ComplianceMonitor.getComplianceStatus(jurisdictionCode);
      
      return NextResponse.json({
        success: true,
        message: 'Governance status updated',
        data: status.areas.governance,
      });
    }

    // Acknowledge alert
    if (action === 'acknowledge-alert') {
      const { alertId, acknowledgedBy } = data;
      
      ComplianceMonitor.acknowledgeAlert(alertId, acknowledgedBy || 'system');
      
      return NextResponse.json({
        success: true,
        message: 'Alert acknowledged',
      });
    }

    // Create custom alert
    if (action === 'create-alert') {
      const alert = ComplianceMonitor.createAlert({
        type: data.type,
        severity: data.severity,
        title: data.title,
        message: data.message,
        jurisdictionCode,
        actionRequired: data.actionRequired,
      });
      
      return NextResponse.json({
        success: true,
        data: alert,
        message: 'Alert created',
      });
    }

    // Mark filing submitted
    if (action === 'filing-submitted') {
      const { filingId, submittedBy } = data;
      
      ComplianceMonitor.markFilingSubmitted(jurisdictionCode, filingId, submittedBy || 'system');
      
      return NextResponse.json({
        success: true,
        message: 'Filing marked as submitted',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing compliance update:', error);
    return NextResponse.json(
      { error: 'Failed to process compliance update' },
      { status: 500 }
    );
  }
}
