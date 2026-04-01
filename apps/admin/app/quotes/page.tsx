import {auth} from '@/lib/auth';
import {adminApi} from '@/lib/api-client';
import type {Quote} from '@shory/db';
import {QuotesTable} from '@/components/quotes/quotes-table';

interface QuotesPageProps {
  searchParams: Promise<{page?: string; status?: string}>;
}

export default async function QuotesPage({searchParams}: QuotesPageProps) {
  const params = await searchParams;
  const session = await auth();
  const token = session?.user?.email ?? '';
  const page = Number(params.page ?? '1');

  let quotes: Quote[] = [];
  let total = 0;
  let pageSize = 20;

  try {
    const result = await adminApi.quotes.list(token, {page, status: params.status});
    quotes = result.data;
    total = result.total;
    pageSize = result.pageSize;
  } catch {
    // API might not be running
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Quotes</h2>
      <QuotesTable quotes={quotes} />
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2 text-sm">
          <span className="text-gray-500">
            Page {page} of {totalPages} ({total} total)
          </span>
        </div>
      )}
    </div>
  );
}
