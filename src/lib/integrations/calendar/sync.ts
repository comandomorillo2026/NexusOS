/**
 * Calendar Sync Integrations for NexusOS
 * Google Calendar and Microsoft Outlook integrations
 */

import { db } from '@/lib/db';

// Calendar Provider Types
export type CalendarProvider = 'google' | 'outlook' | 'apple' | 'caldav';

// Calendar Event
export interface CalendarEventInput {
  id?: string;
  title: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
  isAllDay?: boolean;
  timezone?: string;
  attendees?: { email: string; name?: string }[];
  reminders?: { minutes: number; method: 'email' | 'popup' }[];
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    until?: Date;
    count?: number;
  };
  colorId?: string;
  status?: 'confirmed' | 'tentative' | 'cancelled';
  visibility?: 'public' | 'private' | 'confidential';
}

// Calendar Event Response
export interface CalendarEventResponse {
  success: boolean;
  eventId?: string;
  htmlLink?: string;
  error?: string;
}

// Google Calendar Client
class GoogleCalendarClient {
  private accessToken: string;
  private refreshToken: string;
  private clientId: string;
  private clientSecret: string;

  constructor(credentials: {
    accessToken: string;
    refreshToken: string;
    clientId: string;
    clientSecret: string;
  }) {
    this.accessToken = credentials.accessToken;
    this.refreshToken = credentials.refreshToken;
    this.clientId = credentials.clientId;
    this.clientSecret = credentials.clientSecret;
  }

  private async refreshAccessToken(): Promise<string> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: this.refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error_description || data.error);
    return data.access_token;
  }

  private async ensureValidToken(): Promise<string> {
    // Try current token, refresh if needed
    return this.accessToken;
  }

  async createEvent(calendarId: string, event: CalendarEventInput): Promise<CalendarEventResponse> {
    const accessToken = await this.ensureValidToken();

    const body = {
      summary: event.title,
      description: event.description,
      location: event.location,
      start: {
        dateTime: event.start.toISOString(),
        timeZone: event.timezone || 'America/Port_of_Spain',
      },
      end: {
        dateTime: event.end.toISOString(),
        timeZone: event.timezone || 'America/Port_of_Spain',
      },
      attendees: event.attendees?.map((a) => ({ email: a.email, displayName: a.name })),
      reminders: {
        useDefault: false,
        overrides: event.reminders?.map((r) => ({
          method: r.method,
          minutes: r.minutes,
        })),
      },
      recurrence: event.recurrence
        ? [`RRULE:FREQ=${event.recurrence.frequency.toUpperCase()};INTERVAL=${event.recurrence.interval}` +
          (event.recurrence.until ? `;UNTIL=${event.recurrence.until.toISOString().replace(/[-:]/g, '').split('.')[0]}Z` : '') +
          (event.recurrence.count ? `;COUNT=${event.recurrence.count}` : '')]
        : undefined,
      status: event.status || 'confirmed',
      visibility: event.visibility || 'private',
    };

    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId || 'primary'}/events`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error?.message || `HTTP ${response.status}` };
      }

      return {
        success: true,
        eventId: data.id,
        htmlLink: data.htmlLink,
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async updateEvent(calendarId: string, eventId: string, event: CalendarEventInput): Promise<CalendarEventResponse> {
    const accessToken = await this.ensureValidToken();

    const body = {
      summary: event.title,
      description: event.description,
      location: event.location,
      start: {
        dateTime: event.start.toISOString(),
        timeZone: event.timezone || 'America/Port_of_Spain',
      },
      end: {
        dateTime: event.end.toISOString(),
        timeZone: event.timezone || 'America/Port_of_Spain',
      },
      status: event.status,
    };

    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId || 'primary'}/events/${eventId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error?.message || `HTTP ${response.status}` };
      }

      return { success: true, eventId: data.id, htmlLink: data.htmlLink };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async deleteEvent(calendarId: string, eventId: string): Promise<{ success: boolean; error?: string }> {
    const accessToken = await this.ensureValidToken();

    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId || 'primary'}/events/${eventId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      return { success: response.ok };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async listEvents(calendarId: string, timeMin: Date, timeMax: Date): Promise<CalendarEventInput[]> {
    const accessToken = await this.ensureValidToken();

    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId || 'primary'}/events?` +
          new URLSearchParams({
            timeMin: timeMin.toISOString(),
            timeMax: timeMax.toISOString(),
            singleEvents: 'true',
            orderBy: 'startTime',
          }),
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const data = await response.json();

      return (data.items || []).map((item: any) => ({
        id: item.id,
        title: item.summary,
        description: item.description,
        location: item.location,
        start: new Date(item.start.dateTime || item.start.date),
        end: new Date(item.end.dateTime || item.end.date),
        isAllDay: !!item.start.date,
        status: item.status,
      }));
    } catch {
      return [];
    }
  }
}

// Microsoft Outlook Calendar Client
class OutlookCalendarClient {
  private accessToken: string;
  private refreshToken: string;
  private clientId: string;
  private clientSecret: string;
  private tenantId?: string;

  constructor(credentials: {
    accessToken: string;
    refreshToken: string;
    clientId: string;
    clientSecret: string;
    tenantId?: string;
  }) {
    this.accessToken = credentials.accessToken;
    this.refreshToken = credentials.refreshToken;
    this.clientId = credentials.clientId;
    this.clientSecret = credentials.clientSecret;
    this.tenantId = credentials.tenantId;
  }

  private async refreshAccessToken(): Promise<string> {
    const tokenUrl = this.tenantId
      ? `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`
      : 'https://login.microsoftonline.com/common/oauth2/v2.0/token';

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: this.refreshToken,
        grant_type: 'refresh_token',
        scope: 'https://graph.microsoft.com/.default',
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error_description || data.error);
    return data.access_token;
  }

  private async ensureValidToken(): Promise<string> {
    return this.accessToken;
  }

  async createEvent(calendarId: string, event: CalendarEventInput): Promise<CalendarEventResponse> {
    const accessToken = await this.ensureValidToken();

    const body = {
      subject: event.title,
      body: {
        contentType: 'html',
        content: event.description,
      },
      location: event.location ? { displayName: event.location } : undefined,
      start: {
        dateTime: event.start.toISOString(),
        timeZone: event.timezone || 'America/Port_of_Spain',
      },
      end: {
        dateTime: event.end.toISOString(),
        timeZone: event.timezone || 'America/Port_of_Spain',
      },
      isAllDay: event.isAllDay,
      attendees: event.attendees?.map((a) => ({
        emailAddress: { address: a.email, name: a.name },
      })),
      isReminderOn: !!event.reminders?.length,
      reminderMinutesBeforeStart: event.reminders?.[0]?.minutes,
    };

    try {
      const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/calendar${calendarId !== 'primary' ? `s/${calendarId}` : ''}/events`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error?.message || `HTTP ${response.status}` };
      }

      return {
        success: true,
        eventId: data.id,
        htmlLink: data.webLink,
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async updateEvent(calendarId: string, eventId: string, event: CalendarEventInput): Promise<CalendarEventResponse> {
    const accessToken = await this.ensureValidToken();

    const body = {
      subject: event.title,
      body: { contentType: 'html', content: event.description },
      location: event.location ? { displayName: event.location } : undefined,
      start: {
        dateTime: event.start.toISOString(),
        timeZone: event.timezone || 'America/Port_of_Spain',
      },
      end: {
        dateTime: event.end.toISOString(),
        timeZone: event.timezone || 'America/Port_of_Spain',
      },
    };

    try {
      const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/calendar${calendarId !== 'primary' ? `s/${calendarId}` : ''}/events/${eventId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error?.message || `HTTP ${response.status}` };
      }

      return { success: true, eventId: data.id, htmlLink: data.webLink };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async deleteEvent(calendarId: string, eventId: string): Promise<{ success: boolean; error?: string }> {
    const accessToken = await this.ensureValidToken();

    try {
      const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/calendar${calendarId !== 'primary' ? `s/${calendarId}` : ''}/events/${eventId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      return { success: response.ok };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

/**
 * Calendar Integration Manager
 */
export class CalendarIntegration {
  private tenantId: string;
  private provider: CalendarProvider;
  private client: GoogleCalendarClient | OutlookCalendarClient | null = null;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
    this.provider = 'google';
  }

  async initialize(): Promise<boolean> {
    try {
      const config = await db.calendarIntegration.findFirst({
        where: { tenantId: this.tenantId, status: 'active' },
      });

      if (!config) return false;

      this.provider = config.provider as CalendarProvider;
      const credentials = JSON.parse(config.credentials);

      switch (this.provider) {
        case 'google':
          this.client = new GoogleCalendarClient(credentials);
          break;
        case 'outlook':
          this.client = new OutlookCalendarClient(credentials);
          break;
        default:
          return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  async createEvent(event: CalendarEventInput): Promise<CalendarEventResponse> {
    if (!this.client) {
      const initialized = await this.initialize();
      if (!initialized) {
        return { success: false, error: 'Calendar integration not configured' };
      }
    }

    const config = await db.calendarIntegration.findFirst({
      where: { tenantId: this.tenantId, status: 'active' },
    });

    return this.client!.createEvent(config?.calendarId || 'primary', event);
  }

  async updateEvent(eventId: string, event: CalendarEventInput): Promise<CalendarEventResponse> {
    if (!this.client) {
      await this.initialize();
    }

    const config = await db.calendarIntegration.findFirst({
      where: { tenantId: this.tenantId, status: 'active' },
    });

    return this.client!.updateEvent(config?.calendarId || 'primary', eventId, event);
  }

  async deleteEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
    if (!this.client) {
      await this.initialize();
    }

    const config = await db.calendarIntegration.findFirst({
      where: { tenantId: this.tenantId, status: 'active' },
    });

    return this.client!.deleteEvent(config?.calendarId || 'primary', eventId);
  }

  /**
   * Sync appointments to calendar
   */
  async syncAppointment(
    appointment: {
      id: string;
      patientName: string;
      providerName?: string;
      date: string;
      startTime: string;
      endTime: string;
      location?: string;
      notes?: string;
    },
    externalEventId?: string
  ): Promise<CalendarEventResponse> {
    const start = new Date(`${appointment.date}T${appointment.startTime}`);
    const end = new Date(`${appointment.date}T${appointment.endTime}`);

    const event: CalendarEventInput = {
      title: `Appointment: ${appointment.patientName}${appointment.providerName ? ` with ${appointment.providerName}` : ''}`,
      description: appointment.notes,
      location: appointment.location,
      start,
      end,
      reminders: [
        { minutes: 60, method: 'popup' },
        { minutes: 1440, method: 'email' }, // 1 day before
      ],
    };

    if (externalEventId) {
      return this.updateEvent(externalEventId, event);
    }

    return this.createEvent(event);
  }
}

export default CalendarIntegration;
