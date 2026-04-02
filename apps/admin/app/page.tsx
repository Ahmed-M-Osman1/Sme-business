import {auth} from '@/lib/auth';
import {adminApi} from '@/lib/api-client';
import {DashboardView} from '@/components/dashboard/dashboard-view';
import type {PortfolioAlert, Customer, Incident, ApiService} from '@shory/db';

export default async function DashboardPage() {
  const session = await auth();
  const token = session?.user?.email ?? '';

  let stats = {totalQuotes: 0, quotesThisWeek: 0, acceptedQuotes: 0, pendingQuotes: 0};
  let alerts: PortfolioAlert[] = [];
  let customers: Customer[] = [];
  let incidents: Incident[] = [];
  let services: ApiService[] = [];

  try {
    const [statsData, alertsRes, customersRes, incidentsRes, servicesRes] = await Promise.all([
      adminApi.stats(token).catch(() => stats),
      adminApi.alerts.list(token).catch(() => ({data: [] as PortfolioAlert[]})),
      adminApi.customers.list(token, {pageSize: 50}).catch(() => ({data: [] as Customer[]})),
      adminApi.incidents.list(token).catch(() => ({data: [] as Incident[]})),
      adminApi.platform.services(token).catch(() => ({data: [] as ApiService[]})),
    ]);

    stats = statsData;
    alerts = (alertsRes as {data: PortfolioAlert[]}).data ?? [];
    customers = (customersRes as {data: Customer[]}).data ?? [];
    incidents = (incidentsRes as {data: Incident[]}).data ?? [];
    services = (servicesRes as {data: ApiService[]}).data ?? [];
  } catch {
    // API might not be running — show defaults
  }

  // Sort customers by churn score descending for "needing attention"
  const attentionCustomers = [...customers]
    .sort((a, b) => b.churnScore - a.churnScore)
    .filter((c) => c.churnScore > 0);

  return (
    <DashboardView
      stats={stats}
      alerts={alerts}
      attentionCustomers={attentionCustomers}
      incidents={incidents}
      services={services}
    />
  );
}
