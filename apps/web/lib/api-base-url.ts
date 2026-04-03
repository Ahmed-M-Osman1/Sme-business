const PRODUCTION_API_URL = 'https://sme-business-backend.vercel.app';

function normalizeUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

export function getWebApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return normalizeUrl(process.env.NEXT_PUBLIC_API_URL);
  }

  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3002';
  }

  return PRODUCTION_API_URL;
}
