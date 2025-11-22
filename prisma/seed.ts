import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password';

const prisma = new PrismaClient();

async function main() {
  // Create Admin User
  const adminEmail = 'admin@dental.com';
  const adminPassword = await hashPassword('admin123');
  
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin User',
      role: 'admin',
      passwordHash: adminPassword,
    },
  });

  // Create Dentist User
  const dentistEmail = 'dentist@dental.com';
  const dentistPassword = await hashPassword('dentist123');

  await prisma.user.upsert({
    where: { email: dentistEmail },
    update: {},
    create: {
      email: dentistEmail,
      name: 'Dr. Dentist',
      role: 'dentist',
      passwordHash: dentistPassword,
    },
  });

  // Treatment Types
  const treatments = ['Cleaning', 'Filling', 'Root Canal', 'Extraction', 'Whitening'];
  
  for (const label of treatments) {
    await prisma.treatmentType.upsert({
        where: { label },
        update: {},
        create: { label }
    });
  }

  console.log('✅ Seed data inserted successfully');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
