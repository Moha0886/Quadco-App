import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting database seed...');

  // Create default role
  console.log('📝 Creating admin role...');
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
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@quadco.com' },
    update: {},
    create: {
      email: 'admin@quadco.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      isActive: true,
      roleId: adminRole.id,
    },
  });

  console.log('✅ Admin user created: admin@quadco.com / admin123');

  // Create sample customers
  console.log('📊 Creating sample customers...');
  const customer1 = await prisma.customer.upsert({
    where: { id: 'existing-customer-1' },
    update: {},
    create: {
      name: 'ABC Corporation',
      email: 'contact@abc-corp.com',
      phone: '+1-555-0123',
      address: '123 Business St, New York, NY 10001',
      taxId: 'TAX123456',
    },
  });

  const customer2 = await prisma.customer.upsert({
    where: { id: 'existing-customer-2' },
    update: {},
    create: {
      name: 'XYZ Ltd',
      email: 'info@xyz-ltd.com',
      phone: '+1-555-0456',
      address: '456 Commerce Ave, Los Angeles, CA 90210',
      taxId: 'TAX789012',
    },
  });

  // Create sample products
  console.log('📦 Creating sample products...');
  const product1 = await prisma.product.upsert({
    where: { id: 'existing-product-1' },
    update: {},
    create: {
      name: 'Premium Software License',
      description: 'Annual software license with full support',
      price: 999.99,
      stock: 50,
      category: 'Software',
    },
  });

  // Create sample services
  console.log('🔧 Creating sample services...');
  const category = await prisma.serviceCategory.create({
    data: {
      name: 'Consulting',
      description: 'Professional consulting services',
    },
  });

  const service1 = await prisma.service.upsert({
    where: { id: 'existing-service-1' },
    update: {},
    create: {
      name: 'Technical Consultation',
      description: 'Expert technical consultation services',
      basePrice: 150.00,
      categoryId: category.id,
    },
  });

  // Create sample quotation
  console.log('📋 Creating sample quotation...');
  const quotation = await prisma.quotation.create({
    data: {
      customerId: customer1.id,
      date: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'DRAFT',
      subtotal: 999.99,
      taxAmount: 99.99,
      total: 1099.98,
      lineItems: {
        create: [
          {
            itemType: 'PRODUCT',
            documentType: 'QUOTATION',
            documentId: '', // This will be set by Prisma
            description: 'Premium Software License',
            quantity: 1,
            unitPrice: 999.99,
            total: 999.99,
            productId: product1.id,
          },
        ],
      },
    },
  });

  console.log('🎉 Database seeded successfully!');
  console.log('🔑 Login credentials:');
  console.log('   Email: admin@quadco.com');
  console.log('   Password: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
