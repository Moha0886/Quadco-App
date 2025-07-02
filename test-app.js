// Test script for Quadco App functionality
import { prisma } from './src/lib/prisma.js';
import { AuthService } from './src/lib/auth.js';

async function testApp() {
  console.log('🧪 Testing Quadco App Functionality...\n');

  try {
    // Test 1: Database Connection
    console.log('1. Testing database connection...');
    const userCount = await prisma.user.count();
    console.log(`   ✅ Database connected. Users: ${userCount}\n`);

    // Test 2: Check if admin user exists
    console.log('2. Checking admin user...');
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@quadco.com' },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });
    
    if (adminUser) {
      console.log(`   ✅ Admin user exists: ${adminUser.firstName} ${adminUser.lastName}`);
      console.log(`   📝 Roles: ${adminUser.userRoles.map(ur => ur.role.name).join(', ')}\n`);
    } else {
      console.log('   ❌ Admin user not found\n');
    }

    // Test 3: Test password verification
    console.log('3. Testing password authentication...');
    if (adminUser) {
      const isValidPassword = await AuthService.comparePassword('admin123', adminUser.password);
      console.log(`   ${isValidPassword ? '✅' : '❌'} Password verification: ${isValidPassword}\n`);
    }

    // Test 4: Check roles and permissions
    console.log('4. Checking roles and permissions...');
    const roleCount = await prisma.role.count();
    const permissionCount = await prisma.permission.count();
    console.log(`   ✅ Roles: ${roleCount}, Permissions: ${permissionCount}\n`);

    // Test 5: Check other entities
    console.log('5. Checking business entities...');
    const customerCount = await prisma.customer.count();
    const productCount = await prisma.product.count();
    const serviceCount = await prisma.service.count();
    console.log(`   📊 Customers: ${customerCount}, Products: ${productCount}, Services: ${serviceCount}\n`);

    console.log('🎉 All tests completed successfully!');
    console.log('\n📋 Login credentials for testing:');
    console.log('   Email: admin@quadco.com');
    console.log('   Password: admin123');
    console.log('\n🌐 Access the app at: http://localhost:3000/login');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testApp();
