import {auth} from '@/lib/auth';
import {adminApi} from '@/lib/api-client';
import {Card, CardContent, CardHeader, CardTitle} from '@shory/ui';
import {StatusBadge} from '@/components/quotes/status-badge';
import {StatusActions} from '@/components/quotes/status-actions';
import type {Quote} from '@shory/db';

interface QuoteDetailPageProps {
  params: Promise<{id: string}>;
}

export default async function QuoteDetailPage({params}: QuoteDetailPageProps) {
  const {id} = await params;
  const session = await auth();
  const token = session?.user?.email ?? '';

  let quote: Quote | null = null;

  try {
    const result = await adminApi.quotes.list(token, {pageSize: 100});
    quote = result.data.find((q) => q.id === id) ?? null;
  } catch {
    // API error
  }

  if (!quote) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-slate-400">
        Quote not found or could not be loaded.
      </div>
    );
  }

  const fields = [
    {label: 'Business Name', value: quote.businessName},
    {label: 'Industry', value: quote.industry},
    {label: 'Business Type', value: quote.businessType ?? '—'},
    {label: 'Emirate', value: quote.emirate},
    {label: 'Employees', value: quote.employeesCount},
    {label: 'Coverage', value: quote.coverageType},
    {label: 'Trade License', value: quote.tradeLicense ?? '—'},
    {label: 'Created', value: new Date(quote.createdAt).toLocaleString('en-AE')},
  ];

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{quote.businessName}</h2>
          <div className="mt-1">
            <StatusBadge status={quote.status} />
          </div>
        </div>
        <StatusActions quoteId={id} currentStatus={quote.status} token={token} />
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Quote Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            {fields.map((f) => (
              <div key={f.label}>
                <dt className="text-sm font-medium text-gray-500">{f.label}</dt>
                <dd className="mt-1 text-sm text-gray-900">{f.value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
