#!/usr/bin/env tsx
import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import { Client } from 'pg';

function expandRanges(spec: string): number[] {
  const parts = spec.split(',').map(s => s.trim()).filter(Boolean);
  const ids: number[] = [];
  for (const p of parts) {
    if (p.includes('-')) {
      const [a, b] = p.split('-').map(n => parseInt(n, 10));
      if (!isNaN(a) && !isNaN(b)) {
        const start = Math.min(a, b);
        const end = Math.max(a, b);
        for (let i = start; i <= end; i++) ids.push(i);
      }
    } else {
      const n = parseInt(p, 10);
      if (!isNaN(n)) ids.push(n);
    }
  }
  return Array.from(new Set(ids)).sort((a, b) => a - b);
}

async function main() {
  const dbUrl = process.env.SESSION_DATABASE_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL (or SESSION_DATABASE_URL) not set');
    process.exit(1);
  }

  const idsSpec = process.env.USER_IDS || '2-11,17-28,31-32';
  const userIds = expandRanges(idsSpec);
  if (userIds.length === 0) {
    console.error('No user IDs to process');
    process.exit(1);
  }
  console.log('Processing user IDs:', userIds.join(','));

  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  const tablesByUserId = [
    'reflection_responses',
    'user_assessments',
    'growth_plans',
    'final_reflections',
    'user_discernment_progress',
    'workshop_step_data',
    'holistic_reports',
    'star_cards',
    'flow_attributes',
    'user_profiles_extended',
    'coaching_sessions',
    'connection_suggestions',
  ];

  // Backup
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'server', 'backups');
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `users-backup-${timestamp}.json`);

  const backup: Record<string, unknown> = { meta: { createdAt: new Date().toISOString(), userIds } } as any;
  try {
    // Users table
    const usersRes = await client.query('SELECT * FROM users WHERE id = ANY($1::int[]) ORDER BY id', [userIds]);
    (backup as any).users = usersRes.rows;

    for (const tbl of tablesByUserId) {
      const res = await client.query(`SELECT * FROM ${tbl} WHERE user_id = ANY($1::int[])`, [userIds]);
      (backup as any)[tbl] = res.rows;
    }

    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
    console.log('Backup written to', backupPath);
  } catch (err) {
    console.error('Backup failed:', err);
    await client.end();
    process.exit(1);
  }

  // Delete in a transaction (children first, then users)
  try {
    await client.query('BEGIN');
    for (const tbl of tablesByUserId) {
      const del = await client.query(`DELETE FROM ${tbl} WHERE user_id = ANY($1::int[])`, [userIds]);
      console.log(`Deleted ${del.rowCount} from ${tbl}`);
    }
    const delUsers = await client.query('DELETE FROM users WHERE id = ANY($1::int[])', [userIds]);
    console.log(`Deleted ${delUsers.rowCount} from users`);
    await client.query('COMMIT');
    console.log('Deletion committed.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Deletion failed, rolled back:', err);
    console.error('Backup file is available at', backupPath);
    await client.end();
    process.exit(1);
  }

  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

