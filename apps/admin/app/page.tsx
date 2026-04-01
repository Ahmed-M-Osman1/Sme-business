import {auth} from '@/lib/auth';
import {adminApi} from '@/lib/api-client';
import {Card, CardContent, CardHeader, CardTitle} from '@shory/ui';

export default async function DashboardPage() {
  const session = await auth();
  const token = session?.user?.email ?? '';

  let stats = {totalQuotes: 0, quotesThisWeek: 0, acceptedQuotes: 0, pendingQuotes: 0};
  try {
    stats = await adminApi.stats(token);
  } catch {
    // API might not be running — show zeros
  }

  const cards = [
    {title: 'Total Quotes', value: stats.totalQuotes},
    {title: 'This Week', value: stats.quotesThisWeek},
    {title: 'Accepted', value: stats.acceptedQuotes},
    {title: 'Pending Review', value: stats.pendingQuotes},
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.title} className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
