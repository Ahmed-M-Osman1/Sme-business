import {auth} from '@/lib/auth';
import {adminApi} from '@/lib/api-client';
import type {Customer} from '@shory/db';
import {CustomersView} from '@/components/customers/customers-view';

interface CustomersPageProps {
  searchParams: Promise<{id?: string}>;
}

export default async function CustomersPage({searchParams}: CustomersPageProps) {
  const params = await searchParams;
  const session = await auth();
  const token = session?.user?.email ?? '';

  let customers: Customer[] = [];

  try {
    const result = await adminApi.customers.list(token, {pageSize: 100});
    customers = result.data;
  } catch {
    // API might not be running
  }

  const selectedId = params.id ?? customers[0]?.id ?? null;

  return (
    <CustomersView
      customers={customers}
      initialSelectedId={selectedId}
      token={token}
    />
  );
}
