#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Function to fix a file
function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Fix (prisma as any) casts
    const prismaFixes = [
      { from: '(prisma as any).customer', to: 'prisma.customer' },
      { from: '(prisma as any).user', to: 'prisma.user' },
      { from: '(prisma as any).role', to: 'prisma.role' },
      { from: '(prisma as any).permission', to: 'prisma.permission' },
      { from: '(prisma as any).payment', to: 'prisma.payment' },
      { from: '(prisma as any).quotation', to: 'prisma.quotation' },
      { from: '(prisma as any).invoice', to: 'prisma.invoice' },
      { from: '(prisma as any).product', to: 'prisma.product' },
      { from: '(prisma as any).service', to: 'prisma.service' },
      { from: '(prisma as any).deliveryNote', to: 'prisma.deliveryNote' }
    ];

    for (const fix of prismaFixes) {
      if (content.includes(fix.from)) {
        content = content.replace(new RegExp(fix.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fix.to);
        changed = true;
      }
    }

    // Fix catch blocks with unused error
    const catchFixes = [
      { from: '} catch (error) {\n    console.error(', to: '} catch (error: unknown) {\n    console.error(' },
      { from: '} catch (error) {\n      console.error(', to: '} catch (error: unknown) {\n      console.error(' },
      { from: '} catch (error) {\n        console.error(', to: '} catch (error: unknown) {\n        console.error(' }
    ];

    for (const fix of catchFixes) {
      if (content.includes(fix.from)) {
        content = content.replace(new RegExp(fix.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fix.to);
        changed = true;
      }
    }

    // Fix any types in reduce functions
    const anyTypeFixes = [
      { from: 'item: any)', to: 'item)' },
      { from: 'sum: number, item: any)', to: 'sum: number, item)' },
      { from: 'sum: number, payment: any)', to: 'sum: number, payment)' },
      { from: '.map((ur: any) =>', to: '.map((ur) =>' },
      { from: '.map((rp: any) =>', to: '.map((rp) =>' },
      { from: '.map((role: any) =>', to: '.map((role) =>' },
      { from: '.map((permission: any) =>', to: '.map((permission) =>' },
      { from: '.map((user: any) =>', to: '.map((user) =>' },
      { from: '.map((payment: any) =>', to: '.map((payment) =>' },
      { from: '.map((invoice: any) =>', to: '.map((invoice) =>' },
      { from: '.map((p: any) =>', to: '.map((p) =>' }
    ];

    for (const fix of anyTypeFixes) {
      if (content.includes(fix.from)) {
        content = content.replace(new RegExp(fix.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fix.to);
        changed = true;
      }
    }

    // Fix specific type casts
    const typeCastFixes = [
      { from: '(lineItem as any).itemType', to: 'lineItem.itemType' },
      { from: '(lineItem as any).productId', to: 'lineItem.productId' },
      { from: '(lineItem as any).serviceId', to: 'lineItem.serviceId' },
      { from: '(invoice as any).payments', to: 'invoice.payments' },
      { from: '} as any);', to: '});' }
    ];

    for (const fix of typeCastFixes) {
      if (content.includes(fix.from)) {
        content = content.replace(new RegExp(fix.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fix.to);
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed: ${filePath}`);
      return true;
    }
    return false;
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err.message);
    return false;
  }
}

// Find all TypeScript files in API routes
const apiFiles = glob.sync('src/app/api/**/*.ts', { cwd: __dirname });

let totalFixed = 0;
for (const file of apiFiles) {
  const filePath = path.join(__dirname, file);
  if (fixFile(filePath)) {
    totalFixed++;
  }
}

console.log(`\nCompleted! Fixed ${totalFixed} files.`);
