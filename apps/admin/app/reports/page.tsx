import {auth} from '@/lib/auth';
import {ReportGrid} from '@/components/reports/report-grid';
import en from '@/lib/i18n/en.json';

export default async function ReportsPage() {
  const session = await auth();
  const token = session?.user?.email ?? '';

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{en.reports.title}</h2>
      </div>
      <ReportGrid token={token} />
    </div>
  );
}
