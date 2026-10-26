import { put, list } from '@vercel/blob';

const PATH = 'progress/state.json';
const ALLOWED = ['arch.quiz', 'arch.drill', 'arch.last', 'arch.theme'];
const MAX_BYTES = 200 * 1024;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') {
      const { blobs } = await list({ prefix: PATH, limit: 1 });
      if (!blobs.length) return res.status(200).json({ ts: 0, data: {} });
      const r = await fetch(blobs[0].url + '?t=' + Date.now(), { cache: 'no-store' });
      if (!r.ok) return res.status(502).json({ error: 'read' });
      return res.status(200).json(await r.json());
    }
    if (req.method === 'PUT') {
      let body = req.body;
      if (typeof body === 'string') body = JSON.parse(body);
      if (!body || typeof body !== 'object' || typeof body.ts !== 'number' || !body.data || typeof body.data !== 'object') {
        return res.status(400).json({ error: 'bad body' });
      }
      const data = {};
      for (const k of ALLOWED) if (k in body.data) data[k] = body.data[k];
      const doc = JSON.stringify({ ts: Math.min(body.ts, Date.now() + 60000), data });
      if (Buffer.byteLength(doc) > MAX_BYTES) return res.status(413).json({ error: 'too large' });
      await put(PATH, doc, {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
        cacheControlMaxAge: 0,
      });
      return res.status(200).json({ ok: true });
    }
    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ error: 'method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: 'storage' });
  }
}
