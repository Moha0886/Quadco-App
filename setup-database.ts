import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function setupDatabase() {
  console.log('🚀 Setting up Quadco App Database...');
  
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected');

    // Create admin role
    const adminRole = await prisma.role.upsert({
      where: { name: 'Admin' },
      update: {},
      create: {
        name: 'Admin',
        description: 'Full system administrator access',
      },
    });

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@quadco.com' },
      update: {
        password: hashedPassword,
        isActive: true,
        roleId: adminRole.id,
      },
      create: {
        email: 'admin@quadco.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
        roleId: adminRole.id,
      },
    });

    // Create sample customers
    await prisma.customer.createMany({
      data: [
        {
          name: 'ABC Corporation',
          email: 'contact@abc-corp.com',
          phone: '+1-555-0123',
          address: '123 Business St, New York, NY',
          taxId: 'TAX001',
        },
        {
          name: 'XYZ Limited',
          email: 'info@xyz-ltd.com',
          phone: '+1-555-0456',
          address: '456 Commerce Ave, Los Angeles, CA',
          taxId: 'TAX002',
        },
        {
          name: 'TechStart Inc',
          email: 'hello@techstart.com',
          phone: '+1-555-0789',
          address: '789 Innovation Blvd, San Francisco, CA',
          taxId: 'TAX003',
        },
      ],
      skipDuplicates: true,
    });

    // Create sample products
    await prisma.product.createMany({
      data: [
        {
          name: 'Software License Pro',
          description: 'Professional software license with full features',
          price: 999.99,
          stock: 100,
          category: 'Software',
        },
        {
          name: 'Software License Basic',
          description: 'Basic software license for small teams',
          price: 299.99,
          stock: 200,
          category: 'Software',
        },
        {
          name: 'Hardware Support Kit',
          description: 'Complete hardware support and maintenance kit',
          price: 1499.99,
          stock: 50,
          category: 'Hardware',
        },
      ],
      skipDuplicates: true,
    });

    // Create service categories and services
    const consultingCategory = await prisma.serviceCategory.upsert({
      where: { name: 'Consulting' },
      update: {},
      create: {
        name: 'Consulting',
        description: 'Professional consulting services',
      },
    });

    const supportCategory = await prisma.serviceCategory.upsert({
      where: { name: 'Support' },
      update: {},
      create: {
        name: 'Support',
        description: 'Technical support and maintenance',
      },
    });

    await prisma.service.createMany({
      data: [
        {
          name: 'Business Consultation',
          description: 'Strategic business consultation and planning',
          basePrice: 200.00,
          categoryId: consultingCategory.id,
        },
        {
          name: 'Technical Support',
          description: '24/7 technical support and troubleshooting',
          basePrice: 100.00,
          categoryId: supportCategory.id,
        },
        {
          name: 'System Implementation',
          description: 'Complete system implementation and setup',
          basePrice: 2500.00,
          categoryId: consultingCategory.id,
        },
      ],
      skipDuplicates: true,
    });

    console.log('✅ Database setup completed successfully!');
    console.log('🔑 Admin Login Credentials:');
    console.log('   Email: admin@quadco.com');
    console.log('   Password: admin123');
    console.log('📊 Sample data created for testing');

    // Get counts
    const userCount = await prisma.user.count();
    const customerCount = await prisma.customer.count();
    const productCount = await prisma.product.count();
    const serviceCount = await prisma.service.count();

    console.log(`📈 Database Summary:`);
    console.log(`   Users: ${userCount}`);
    console.log(`   Customers: ${customerCount}`);
    console.log(`   Products: ${productCount}`);
    console.log(`   Services: ${serviceCount}`);

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
setupDatabase()
  .then(() => {
    console.log('🎉 Setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  });
