import {auth} from '@/lib/auth';
import {adminApi} from '@/lib/api-client';
import {ClaimsList} from '@/components/claims/claims-list';
import en from '@/lib/i18n/en.json';

export default async function ClaimsPage() {
  const session = await auth();
  const token = session?.user?.email ?? '';

  let customers: Awaited<ReturnType<typeof adminApi.customers.list>>['data'] = [];
  try {
    const res = await adminApi.customers.list(token, {pageSize: 200});
    customers = res.data.filter((c) => c.claimsOpen > 0);
  } catch {
    // API might not be running
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{en.claims.title}</h2>
        <p className="text-sm text-gray-500">
          {en.claims.openClaims} ({customers.length})
        </p>
      </div>
      <ClaimsList customers={customers} />
    </div>
  );
}
