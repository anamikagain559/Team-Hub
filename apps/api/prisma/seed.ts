import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@teamhub.com' },
    update: {
      password: adminPassword,
      role: UserRole.ADMIN,
    },
    create: {
      email: 'admin@teamhub.com',
      name: 'System Admin',
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  });

  console.log({ admin });
  console.log('Seed data inserted successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
