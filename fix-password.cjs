const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasourceUrl: 'postgresql://postgres.rgpdsjmyamduakbmmdhr:aV2rMTfS9wkrueB1@aws-1-us-east-1.pooler.supabase.com:5432/postgres'
});

async function main() {
  console.log('Fixing passwords...\n');
  
  // Create fresh password hashes
  const adminHash = await bcrypt.hash('Aethel2024!', 12);
  const demoHash = await bcrypt.hash('Demo2024!', 12);
  
  console.log('New hash for Aethel2024!:', adminHash.substring(0, 30) + '...');
  console.log('New hash for Demo2024!:', demoHash.substring(0, 30) + '...');
  
  // Update admin password
  const admin = await prisma.systemUser.update({
    where: { email: 'admin@aethel.tt' },
    data: { passwordHash: adminHash }
  });
  console.log('\n✅ Updated admin@aethel.tt');
  
  // Update demo users
  const demoUsers = ['clinic@aethel.tt', 'lawfirm@aethel.tt', 'beauty@aethel.tt', 'nurse@aethel.tt'];
  for (const email of demoUsers) {
    await prisma.systemUser.update({
      where: { email },
      data: { passwordHash: demoHash }
    });
    console.log(`✅ Updated ${email}`);
  }
  
  // Verify by testing comparison
  console.log('\n--- Verifying passwords ---');
  const verifyAdmin = await prisma.systemUser.findUnique({ where: { email: 'admin@aethel.tt' } });
  const matchAdmin = await bcrypt.compare('Aethel2024!', verifyAdmin.passwordHash);
  console.log('Admin password verification:', matchAdmin ? '✅ PASS' : '❌ FAIL');
  
  const verifyClinic = await prisma.systemUser.findUnique({ where: { email: 'clinic@aethel.tt' } });
  const matchClinic = await bcrypt.compare('Demo2024!', verifyClinic.passwordHash);
  console.log('Clinic password verification:', matchClinic ? '✅ PASS' : '❌ FAIL');
}

main()
  .catch(e => console.error('Error:', e.message))
  .finally(() => prisma.$disconnect());
