/**
 * Runner for the email template + variable seeds.
 *
 *   npm run seed:email
 *
 * Idempotent: templates are matched by name and variables upsert on variable_key,
 * so re-running only fills in what's missing.
 */
import 'dotenv/config';
import { seedEmailTemplates, seedTemplateVariables } from './email-templates-seed.js';

async function main() {
  await seedTemplateVariables();
  await seedEmailTemplates();
  console.log('[email-seed] Done.');
  process.exit(0);
}

main().catch((err) => {
  console.error('[email-seed] Failed:', err);
  process.exit(1);
});
