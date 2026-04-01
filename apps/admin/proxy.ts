import {auth} from '@/lib/auth';
import type {NextRequest} from 'next/server';

export async function proxy(request: NextRequest) {
  const session = await auth();

  if (!session) {
    const loginUrl = new URL('/login', request.url);
    return Response.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    '/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
