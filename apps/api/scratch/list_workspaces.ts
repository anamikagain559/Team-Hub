import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listWorkspaces() {
  const workspaces = await prisma.workspace.findMany();
  console.log("Current Workspaces in DB:");
  workspaces.forEach(ws => {
    console.log(`- "${ws.name}" (ID: ${ws.id})`);
  });
  await prisma.$disconnect();
}

listWorkspaces();
