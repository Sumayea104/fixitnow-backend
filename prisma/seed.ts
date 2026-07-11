import { PrismaClient, UserRole, UserStatus } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clean database
  await prisma.$transaction([
    prisma.notification.deleteMany(),
    prisma.review.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.booking.deleteMany(),
    prisma.service.deleteMany(),
    prisma.category.deleteMany(),
    prisma.availabilitySlot.deleteMany(),
    prisma.technicianProfile.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  console.log('🧹 Database cleaned');

  // Create Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      email: 'admin@fixitnow.com',
      password: adminPassword,
      name: 'System Admin',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
    },
  });
  console.log('✅ Admin created');

  // Create Categories
  await prisma.category.createMany({
    data: [
      { name: 'Plumbing', slug: 'plumbing', icon: 'fa-wrench', description: 'Professional plumbing services' },
      { name: 'Electrical', slug: 'electrical', icon: 'fa-bolt', description: 'Electrical repair and installation' },
      { name: 'Cleaning', slug: 'cleaning', icon: 'fa-broom', description: 'Professional cleaning services' },
      { name: 'Painting', slug: 'painting', icon: 'fa-paint-brush', description: 'Interior and exterior painting' },
    ],
  });
  console.log('✅ Categories created');

  // Create Technician
  const techPassword = await bcrypt.hash('tech123', 10);
  const technician = await prisma.user.create({
    data: {
      email: 'john@fixitnow.com',
      password: techPassword,
      name: 'John Doe',
      phone: '+1234567890',
      address: '123 Main St, New York, NY',
      role: UserRole.TECHNICIAN,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      technicianProfile: {
        create: {
          bio: 'Experienced plumber with 10+ years in residential and commercial plumbing',
          experience: 10,
          hourlyRate: 75,
          location: 'New York, NY',
          isAvailable: true,
          isVerified: true,
          skills: ['Plumbing', 'Pipe Repair', 'Water Heater', 'Drain Cleaning'],
        },
      },
    },
    include: {
      technicianProfile: true,
    },
  });
  console.log('✅ Technician created');

  // Create Customer
  const customerPassword = await bcrypt.hash('customer123', 10);
  await prisma.user.create({
    data: {
      email: 'customer@example.com',
      password: customerPassword,
      name: 'Jane Smith',
      phone: '+1234567891',
      address: '456 Oak Ave, New York, NY',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
    },
  });
  console.log('✅ Customer created');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });