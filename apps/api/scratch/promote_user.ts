import { PrismaClient, WorkspaceRole } from '@prisma/client';

const prisma = new PrismaClient();

async function promoteUser() {
  const email = "test_delete_unique@example.com"; // From browser subagent's test or user's email
  console.log(`Promoting user: ${email} to ADMIN in all their workspaces...`);
  
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error("User not found!");
    // List all users to help find the right one
    const users = await prisma.user.findMany({ select: { email: true } });
    console.log("Available users:", users.map(u => u.email));
    return;
  }

  const result = await prisma.workspaceMember.updateMany({
    where: { userId: user.id },
    data: { role: WorkspaceRole.ADMIN }
  });

  console.log(`Successfully promoted user to ADMIN in ${result.count} workspaces.`);
  await prisma.$disconnect();
}

promoteUser();
