import { PrismaClient } from '@prisma/client';
import { AuthService } from '../src/lib/auth';

const prisma = new PrismaClient();

async function createSuperAdmin() {
  console.log('Creating super admin user...');

  try {
    // First, create or update a super admin role
    const superAdminRole = await (prisma as any).role.upsert({
      where: { name: 'super-admin' },
      update: {},
      create: {
        name: 'super-admin',
        description: 'Super Administrator with unlimited access to all system functions including user management',
        isSystem: true
      }
    });

    // Get all permissions
    const allPermissions = await (prisma as any).permission.findMany();

    // Assign all permissions to super admin role
    console.log('Assigning all permissions to super admin role...');
    for (const permission of allPermissions) {
      await (prisma as any).rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: superAdminRole.id,
            permissionId: permission.id
          }
        },
        update: {},
        create: {
          roleId: superAdminRole.id,
          permissionId: permission.id
        }
      });
    }

    // Create super admin user
    const superAdminPassword = await AuthService.hashPassword('SuperAdmin2025!');
    
    const superAdminUser = await (prisma as any).user.upsert({
      where: { email: 'superadmin@quadco.com' },
      update: {
        password: superAdminPassword,
        isActive: true
      },
      create: {
        email: 'superadmin@quadco.com',
        username: 'superadmin',
        firstName: 'Super',
        lastName: 'Administrator',
        password: superAdminPassword,
        isActive: true
      }
    });

    // Assign super admin role to the user
    await (prisma as any).userRole.upsert({
      where: {
        userId_roleId: {
          userId: superAdminUser.id,
          roleId: superAdminRole.id
        }
      },
      update: {},
      create: {
        userId: superAdminUser.id,
        roleId: superAdminRole.id
      }
    });

    console.log('✅ Super admin user created successfully!');
    console.log('');
    console.log('🔐 Super Admin Credentials:');
    console.log('Email: superadmin@quadco.com');
    console.log('Password: SuperAdmin2025!');
    console.log('Role: super-admin');
    console.log('');
    console.log('🚨 IMPORTANT SECURITY NOTES:');
    console.log('- This account has UNLIMITED access to all system functions');
    console.log('- Please change the password immediately after first login');
    console.log('- Consider enabling 2FA if available');
    console.log('- Use this account only for critical administrative tasks');
    console.log('- Regular admin account (admin@quadco.com) should be used for daily tasks');

  } catch (error) {
    console.error('❌ Error creating super admin user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  try {
    await createSuperAdmin();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { createSuperAdmin };
