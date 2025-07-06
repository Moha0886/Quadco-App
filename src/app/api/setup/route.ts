import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    console.log('🚀 Setting up database...');

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@quadco.com' }
    });

    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: 'Admin user already exists',
        adminCredentials: {
          email: 'admin@quadco.com',
          password: 'admin123',
        },
      });
    }

    // Create admin role first
    const adminRole = await prisma.role.create({
      data: {
        name: 'Admin',
        description: 'Full system administrator access',
      },
    });

    // Create admin user using raw SQL
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await prisma.$executeRaw`
      INSERT INTO users (id, email, password, "firstName", "lastName", "isActive", "roleId", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), 'admin@quadco.com', ${hashedPassword}, 'Admin', 'User', true, ${adminRole.id}, NOW(), NOW())
    `;

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
          address: '789 Innovation Drive, San Francisco, CA',
          taxId: 'TAX003',
        },
      ],
    });

    // Create sample products
    await prisma.product.createMany({
      data: [
        {
          name: 'Premium Software License',
          description: 'Annual software license with full features',
          price: 999.99,
          stock: 100,
          category: 'Software',
        },
        {
          name: 'Standard Software License',
          description: 'Basic software license for small teams',
          price: 299.99,
          stock: 200,
          category: 'Software',
        },
        {
          name: 'Enterprise Hardware Package',
          description: 'Complete enterprise hardware solution',
          price: 2499.99,
          stock: 50,
          category: 'Hardware',
        },
      ],
    });

    // Create service category
    const serviceCategory = await prisma.serviceCategory.create({
      data: {
        name: 'Consulting',
        description: 'Professional consulting services',
      },
    });

    // Create sample services
    await prisma.service.createMany({
      data: [
        {
          name: 'Business Consultation',
          description: 'Strategic business consultation and planning',
          basePrice: 200.00,
          categoryId: serviceCategory.id,
        },
        {
          name: 'Technical Support',
          description: '24/7 technical support and troubleshooting',
          basePrice: 100.00,
          categoryId: serviceCategory.id,
        },
        {
          name: 'System Implementation',
          description: 'Complete system implementation and setup',
          basePrice: 2500.00,
          categoryId: serviceCategory.id,
        },
      ],
    });

    // Get final counts
    const userCount = await prisma.user.count();
    const customerCount = await prisma.customer.count();
    const productCount = await prisma.product.count();
    const serviceCount = await prisma.service.count();

    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully',
      adminCredentials: {
        email: 'admin@quadco.com',
        password: 'admin123',
      },
      statistics: {
        users: userCount,
        customers: customerCount,
        products: productCount,
        services: serviceCount,
      },
    });

  } catch (error) {
    console.error('Database setup error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database setup failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Setup API endpoint. Use POST method to initialize database.',
    instructions: 'Send a POST request to this endpoint to set up initial data.',
  });
}
