import Link from 'next/link';
import type {Quote} from '@shory/db';
import {StatusBadge} from './status-badge';

interface QuotesTableProps {
  quotes: Quote[];
}

export function QuotesTable({quotes}: QuotesTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Business</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Industry</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Emirate</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Employees</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {quotes.map((quote) => (
            <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <Link
                  href={`/quotes/${quote.id}`}
                  className="text-[#1D68FF] hover:underline font-medium"
                >
                  {quote.businessName}
                </Link>
              </td>
              <td className="px-4 py-3 text-gray-600">{quote.industry}</td>
              <td className="px-4 py-3 text-gray-600">{quote.emirate}</td>
              <td className="px-4 py-3 text-gray-600">{quote.employeesCount}</td>
              <td className="px-4 py-3">
                <StatusBadge status={quote.status} />
              </td>
              <td className="px-4 py-3 text-gray-500">
                {new Date(quote.createdAt).toLocaleDateString('en-AE')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
