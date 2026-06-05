const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('./generated/prisma/client');

const urls = [
  'postgresql://neondb_owner:npg_u3ze2ovgwbXZ@ep-old-pine-aqwn476h-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require',
  'postgresql://neondb_owner:npg_u3ze2ovgwbXZ@ep-old-pine-aqwn476h.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require'
];

async function test(url, label) {
  try {
    const adapter = new PrismaPg({ connectionString: url });
    const prisma = new PrismaClient({ adapter });
    const r = await prisma.$queryRawUnsafe('SELECT 1 as ok');
    console.log('OK ' + label + ':', JSON.stringify(r));
    await prisma.$disconnect();
    return true;
  } catch (e) {
    console.log('FAIL ' + label + ':', e.code, e.message?.slice(0, 100));
    return false;
  }
}

(async () => {
  for (const url of urls) {
    await test(url, url.includes('pooler') ? 'POOLED' : 'DIRECT');
  }
  process.exit(0);
})();
