import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDelete() {
  const workspaceName = "Super admin 3 g";
  console.log(`Searching for workspace: "${workspaceName}"`);
  
  const workspace = await prisma.workspace.findFirst({
    where: { name: { contains: workspaceName, mode: 'insensitive' } }
  });

  if (!workspace) {
    console.error("Workspace not found!");
    process.exit(1);
  }

  console.log(`Found Workspace: ${workspace.name} (ID: ${workspace.id})`);

  try {
    console.log("Attempting to delete via transaction...");
    await prisma.$transaction(async (tx) => {
      const id = workspace.id;
      
      const goals = await tx.goal.findMany({ where: { workspaceId: id }, select: { id: true } });
      const goalIds = goals.map(g => g.id);
      
      const announcements = await tx.announcement.findMany({ where: { workspaceId: id }, select: { id: true } });
      const announcementIds = announcements.map(a => a.id);

      console.log(`- Deleting children for ${goalIds.length} goals...`);
      if (goalIds.length > 0) {
        await tx.activity.deleteMany({ where: { goalId: { in: goalIds } } });
        await tx.milestone.deleteMany({ where: { goalId: { in: goalIds } } });
      }
      
      console.log(`- Deleting children for ${announcementIds.length} announcements...`);
      if (announcementIds.length > 0) {
        await tx.comment.deleteMany({ where: { announcementId: { in: announcementIds } } });
        await tx.reaction.deleteMany({ where: { announcementId: { in: announcementIds } } });
      }

      console.log("- Deleting ActionItems...");
      await tx.actionItem.deleteMany({ where: { workspaceId: id } });

      console.log("- Deleting Announcements and Goals...");
      await tx.announcement.deleteMany({ where: { workspaceId: id } });
      await tx.goal.deleteMany({ where: { workspaceId: id } });

      console.log("- Deleting Membership records...");
      await tx.workspaceMember.deleteMany({ where: { workspaceId: id } });

      console.log("- Deleting Workspace...");
      await tx.workspace.delete({ where: { id } });
    });
    console.log("SUCCESS: Workspace deleted successfully in transaction!");
  } catch (error) {
    console.error("FAILURE: Error during deletion:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testDelete();
