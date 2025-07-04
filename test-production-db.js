const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabase() {
  console.log('🔍 Testing Production Database Connection...');
  
  try {
    // Test database connection
    const userCount = await prisma.user.count();
    console.log(`✅ Database connected successfully`);
    console.log(`👥 Total users: ${userCount}`);
    
    // Test if admin user exists
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@quadco.com' },
      include: { role: true }
    });
    
    if (adminUser) {
      console.log(`✅ Admin user found:`);
      console.log(`   📧 Email: ${adminUser.email}`);
      console.log(`   👤 Role: ${adminUser.role.name}`);
      console.log(`   🆔 ID: ${adminUser.id}`);
    } else {
      console.log('❌ Admin user not found');
    }
    
    // Test roles
    const roles = await prisma.role.findMany();
    console.log(`✅ Roles found: ${roles.map(r => r.name).join(', ')}`);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
