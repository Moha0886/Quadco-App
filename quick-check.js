const fs = require('fs');

console.log('🔍 Quick validation check...');

// Check key files exist
const requiredFiles = [
  'package.json',
  'next.config.ts',
  'src/app/layout.tsx',
  'src/app/page.tsx',
  'prisma/schema.prisma'
];

let allGood = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} missing`);
    allGood = false;
  }
});

// Check if TypeScript config is valid
try {
  const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
  console.log('✅ tsconfig.json is valid JSON');
} catch (e) {
  console.log('❌ tsconfig.json has issues');
  allGood = false;
}

// Check package.json scripts
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (pkg.scripts && pkg.scripts.build) {
    console.log('✅ Build script exists');
  } else {
    console.log('❌ Build script missing');
    allGood = false;
  }
} catch (e) {
  console.log('❌ package.json issues');
  allGood = false;
}

if (allGood) {
  console.log('\n🎉 Basic validation passed!');
  console.log('📦 Project structure looks good');
} else {
  console.log('\n❌ Some issues found');
}
