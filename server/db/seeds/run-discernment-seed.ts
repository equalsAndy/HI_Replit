import { db } from '../../db.js';
import { discernmentScenarios } from '../../../shared/schema.js';
import { discernmentSeedData } from './discernment-scenarios.js';

async function seedDiscernmentScenarios() {
  console.log('Seeding discernment scenarios...');
  
  try {
    await db.insert(discernmentScenarios).values(discernmentSeedData);
    console.log('✅ Successfully seeded 9 discernment scenarios');
  } catch (error) {
    console.error('❌ Error seeding discernment scenarios:', error);
  }
  
  process.exit(0);
}

seedDiscernmentScenarios();