import type {VercelRequest, VercelResponse} from '@vercel/node';
import app from '../src/app';

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === 'string') {
        headers[key] = value;
      }
    }

    const host = req.headers.host || 'localhost:3001';
    const url = req.url || '/';
    const method = req.method || 'GET';

    const response = await app.fetch(
      new Request(`http://${host}${url}`, {
        method: method,
        headers: new Headers(headers),
        body: ['GET', 'HEAD'].includes(method) ? undefined : JSON.stringify(req.body),
      })
    );

    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    const body = await response.text();
    res.send(body);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({error: 'Internal server error'});
  }
};
