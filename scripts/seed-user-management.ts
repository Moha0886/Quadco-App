import { PrismaClient } from '@prisma/client';
import { AuthService } from '../src/lib/auth';

const prisma = new PrismaClient();

async function seedUserManagement() {
  console.log('Seeding user management data...');

  // Create permissions
  const permissions = [
    // User management
    { name: 'View Users', resource: 'users', action: 'read', description: 'View user list and details' },
    { name: 'Create Users', resource: 'users', action: 'create', description: 'Create new users' },
    { name: 'Update Users', resource: 'users', action: 'update', description: 'Edit user information and roles' },
    { name: 'Delete Users', resource: 'users', action: 'delete', description: 'Delete users' },
    
    // Role management
    { name: 'View Roles', resource: 'roles', action: 'read', description: 'View role list and details' },
    { name: 'Create Roles', resource: 'roles', action: 'create', description: 'Create new roles' },
    { name: 'Update Roles', resource: 'roles', action: 'update', description: 'Edit role information and permissions' },
    { name: 'Delete Roles', resource: 'roles', action: 'delete', description: 'Delete roles' },
    
    // Permission management
    { name: 'View Permissions', resource: 'permissions', action: 'read', description: 'View permission list and details' },
    { name: 'Create Permissions', resource: 'permissions', action: 'create', description: 'Create new permissions' },
    { name: 'Update Permissions', resource: 'permissions', action: 'update', description: 'Edit permission information' },
    { name: 'Delete Permissions', resource: 'permissions', action: 'delete', description: 'Delete permissions' },
    
    // Customer management
    { name: 'View Customers', resource: 'customers', action: 'read', description: 'View customer list and details' },
    { name: 'Create Customers', resource: 'customers', action: 'create', description: 'Create new customers' },
    { name: 'Update Customers', resource: 'customers', action: 'update', description: 'Edit customer information' },
    { name: 'Delete Customers', resource: 'customers', action: 'delete', description: 'Delete customers' },
    
    // Product management
    { name: 'View Products', resource: 'products', action: 'read', description: 'View product catalog' },
    { name: 'Create Products', resource: 'products', action: 'create', description: 'Add new products' },
    { name: 'Update Products', resource: 'products', action: 'update', description: 'Edit product information' },
    { name: 'Delete Products', resource: 'products', action: 'delete', description: 'Delete products' },
    
    // Service management
    { name: 'View Services', resource: 'services', action: 'read', description: 'View service catalog' },
    { name: 'Create Services', resource: 'services', action: 'create', description: 'Add new services' },
    { name: 'Update Services', resource: 'services', action: 'update', description: 'Edit service information' },
    { name: 'Delete Services', resource: 'services', action: 'delete', description: 'Delete services' },
    
    // Quotation management
    { name: 'View Quotations', resource: 'quotations', action: 'read', description: 'View quotation list and details' },
    { name: 'Create Quotations', resource: 'quotations', action: 'create', description: 'Create new quotations' },
    { name: 'Update Quotations', resource: 'quotations', action: 'update', description: 'Edit quotation information' },
    { name: 'Delete Quotations', resource: 'quotations', action: 'delete', description: 'Delete quotations' },
    
    // Invoice management
    { name: 'View Invoices', resource: 'invoices', action: 'read', description: 'View invoice list and details' },
    { name: 'Create Invoices', resource: 'invoices', action: 'create', description: 'Create new invoices' },
    { name: 'Update Invoices', resource: 'invoices', action: 'update', description: 'Edit invoice information' },
    { name: 'Delete Invoices', resource: 'invoices', action: 'delete', description: 'Delete invoices' },
    
    // Delivery Note management
    { name: 'View Delivery Notes', resource: 'delivery-notes', action: 'read', description: 'View delivery note list and details' },
    { name: 'Create Delivery Notes', resource: 'delivery-notes', action: 'create', description: 'Create new delivery notes' },
    { name: 'Update Delivery Notes', resource: 'delivery-notes', action: 'update', description: 'Edit delivery note information' },
    { name: 'Delete Delivery Notes', resource: 'delivery-notes', action: 'delete', description: 'Delete delivery notes' },
    
    // Dashboard and reports
    { name: 'View Dashboard', resource: 'dashboard', action: 'read', description: 'Access dashboard and analytics' },
    { name: 'View Reports', resource: 'reports', action: 'read', description: 'View financial and business reports' },
  ];

  console.log('Creating permissions...');
  for (const permission of permissions) {
    await (prisma as any).permission.upsert({
      where: {
        resource_action: {
          resource: permission.resource,
          action: permission.action
        }
      },
      update: {},
      create: permission
    });
  }

  // Create roles
  console.log('Creating roles...');
  
  // Admin role - has all permissions
  const adminRole = await (prisma as any).role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'System administrator with full access',
      isSystem: true
    }
  });

  // Manager role - can manage business operations
  const managerRole = await (prisma as any).role.upsert({
    where: { name: 'manager' },
    update: {},
    create: {
      name: 'manager',
      description: 'Business manager with access to most operations',
      isSystem: true
    }
  });

  // Sales role - can manage customers, quotations, and view reports
  const salesRole = await (prisma as any).role.upsert({
    where: { name: 'sales' },
    update: {},
    create: {
      name: 'sales',
      description: 'Sales representative with customer and quotation access',
      isSystem: true
    }
  });

  // Accountant role - can manage invoices, payments, and view financial reports
  const accountantRole = await (prisma as any).role.upsert({
    where: { name: 'accountant' },
    update: {},
    create: {
      name: 'accountant',
      description: 'Accountant with access to financial operations',
      isSystem: true
    }
  });

  // Viewer role - read-only access
  const viewerRole = await (prisma as any).role.upsert({
    where: { name: 'viewer' },
    update: {},
    create: {
      name: 'viewer',
      description: 'Read-only access to view data',
      isSystem: true
    }
  });

  // Assign permissions to roles
  console.log('Assigning permissions to roles...');
  
  // Get all permissions
  const allPermissions = await (prisma as any).permission.findMany();
  
  // Admin gets all permissions
  for (const permission of allPermissions) {
    await (prisma as any).rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id
        }
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id
      }
    });
  }

  // Manager permissions (most operations except user management)
  const managerPermissions = allPermissions.filter((p: any) => 
    !['users', 'roles', 'permissions'].includes(p.resource)
  );
  for (const permission of managerPermissions) {
    await (prisma as any).rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: managerRole.id,
          permissionId: permission.id
        }
      },
      update: {},
      create: {
        roleId: managerRole.id,
        permissionId: permission.id
      }
    });
  }

  // Sales permissions (customers, quotations, products, services, dashboard)
  const salesPermissions = allPermissions.filter((p: any) => 
    ['customers', 'quotations', 'products', 'services', 'dashboard'].includes(p.resource)
  );
  for (const permission of salesPermissions) {
    await (prisma as any).rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: salesRole.id,
          permissionId: permission.id
        }
      },
      update: {},
      create: {
        roleId: salesRole.id,
        permissionId: permission.id
      }
    });
  }

  // Accountant permissions (invoices, delivery notes, payments, customers - read only, dashboard, reports)
  const accountantPermissions = allPermissions.filter((p: any) => 
    ['invoices', 'delivery-notes', 'dashboard', 'reports'].includes(p.resource) ||
    (p.resource === 'customers' && p.action === 'read')
  );
  for (const permission of accountantPermissions) {
    await (prisma as any).rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: accountantRole.id,
          permissionId: permission.id
        }
      },
      update: {},
      create: {
        roleId: accountantRole.id,
        permissionId: permission.id
      }
    });
  }

  // Viewer permissions (read-only access to most data)
  const viewerPermissions = allPermissions.filter((p: any) => 
    p.action === 'read' && !['users', 'roles', 'permissions'].includes(p.resource)
  );
  for (const permission of viewerPermissions) {
    await (prisma as any).rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: viewerRole.id,
          permissionId: permission.id
        }
      },
      update: {},
      create: {
        roleId: viewerRole.id,
        permissionId: permission.id
      }
    });
  }

  // Create default admin user
  console.log('Creating default admin user...');
  const adminPassword = await AuthService.hashPassword('admin123');
  
  const adminUser = await (prisma as any).user.upsert({
    where: { email: 'admin@quadco.com' },
    update: {},
    create: {
      email: 'admin@quadco.com',
      username: 'admin',
      firstName: 'System',
      lastName: 'Administrator',
      password: adminPassword,
      isActive: true
    }
  });

  // Assign admin role to admin user
  await (prisma as any).userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id
      }
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id
    }
  });

  console.log('User management seeding completed!');
  console.log('Default admin user created:');
  console.log('Email: admin@quadco.com');
  console.log('Password: admin123');
  console.log('Please change the password after first login.');
}

async function main() {
  try {
    await seedUserManagement();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

export { seedUserManagement };
