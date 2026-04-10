const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasourceUrl: 'postgresql://postgres.rgpdsjmyamduakbmmdhr:MXhO5B9dFMNJudvf@aws-1-us-east-1.pooler.supabase.com:5432/postgres'
});

async function main() {
  console.log('Attempting to connect...');
  await prisma.$connect();
  console.log('Connected successfully!');
  const result = await prisma.$queryRaw`SELECT 1 as test`;
  console.log('Query result:', result);
}

main()
  .catch(e => console.error('Error:', e.message))
  .finally(() => prisma.$disconnect());
