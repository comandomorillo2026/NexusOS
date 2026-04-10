const { PrismaClient } = require('@prisma/client');

// Try different connection strings
const connectionStrings = [
  'postgresql://postgres.rgpdsjmyamduakbmmdhr:MXhO5B9dFMNJudvf@aws-1-us-east-1.pooler.supabase.com:5432/postgres',
  'postgresql://postgres:MXhO5B9dFMNJudvf@aws-1-us-east-1.pooler.supabase.com:5432/postgres',
  'postgresql://postgres.rgpdsjmyamduakbmmdhr:MXhO5B9dFMNJudvf@aws-1-us-east-1.pooler.supabase.com:6543/postgres',
];

async function testConnection(url) {
  console.log('\nTesting:', url.replace(/:[^:@]+@/, ':****@'));
  const prisma = new PrismaClient({ datasourceUrl: url });
  try {
    await prisma.$connect();
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ SUCCESS!');
    return true;
  } catch (e) {
    console.log('❌ Failed:', e.message);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  for (const url of connectionStrings) {
    if (await testConnection(url)) break;
  }
}

main();
