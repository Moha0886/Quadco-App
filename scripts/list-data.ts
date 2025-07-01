import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== QUOTATIONS ===');
  const quotations = await prisma.quotation.findMany({
    include: {
      customer: {
        select: { name: true }
      }
    }
  });
  
  quotations.forEach(q => {
    console.log(`ID: ${q.id}, Status: ${q.status}, Customer: ${q.customer.name}, Total: $${q.total}`);
  });

  console.log('\n=== INVOICES ===');
  const invoices = await prisma.invoice.findMany({
    include: {
      customer: {
        select: { name: true }
      }
    }
  });
  
  invoices.forEach(i => {
    console.log(`ID: ${i.id}, Number: ${i.invoiceNumber}, Status: ${i.status}, Customer: ${i.customer.name}, Total: $${i.total}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
