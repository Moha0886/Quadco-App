#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function inspectDatabase() {
  console.log('Inspecting database schema...');
  
  try {
    // Query the database for table structure
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'line_items'
      ORDER BY ordinal_position;
    `;
    
    console.log('LineItem table columns:');
    console.table(result);
    
    // Also check quotations table
    const quotationsResult = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'quotations'
      ORDER BY ordinal_position;
    `;
    
    console.log('\nQuotations table columns:');
    console.table(quotationsResult);
    
  } catch (error) {
    console.error('Error inspecting database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

inspectDatabase();
