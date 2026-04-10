const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasourceUrl: 'postgresql://postgres.rgpdsjmyamduakbmmdhr:aV2rMTfS9wkrueB1@aws-1-us-east-1.pooler.supabase.com:5432/postgres'
});

async function main() {
  console.log('Checking users in production database...\n');
  
  const users = await prisma.systemUser.findMany({
    select: {
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true
    }
  });
  
  console.log('Total users found:', users.length);
  console.log('\nUsers:');
  users.forEach(u => {
    console.log(`- ${u.email} (${u.role}) - Active: ${u.isActive}`);
  });
}

main()
  .catch(e => console.error('Error:', e.message))
  .finally(() => prisma.$disconnect());
