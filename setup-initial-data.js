const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setupInitialData() {
  try {
    console.log('🚀 Setting up initial data...');

    // Check if users already exist
    const existingUsers = await prisma.user.findMany();
    if (existingUsers.length > 0) {
      console.log('✅ Users already exist in database');
      console.log('Existing users:');
      existingUsers.forEach(user => {
        console.log(`  - ${user.email} (${user.isActive ? 'Active' : 'Inactive'})`);
      });
      return;
    }

    // Create default role first
    console.log('📝 Creating default role...');
    const adminRole = await prisma.role.upsert({
      where: { name: 'Admin' },
      update: {},
      create: {
        name: 'Admin',
        description: 'Full system access',
      },
    });

    // Create admin user
    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@quadco.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
        roleId: adminRole.id,
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('Login credentials:');
    console.log('Email: admin@quadco.com');
    console.log('Password: admin123');

    // Create some sample customers
    console.log('📊 Creating sample customers...');
    await prisma.customer.createMany({
      data: [
        {
          name: 'ABC Corporation',
          email: 'contact@abc-corp.com',
          phone: '+1-555-0123',
          address: '123 Business St, New York, NY 10001',
          taxNumber: 'TAX123456',
        },
        {
          name: 'XYZ Ltd',
          email: 'info@xyz-ltd.com',
          phone: '+1-555-0456',
          address: '456 Commerce Ave, Los Angeles, CA 90210',
          taxNumber: 'TAX789012',
        },
      ],
    });

    // Create some sample products
    console.log('📦 Creating sample products...');
    await prisma.product.createMany({
      data: [
        {
          name: 'Premium Software License',
          description: 'Annual software license with full support',
          price: 999.99,
          stockQuantity: 50,
          sku: 'SW-PREM-001',
        },
        {
          name: 'Standard Software License',
          description: 'Basic software license',
          price: 499.99,
          stockQuantity: 100,
          sku: 'SW-STD-001',
        },
      ],
    });

    // Create some sample services
    console.log('🔧 Creating sample services...');
    await prisma.service.createMany({
      data: [
        {
          name: 'Technical Consultation',
          description: 'Expert technical consultation services',
          price: 150.00,
          category: 'Consulting',
        },
        {
          name: 'Software Implementation',
          description: 'Full software implementation and setup',
          price: 2500.00,
          category: 'Implementation',
        },
      ],
    });

    console.log('🎉 Initial data setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up initial data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupInitialData();
