import {auth} from '@/lib/auth';
import {adminApi} from '@/lib/api-client';
import {AiBadge} from '@/components/shared/ai-badge';
import {RenewalPipeline} from '@/components/renewals/renewal-pipeline';
import {resolvePlaybook} from '@shory/api/rules/playbooks';
import en from '@/lib/i18n/en.json';

export default async function RenewalsPage() {
  const session = await auth();
  const token = session?.user?.email ?? '';

  let customers: Awaited<ReturnType<typeof adminApi.customers.list>>['data'] = [];
  try {
    const res = await adminApi.customers.list(token, {pageSize: 200});
    customers = res.data;
  } catch {
    // API might not be running
  }

  // Filter to renewal window: -30 to 60 days
  const renewalCustomers = customers
    .filter((c) => c.renewalDays >= -30 && c.renewalDays <= 60)
    .sort((a, b) => {
      const urgencyA = a.churnScore + Number(a.premium) / 1000;
      const urgencyB = b.churnScore + Number(b.premium) / 1000;
      return urgencyB - urgencyA;
    })
    .map((customer) => ({
      customer,
      playbook: resolvePlaybook(customer),
    }));

  return (
    <div>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {en.renewals.pipeline}
          </h2>
          <p className="text-sm text-gray-500">
            {en.renewals.sortedByUrgency}
          </p>
        </div>
        <AiBadge label={en.renewals.sequencesRunning} />
      </div>
      <RenewalPipeline items={renewalCustomers} token={token} />
    </div>
  );
}
