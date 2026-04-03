import type {
  Incident,
  Customer,
  ExternalSignal,
  ApiService,
  MidtermTrigger,
  NewPortfolioAlert,
} from '@shory/db';

export function generateAlerts(
  incidents: Incident[],
  customers: Customer[],
  signals: ExternalSignal[],
  services: ApiService[],
  triggers: MidtermTrigger[],
): NewPortfolioAlert[] {
  const alerts: NewPortfolioAlert[] = [];
  const now = new Date();
  const timeLabel = now.toLocaleString('en-AE', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Active incidents with severity >= high
  for (const incident of incidents) {
    if (
      incident.status === 'active' &&
      (incident.severity === 'high' || incident.severity === 'critical')
    ) {
      alerts.push({
        severity: incident.severity,
        icon: '🔴',
        title: `Incident: ${incident.serviceName}`,
        body: incident.description,
        timeLabel,
        isPlatform: true,
        isProactive: false,
        isRead: false,
      });
    }
  }

  // High churn customers near expiry
  for (const customer of customers) {
    if (customer.churnScore >= 60 && customer.renewalDays <= 7) {
      alerts.push({
        severity: 'high',
        icon: '⚠️',
        title: `Churn risk: ${customer.company}`,
        body: `${customer.name} has churn score ${customer.churnScore} and renews in ${customer.renewalDays} day(s). Immediate intervention recommended.`,
        timeLabel,
        customerId: customer.id,
        isPlatform: false,
        isProactive: true,
        isRead: false,
      });
    }
  }

  // Lapsed customers
  for (const customer of customers) {
    if (customer.stage === 'lapsed') {
      alerts.push({
        severity: 'medium',
        icon: '📋',
        title: `Lapsed: ${customer.company}`,
        body: `${customer.name} at ${customer.company} has lapsed for ${Math.abs(customer.renewalDays)} days. Manual outreach may be required.`,
        timeLabel,
        customerId: customer.id,
        isPlatform: false,
        isProactive: true,
        isRead: false,
      });
    }
  }

  // External signals with urgency >= medium
  for (const signal of signals) {
    if (signal.urgency === 'medium' || signal.urgency === 'high') {
      alerts.push({
        severity: signal.urgency === 'high' ? 'high' : 'medium',
        icon: signal.icon,
        title: signal.title,
        body: signal.detail,
        timeLabel,
        signalId: signal.id,
        isPlatform: false,
        isProactive: true,
        isRead: false,
      });
    }
  }

  // Degraded services
  for (const service of services) {
    if (service.status === 'degraded' || service.status === 'down') {
      const severity = service.status === 'down' ? 'critical' : 'medium';
      alerts.push({
        severity,
        icon: service.status === 'down' ? '🔴' : '🟡',
        title: `${service.name} ${service.status}`,
        body: `${service.name} is ${service.status}. Error rate: ${Number(service.errorRate).toFixed(1)}%, latency: ${service.latency}ms.`,
        timeLabel,
        isPlatform: true,
        isProactive: false,
        isRead: false,
      });
    }
  }

  // Pending midterm triggers
  for (const trigger of triggers) {
    if (trigger.status === 'pending_send') {
      alerts.push({
        severity: 'low',
        icon: trigger.icon,
        title: trigger.title,
        body: trigger.detail,
        timeLabel,
        customerId: trigger.customerId,
        isPlatform: false,
        isProactive: true,
        isRead: false,
      });
    }
  }

  return alerts;
}
