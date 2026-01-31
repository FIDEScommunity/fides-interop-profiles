#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import Ajv from 'ajv';

interface InteropProfile {
  schemaVersion: string;
  profile: {
    id: string;
    name: string;
    version: string;
    status: 'draft' | 'stable' | 'deprecated';
    specUrl: string;
    publisher?: string;
    updated?: string;
    notes?: string;
  };
  capabilities: Record<string, Record<string, any>>;
}

interface AggregatedData {
  generatedAt: string;
  profiles: InteropProfile[];
  statistics: {
    totalProfiles: number;
    byStatus: Record<string, number>;
  };
}

const PROFILES_DIR = path.join(__dirname, '../../profiles');
const SCHEMA_PATH = path.join(__dirname, '../../schemas/interop-profile.schema.json');
const OUTPUT_PATH = path.join(__dirname, '../../data/aggregated.json');

/**
 * Load and validate all profile JSON files
 */
function loadProfiles(): InteropProfile[] {
  console.log('📂 Scanning profiles directory...');
  
  if (!fs.existsSync(PROFILES_DIR)) {
    console.error(`❌ Profiles directory not found: ${PROFILES_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(PROFILES_DIR)
    .filter(file => file.startsWith('interop-profile.') && file.endsWith('.json'))
    .sort();

  console.log(`   Found ${files.length} profile file(s)`);

  if (files.length === 0) {
    console.warn('⚠️  No profile files found. Please add profiles to the profiles/ directory.');
    console.warn('   Expected naming: interop-profile.<profile-id>.json');
    return [];
  }

  const profiles: InteropProfile[] = [];

  for (const file of files) {
    const filePath = path.join(PROFILES_DIR, file);
    console.log(`\n📄 Processing: ${file}`);

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const profile = JSON.parse(content) as InteropProfile;

      // Validate profile ID matches filename
      const expectedId = file.replace('interop-profile.', '').replace('.json', '');
      if (profile.profile.id !== expectedId) {
        console.error(`   ❌ Profile ID mismatch!`);
        console.error(`      File: ${file}`);
        console.error(`      Expected ID: ${expectedId}`);
        console.error(`      Actual ID: ${profile.profile.id}`);
        process.exit(1);
      }

      profiles.push(profile);
      console.log(`   ✓ Loaded: ${profile.profile.name} ${profile.profile.version} (${profile.profile.status})`);
    } catch (error) {
      console.error(`   ❌ Failed to parse ${file}:`, error);
      process.exit(1);
    }
  }

  return profiles;
}

/**
 * Validate profiles against JSON Schema
 */
function validateProfiles(profiles: InteropProfile[]): void {
  console.log('\n🔍 Validating profiles against schema...');

  if (!fs.existsSync(SCHEMA_PATH)) {
    console.error(`❌ Schema file not found: ${SCHEMA_PATH}`);
    process.exit(1);
  }

  const schemaContent = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  const schema = JSON.parse(schemaContent);

  // Configure AJV for draft 2020-12
  const ajv = new Ajv({ 
    allErrors: true, 
    verbose: true,
    strict: false,
    validateSchema: false  // Skip meta-schema validation
  });
  const validate = ajv.compile(schema);

  let hasErrors = false;

  for (const profile of profiles) {
    const valid = validate(profile);
    
    if (!valid) {
      console.error(`\n❌ Validation failed for: ${profile.profile.id}`);
      console.error(JSON.stringify(validate.errors, null, 2));
      hasErrors = true;
    } else {
      console.log(`   ✓ ${profile.profile.id} - Valid`);
    }
  }

  if (hasErrors) {
    console.error('\n❌ Schema validation failed. Please fix the errors above.');
    process.exit(1);
  }

  console.log('\n✅ All profiles are valid!');
}

/**
 * Generate statistics
 */
function generateStatistics(profiles: InteropProfile[]) {
  const byStatus: Record<string, number> = {
    draft: 0,
    stable: 0,
    deprecated: 0,
  };

  for (const profile of profiles) {
    byStatus[profile.profile.status] = (byStatus[profile.profile.status] || 0) + 1;
  }

  return {
    totalProfiles: profiles.length,
    byStatus,
  };
}

/**
 * Generate aggregated.json
 */
function generateAggregated(profiles: InteropProfile[]): void {
  console.log('\n📦 Generating aggregated.json...');

  const aggregated: AggregatedData = {
    generatedAt: new Date().toISOString(),
    profiles: profiles.sort((a, b) => a.profile.id.localeCompare(b.profile.id)),
    statistics: generateStatistics(profiles),
  };

  // Ensure data directory exists
  const dataDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(aggregated, null, 2));

  console.log(`   ✓ Generated: ${OUTPUT_PATH}`);
  console.log(`   📊 Statistics:`);
  console.log(`      Total profiles: ${aggregated.statistics.totalProfiles}`);
  console.log(`      Stable: ${aggregated.statistics.byStatus.stable}`);
  console.log(`      Draft: ${aggregated.statistics.byStatus.draft}`);
  console.log(`      Deprecated: ${aggregated.statistics.byStatus.deprecated}`);
}

/**
 * Main function
 */
function main() {
  console.log('🚀 FIDES Interop Profile Crawler\n');

  const args = process.argv.slice(2);
  const validateOnly = args.includes('--validate-only');

  const profiles = loadProfiles();

  if (profiles.length === 0) {
    console.log('\n⚠️  No profiles to process. Exiting.');
    process.exit(0);
  }

  validateProfiles(profiles);

  if (!validateOnly) {
    generateAggregated(profiles);
    console.log('\n✅ Crawl complete!\n');
  } else {
    console.log('\n✅ Validation complete!\n');
  }
}

main();
