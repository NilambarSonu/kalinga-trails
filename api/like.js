// api/like.js — Vercel Serverless Function
// Neon PostgreSQL like system for Kalinga Trails
// Table: kalinga_trails (PostgreSQL lowercases unquoted identifiers)

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;

// CORS helper
function setCORS(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  setCORS(res);

  // Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!DATABASE_URL) {
    return res.status(500).json({ error: 'DATABASE_URL not configured' });
  }

  const sql = neon(DATABASE_URL);

  try {
    // ── GET: return total like count ──────────────────────────────────────
    if (req.method === 'GET') {
      // NOTE: no quotes → PostgreSQL uses lowercase "kalinga_trails"
      const rows = await sql`SELECT COUNT(*) AS total FROM kalinga_trails`;
      const total = parseInt(rows[0].total, 10);
      return res.status(200).json({ likes: total, success: true });
    }

    // ── POST: record a like (fingerprint-dedup) ───────────────────────────
    if (req.method === 'POST') {
      const { fingerprint } = req.body || {};

      if (!fingerprint || typeof fingerprint !== 'string' || fingerprint.length < 8) {
        return res.status(400).json({ error: 'Valid fingerprint required', success: false });
      }

      // Attempt insert; UNIQUE constraint on fingerprint will reject duplicates
      try {
        await sql`
          INSERT INTO kalinga_trails (fingerprint)
          VALUES (${fingerprint})
        `;

        // Return updated count
        const rows = await sql`SELECT COUNT(*) AS total FROM kalinga_trails`;
        const total = parseInt(rows[0].total, 10);
        return res.status(200).json({ likes: total, success: true, alreadyLiked: false });

      } catch (insertErr) {
        // Postgres error code 23505 = unique_violation (duplicate fingerprint)
        if (insertErr.code === '23505') {
          const rows = await sql`SELECT COUNT(*) AS total FROM kalinga_trails`;
          const total = parseInt(rows[0].total, 10);
          return res.status(200).json({ likes: total, success: false, alreadyLiked: true });
        }
        throw insertErr; // re-throw unexpected errors
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error('[like API] Error:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
