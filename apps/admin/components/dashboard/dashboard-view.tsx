'use client';

import type {PortfolioAlert, Customer, Incident, ApiService} from '@shory/db';
import {Card, CardContent, CardHeader, CardTitle, Badge} from '@shory/ui';
import {useI18n} from '@/lib/i18n';
import {KpiCard} from '@/components/shared/kpi-card';
import {RiskBar} from '@/components/shared/risk-bar';
import Link from 'next/link';

interface DashboardStats {
  totalQuotes: number;
  quotesThisWeek: number;
  acceptedQuotes: number;
  pendingQuotes: number;
}

interface DashboardViewProps {
  stats: DashboardStats;
  alerts: PortfolioAlert[];
  attentionCustomers: Customer[];
  incidents: Incident[];
  services: ApiService[];
}

export function DashboardView({stats, alerts, attentionCustomers, incidents, services}: DashboardViewProps) {
  const {t} = useI18n();

  const activeIncidents = incidents.filter((i) => i.status === 'active');
  const degradedServices = services.filter((s) => s.status === 'degraded' || s.status === 'down');
  const topAlerts = alerts.slice(0, 5);
  const topCustomers = attentionCustomers.slice(0, 3);

  const severityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-amber-600';
      default: return 'text-blue-600';
    }
  };

  const severityBadgeVariant = (severity: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const serviceStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-emerald-500';
      case 'degraded': return 'bg-amber-500';
      case 'down': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const serviceStatusLabel = (status: string) => {
    switch (status) {
      case 'operational': return t.common.operational;
      case 'degraded': return t.common.degraded;
      case 'down': return t.common.down;
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{t.dashboard.title}</h2>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
        <KpiCard label={t.dashboard.totalQuotes} value={stats.totalQuotes} icon="📋" />
        <KpiCard label={t.dashboard.thisWeek} value={stats.quotesThisWeek} icon="📅" />
        <KpiCard label={t.dashboard.accepted} value={stats.acceptedQuotes} color="text-emerald-600" icon="✅" />
        <KpiCard label={t.dashboard.pendingReview} value={stats.pendingQuotes} color="text-amber-600" icon="⏳" />
        <KpiCard label={t.dashboard.totalCustomers} value={attentionCustomers.length > 0 ? attentionCustomers.length : '-'} icon="👥" />
        <KpiCard
          label={t.dashboard.activeIncidents}
          value={activeIncidents.length}
          color={activeIncidents.length > 0 ? 'text-red-600' : 'text-emerald-600'}
          icon="⚠️"
        />
        <KpiCard
          label={t.dashboard.degradedServices}
          value={degradedServices.length}
          color={degradedServices.length > 0 ? 'text-amber-600' : 'text-emerald-600'}
          icon="🛠️"
        />
      </div>

      {/* Two column: Alerts + Customers Needing Attention */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Portfolio Alerts */}
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-700">{t.dashboard.portfolioAlerts}</CardTitle>
              <Link href="/alerts" className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
                {t.common.viewAll}
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {topAlerts.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-400">{t.dashboard.noAlerts}</p>
            ) : (
              <div className="space-y-3">
                {topAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50/50 p-3 transition-colors hover:bg-gray-50"
                  >
                    <span className="mt-0.5 text-base" aria-hidden="true">{alert.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-gray-900">{alert.title}</p>
                        <Badge variant={severityBadgeVariant(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-gray-500">{alert.body}</p>
                      <p className="mt-1 text-xs text-gray-400">{alert.timeLabel}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customers Needing Attention */}
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-700">{t.dashboard.needingAttention}</CardTitle>
              <Link href="/customers" className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
                {t.common.viewAll}
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {topCustomers.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-400">{t.dashboard.noCustomers}</p>
            ) : (
              <div className="space-y-3">
                {topCustomers.map((customer) => (
                  <Link
                    key={customer.id}
                    href={`/customers?id=${customer.id}`}
                    className="block rounded-lg border border-gray-100 bg-gray-50/50 p-3 transition-all hover:bg-gray-50 hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">{customer.name}</p>
                        <p className="text-xs text-gray-500">{customer.company}</p>
                      </div>
                      <span className={`text-xs font-semibold ${severityColor(customer.churnScore >= 70 ? 'critical' : customer.churnScore >= 40 ? 'medium' : 'low')}`}>
                        {t.dashboard.churnScore}: {customer.churnScore}%
                      </span>
                    </div>
                    <div className="mt-2">
                      <RiskBar score={customer.churnScore} />
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                      <span>{customer.category}</span>
                      <span>&middot;</span>
                      <span>{customer.emirate}</span>
                      {customer.renewalDays !== null && (
                        <>
                          <span>&middot;</span>
                          <span className={customer.renewalDays <= 7 ? 'font-medium text-red-500' : ''}>
                            {customer.renewalDays > 0
                              ? `${customer.renewalDays} ${t.customers.daysToRenewal}`
                              : `${Math.abs(customer.renewalDays)} ${t.customers.daysLapsed}`
                            }
                          </span>
                        </>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Platform Status Row */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-700">{t.dashboard.platformStatus}</CardTitle>
            <Link href="/platform" className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
              {t.header.viewPlatform}
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <span className={`inline-block h-2 w-2 rounded-full ${serviceStatusColor(service.status)}`} />
                {service.name}
                <span className="text-gray-400">
                  {serviceStatusLabel(service.status)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
