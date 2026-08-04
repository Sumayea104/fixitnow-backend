import { PrismaClient, UserRole, UserStatus } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

declare const process: {
  exit(code?: number): never;
};

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

  // 1. Create Admin
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

  // 2. Create Categories
  const plumbing = await prisma.category.create({
    data: { name: 'Plumbing', slug: 'plumbing', icon: 'fa-wrench', description: 'Professional plumbing services' },
  });
  const electrical = await prisma.category.create({
    data: { name: 'Electrical', slug: 'electrical', icon: 'fa-bolt', description: 'Electrical repair and installation' },
  });
  const cleaning = await prisma.category.create({
    data: { name: 'Cleaning', slug: 'cleaning', icon: 'fa-broom', description: 'Professional cleaning services' },
  });
  const painting = await prisma.category.create({
    data: { name: 'Painting', slug: 'painting', icon: 'fa-paint-brush', description: 'Interior and exterior painting' },
  });

  console.log('✅ Categories created');

  // 3. Create Technician
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
          bio: 'Experienced technician with 10+ years in residential and commercial home repair',
          experience: 10,
          hourlyRate: 75,
          location: 'New York, NY',
          isAvailable: true,
          isVerified: true,
          skills: ['Plumbing', 'Electrical Wiring', 'AC Repair', 'Painting'],
        },
      },
    },
    include: {
      technicianProfile: true,
    },
  });
  console.log('✅ Technician created');

  const technicianProfileId = technician.technicianProfile?.id;
  if (!technicianProfileId) {
    throw new Error('Technician profile was not created');
  }

  // 4. Create Customer
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

  // 5. Create Services for all Categories (FIXED: images array added)
  const servicesData = [
    // Plumbing Services
    {
      title: 'Emergency Pipe & Leak Repair',
      description: 'Fast and reliable pipe leak detection, repair, and replacement for kitchen and bathroom.',
      price: 150,
      durationMinutes: 60,
      images: ['https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&auto=format&fit=crop&q=80'],
      categoryId: plumbing.id,
    },
    {
      title: 'Water Heater Installation & Fixing',
      description: 'Complete water heater inspection, maintenance, heating element fix, and new installation.',
      price: 300,
      durationMinutes: 120,
      images: ['https://images.unsplash.com/photo-1505798577917-a65157d3320a?w=600&auto=format&fit=crop&q=80'],
      categoryId: plumbing.id,
    },
    {
      title: 'Drain & Sewer Line Unclogging',
      description: 'Advanced blockage removal for clogged sinks, toilets, and main sewer pipes.',
      price: 120,
      durationMinutes: 45,
      images: ['https://images.unsplash.com/photo-1542013936693-884638332954?w=600&auto=format&fit=crop&q=80'],
      categoryId: plumbing.id,
    },

    // Electrical Services
    {
      title: 'Complete House Wiring & Fixes',
      description: 'Safe short circuit fixing, breaker box upgrade, and full residential electrical wiring.',
      price: 250,
      durationMinutes: 90,
      images: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80'],
      categoryId: electrical.id,
    },
    {
      title: 'Fan, Light & Appliance Setup',
      description: 'Installation of ceiling fans, chandelier lighting, smart switches, and kitchen appliances.',
      price: 80,
      durationMinutes: 30,
      images: ['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80'],
      categoryId: electrical.id,
    },

    // Cleaning Services
    {
      title: 'Full Home Deep Cleaning',
      description: 'Comprehensive cleaning for bedrooms, kitchen, bathrooms, living area, and balcony.',
      price: 450,
      durationMinutes: 240,
      images: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80'],
      categoryId: cleaning.id,
    },
    {
      title: 'Sofa & Carpet Shampoo Wash',
      description: 'Deep stain removal, sanitization, and shampoo washing for upholstered furniture.',
      price: 180,
      durationMinutes: 90,
      images: ['https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600&auto=format&fit=crop&q=80'],
      categoryId: cleaning.id,
    },

    // Painting Services
    {
      title: 'Interior Apartment Painting',
      description: 'Premium interior wall painting with surface preparation, putty, and smooth finish.',
      price: 600,
      durationMinutes: 360,
      images: ['https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&auto=format&fit=crop&q=80'],
      categoryId: painting.id,
    },
    {
      title: 'Waterproof Wall & Damp Treatment',
      description: 'Protective damp-proof coating and wall repair to prevent water leakage and fungus.',
      price: 350,
      durationMinutes: 180,
      images: ['https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80'],
      categoryId: painting.id,
    },
  ];

  for (const s of servicesData) {
    await prisma.service.create({
      data: {
        ...s,
        technicianId: technicianProfileId,
      },
    });
  }

  console.log('✅ Services created for all categories');
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