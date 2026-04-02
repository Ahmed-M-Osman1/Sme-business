import {auth} from '@/lib/auth';
import {HeaderContent} from './header-content';

export async function AdminHeader() {
  const session = await auth();
  const apiToken =
    (session?.user as unknown as {apiToken?: string} | undefined)?.apiToken ??
    session?.user?.email ??
    '';

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6">
      <HeaderContent session={session} token={apiToken} />
    </header>
  );
}
