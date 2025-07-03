import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    console.log('🔐 Creating Super Admin User...');

    // Check if super admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@quadco.com' }
    });

    if (existingAdmin) {
      console.log('✅ Super admin already exists!');
      console.log('📧 Email: admin@quadco.com');
      console.log('🔑 Password: admin123');
      return;
    }

    // Get or create Super Admin role
    let superAdminRole = await prisma.role.findFirst({
      where: { name: 'Super Admin' }
    });

    if (!superAdminRole) {
      superAdminRole = await prisma.role.create({
        data: {
          name: 'Super Admin',
          description: 'Full system access'
        }
      });
      console.log('✅ Created Super Admin role');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create super admin user
    const adminUser = await prisma.user.create({
      data: {
        firstName: 'Super',
        lastName: 'Admin',
        email: 'admin@quadco.com',
        password: hashedPassword,
        isActive: true,
        roleId: superAdminRole.id
      }
    });

    console.log('🎉 Super Admin created successfully!');
    console.log('📧 Email: admin@quadco.com');
    console.log('🔑 Password: admin123');
    console.log('🆔 User ID:', adminUser.id);
    console.log('👤 Role:', superAdminRole.name);

  } catch (error) {
    console.error('❌ Error creating super admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();
