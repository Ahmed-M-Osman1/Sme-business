import {auth} from '@/lib/auth';

export async function AdminHeader() {
  const session = await auth();

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold text-gray-900">Admin Portal</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{session?.user?.email}</span>
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
