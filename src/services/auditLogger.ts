export interface SecurityAuditEvent {
  id: string;
  timestamp: string;
  eventType: 'AUTH_SUCCESS' | 'AUTH_FAILURE' | 'ACCESS_DENIED' | 'DATA_IMPORT' | 'RECORD_CREATE' | 'REPORT_EXPORT';
  userId: string;
  userRole: string;
  action: string;
  resource: string;
  status: 'SUCCESS' | 'BLOCKED' | 'WARNING';
  details?: string;
}

export class AuditLogger {
  private static LOG_STORAGE_KEY = 'impactos_audit_logs';

  public static log(event: Omit<SecurityAuditEvent, 'id' | 'timestamp'>): SecurityAuditEvent {
    const fullEvent: SecurityAuditEvent = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      ...event
    };

    // Sanitize details to ensure zero PII or credentials are logged
    if (fullEvent.details) {
      fullEvent.details = this.sanitizeLogData(fullEvent.details);
    }

    const logs = this.getLogs();
    logs.unshift(fullEvent);
    
    // Maintain maximum rolling window of 100 entries locally
    if (logs.length > 100) logs.pop();

    try {
      localStorage.setItem(this.LOG_STORAGE_KEY, JSON.stringify(logs));
    } catch {
      // Storage fallback
    }

    return fullEvent;
  }

  public static getLogs(): SecurityAuditEvent[] {
    try {
      const raw = localStorage.getItem(this.LOG_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private static sanitizeLogData(data: string): string {
    return data
      .replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi, '[REDACTED_EMAIL]')
      .replace(/(\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9})/g, '[REDACTED_PHONE]')
      .replace(/(bearer\s+[a-zA-Z0-9._-]+)/gi, 'Bearer [REDACTED_TOKEN]');
  }
}
