const { spawnSync } = require('child_process');

require('dotenv').config();

const isRailway = Boolean(process.env.RAILWAY_ENVIRONMENT_NAME || process.env.RAILWAY_PROJECT_ID);

if (!process.env.DATABASE_URL || (process.env.NODE_ENV !== 'production' && !isRailway)) {
  console.log('Seed DEMO ignoré: environnement de développement ou PostgreSQL absent.');
  process.exit(0);
}

const result = spawnSync(process.execPath, [require.resolve('./seedDemo.js'), 'seed'], {
  stdio: 'inherit',
  env: process.env
});

if (result.error) throw result.error;
process.exit(result.status ?? 1);