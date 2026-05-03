import { PrismaClient, UserRole, WorkspaceRole, GoalStatus, Priority } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  // 1. Create Admin User
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
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    },
  });

  // 2. Create a Regular Member User
  const memberPassword = await bcrypt.hash('member123', 10);
  const member = await prisma.user.upsert({
    where: { email: 'member@teamhub.com' },
    update: {
      password: memberPassword,
    },
    create: {
      email: 'member@teamhub.com',
      name: 'John Doe',
      password: memberPassword,
      role: UserRole.MEMBER,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    },
  });

  // 3. Create a Workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Development Hub',
      description: 'Main workspace for core engineering and product design teams.',
      accentColor: '#3b82f6',
      members: {
        create: [
          { userId: admin.id, role: WorkspaceRole.ADMIN },
          { userId: member.id, role: WorkspaceRole.MEMBER },
        ],
      },
    },
  });

  // 4. Create a Goal
  const goal = await prisma.goal.create({
    data: {
      title: 'Q2 Product Launch',
      description: 'Prepare and execute the launch of our new collaborative features.',
      ownerId: admin.id,
      workspaceId: workspace.id,
      status: GoalStatus.IN_PROGRESS,
      milestones: {
        create: [
          { title: 'Frontend UI Polish', progress: 80 },
          { title: 'Backend API Integration', progress: 60 },
          { title: 'Final Testing', progress: 20 },
        ],
      },
    },
  });

  // 5. Create an Announcement
  const announcement = await prisma.announcement.create({
    data: {
      title: 'Welcome to the Team Hub!',
      content: 'We are excited to launch our new collaborative platform. Please explore the workspaces and set your goals.',
      isPinned: true,
      authorId: admin.id,
      workspaceId: workspace.id,
    },
  });

  // 6. Create an Action Item
  await prisma.actionItem.create({
    data: {
      title: 'Setup Database Migrations',
      description: 'Ensure all tables are properly synced with Railway.',
      assigneeId: member.id,
      goalId: goal.id,
      workspaceId: workspace.id,
      priority: Priority.URGENT,
      status: 'TODO',
      dueDate: new Date(Date.now() + 86400000 * 3), // 3 days from now
    },
  });

  // 7. Create some Activity
  await prisma.activity.create({
    data: {
      content: 'System Admin created the goal: Q2 Product Launch',
      goalId: goal.id,
    },
  });

  // 8. Create a Notification
  await prisma.notification.create({
    data: {
      type: 'ANNOUNCEMENT',
      content: 'New announcement: Welcome to the Team Hub!',
      userId: member.id,
    },
  });

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
