const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create Admin
  const adminPassword = await bcrypt.hash('Admin@1234', 12);
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@taskflow.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin created:', admin.email);

  // Create Members
  const memberPassword = await bcrypt.hash('Member@1234', 12);
  const member1 = await prisma.user.create({
    data: {
      name: 'Sarah Johnson',
      email: 'sarah@taskflow.com',
      passwordHash: memberPassword,
      role: 'MEMBER',
    },
  });

  const member2 = await prisma.user.create({
    data: {
      name: 'Mike Chen',
      email: 'mike@taskflow.com',
      passwordHash: memberPassword,
      role: 'MEMBER',
    },
  });
  console.log('✅ Members created:', member1.email, member2.email);

  // Create Projects
  const project1 = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Complete overhaul of the company website with modern design patterns, responsive layouts, and improved user experience.',
      createdById: admin.id,
      members: {
        create: [
          { userId: admin.id },
          { userId: member1.id },
          { userId: member2.id },
        ],
      },
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile App Development',
      description: 'Build a cross-platform mobile application for iOS and Android with React Native, including push notifications and offline support.',
      createdById: admin.id,
      members: {
        create: [
          { userId: admin.id },
          { userId: member1.id },
        ],
      },
    },
  });
  console.log('✅ Projects created:', project1.name, project2.name);

  // Create Tasks for Project 1
  const now = new Date();
  const daysFromNow = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  const daysAgo = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  await prisma.task.createMany({
    data: [
      {
        title: 'Design new homepage layout',
        description: 'Create wireframes and high-fidelity mockups for the new homepage design with hero section, features grid, and testimonials.',
        status: 'DONE',
        priority: 'HIGH',
        dueDate: daysAgo(2),
        projectId: project1.id,
        assignedToId: member1.id,
        createdById: admin.id,
      },
      {
        title: 'Implement responsive navigation',
        description: 'Build a mobile-first responsive navigation bar with hamburger menu, dropdown submenus, and smooth transitions.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: daysFromNow(3),
        projectId: project1.id,
        assignedToId: member2.id,
        createdById: admin.id,
      },
      {
        title: 'Set up CI/CD pipeline',
        description: 'Configure GitHub Actions for automated testing, linting, and deployment to staging and production environments.',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: daysFromNow(7),
        projectId: project1.id,
        assignedToId: member1.id,
        createdById: admin.id,
      },
      {
        title: 'Write API documentation',
        description: 'Document all REST API endpoints with request/response examples, authentication requirements, and error codes.',
        status: 'TODO',
        priority: 'LOW',
        dueDate: daysAgo(1),
        projectId: project1.id,
        assignedToId: member2.id,
        createdById: admin.id,
      },
    ],
  });

  // Create Tasks for Project 2
  await prisma.task.createMany({
    data: [
      {
        title: 'Set up React Native project',
        description: 'Initialize the React Native project with TypeScript, configure Metro bundler, and set up iOS and Android environments.',
        status: 'DONE',
        priority: 'HIGH',
        dueDate: daysAgo(5),
        projectId: project2.id,
        assignedToId: member1.id,
        createdById: admin.id,
      },
      {
        title: 'Design authentication screens',
        description: 'Create login, registration, and forgot password screens with form validation and social login options.',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        dueDate: daysFromNow(5),
        projectId: project2.id,
        assignedToId: member1.id,
        createdById: admin.id,
      },
    ],
  });

  console.log('✅ Tasks created: 6 tasks across 2 projects');
  console.log('');
  console.log('📋 Seed data summary:');
  console.log('   Admin:   admin@taskflow.com / Admin@1234');
  console.log('   Member:  sarah@taskflow.com / Member@1234');
  console.log('   Member:  mike@taskflow.com  / Member@1234');
  console.log('');
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
