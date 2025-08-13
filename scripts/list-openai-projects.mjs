import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load env from common locations
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });
dotenv.config({ path: 'server/.env' });
dotenv.config({ path: 'server/.env.development' });

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('OPENAI_API_KEY not set');
  process.exit(1);
}

const ultraProject = process.env.ULTRA_TALIA_PROJECT_ID || process.env.ULTRA_PROJECT_ID || '';
const allstarProject = process.env.ALLSTAR_TALIA_PROJECT_ID || '';
const iaProject = process.env.IMAGINAL_AGILITY_PROJECT_ID || process.env.IA_PROJECT_ID || '';
const reflectionProject = process.env.REFLECTION_TALIA_PROJECT_ID || '';

async function listFor(label, client) {
  try {
    const models = await client.models.list();
    const vstores = client.beta?.vectorStores ? await client.beta.vectorStores.list() : { data: [] };
    console.log(`\n=== ${label} ===`);
    console.log(`Models visible: ${models.data.length}`);
    console.log(`Vector stores: ${vstores.data.length}`);
    for (const vs of vstores.data.slice(0, 10)) {
      console.log(` - ${vs.name || 'Unnamed'} (${vs.id}) files=${vs.file_counts?.completed || 0}`);
    }
  } catch (e) {
    console.log(`\n=== ${label} ===`);
    console.error('Error:', e?.message || e);
  }
}

const defaultClient = new OpenAI({ apiKey });
await listFor('Default project (no explicit project)', defaultClient);

if (ultraProject) {
  const ultraClient = new OpenAI({ apiKey, project: ultraProject });
  await listFor(`ULTRA project (${ultraProject})`, ultraClient);
} else {
  console.log('\nNo ULTRA_TALIA_PROJECT_ID configured.');
}

if (allstarProject) {
  const allstarClient = new OpenAI({ apiKey, project: allstarProject });
  await listFor(`AllStarTeams_Talia project (${allstarProject})`, allstarClient);
} else {
  console.log('\nNo ALLSTAR_TALIA_PROJECT_ID configured.');
}

if (iaProject) {
  const iaClient = new OpenAI({ apiKey, project: iaProject });
  await listFor(`Imaginal Agility project (${iaProject})`, iaClient);
} else {
  console.log('\nNo IMAGINAL_AGILITY_PROJECT_ID configured.');
}

if (reflectionProject) {
  const reflectionClient = new OpenAI({ apiKey, project: reflectionProject });
  await listFor(`Reflection Assistant Talia project (${reflectionProject})`, reflectionClient);
} else {
  console.log('\nNo REFLECTION_TALIA_PROJECT_ID configured.');
}
