import {auth} from '@/lib/auth';
import {adminApi} from '@/lib/api-client';
import {ClaimsList} from '@/components/claims/claims-list';
import en from '@/lib/i18n/en.json';
import type {Claim} from '@shory/db';

type ClaimWithCustomer = Claim & {customerName: string; customerCompany: string; customerChurnScore: number; customerRenewalDays: number};

export default async function ClaimsPage() {
  const session = await auth();
  const token = session?.user?.email ?? '';

  let claims: ClaimWithCustomer[] = [];
  try {
    const res = await adminApi.claims.list(token);
    claims = res.data;
  } catch {
    // API might not be running
  }

  const openClaims = claims.filter((c) => c.status === 'open' || c.status === 'under_review');

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{en.claims.title}</h2>
        <p className="text-sm text-gray-500">
          {en.claims.openClaims} ({openClaims.length}) &middot; {claims.length} total
        </p>
      </div>
      <ClaimsList claims={claims} />
    </div>
  );
}
