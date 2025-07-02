#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files and their specific fixes
const fixes = [
  // Remove unused error variables
  {
    file: 'src/app/roles/page.tsx',
    search: '  } catch (error) {\n    console.error(\'Error deleting role:\', error);',
    replace: '  } catch {\n    console.error(\'Error deleting role\');'
  },
  {
    file: 'src/app/users/[id]/page.tsx',
    search: '  } catch (error) {\n    console.error(\'Error fetching user:\', error);',
    replace: '  } catch {\n    console.error(\'Error fetching user\');'
  },
  {
    file: 'src/app/users/new/page.tsx',
    search: '  } catch (error) {\n    console.error(\'Error creating user:\', error);',
    replace: '  } catch {\n    console.error(\'Error creating user\');'
  },
  {
    file: 'src/app/profile/page.tsx',
    search: '  } catch (error) {\n    console.error(\'Error fetching user:\', error);',
    replace: '  } catch {\n    console.error(\'Error fetching user\');'
  },
  {
    file: 'src/app/profile/page.tsx',
    search: '  } catch (error) {\n    console.error(\'Error changing password:\', error);',
    replace: '  } catch {\n    console.error(\'Error changing password\');'
  },
  // Remove unused imports
  {
    file: 'src/app/delivery-notes/page.tsx',
    search: 'import { Plus, Edit, Eye, Download } from "lucide-react";',
    replace: 'import { Plus, Edit, Eye } from "lucide-react";'
  },
  {
    file: 'src/app/delivery-notes/[id]/page.tsx',
    search: 'import { ArrowLeft, Calendar, User, MapPin, Package, Truck, CheckCircle } from "lucide-react";',
    replace: 'import { ArrowLeft, Calendar, User, MapPin, Package } from "lucide-react";'
  },
  {
    file: 'src/app/invoices/page.tsx',
    search: 'import { Plus, Edit, Eye, Trash2 } from "lucide-react";',
    replace: 'import { Plus, Edit, Eye } from "lucide-react";'
  },
  {
    file: 'src/app/invoices/[id]/page.tsx',
    search: 'import { ArrowLeft, Calendar, User, MapPin, Package, FileText } from "lucide-react";',
    replace: 'import { ArrowLeft, Calendar, User, MapPin, Package } from "lucide-react";'
  },
  {
    file: 'src/app/quotations/[id]/page.tsx',
    search: 'import { ArrowLeft, Calendar, User, MapPin, Package, Edit, Trash2 } from "lucide-react";',
    replace: 'import { ArrowLeft, Calendar, User, MapPin, Package, Edit } from "lucide-react";'
  },
  // Fix unescaped quotes in JSX
  {
    file: 'src/app/invoices/[id]/edit/page.tsx',
    search: 'placeholder="Customer\'s details"',
    replace: 'placeholder="Customer&apos;s details"'
  },
  {
    file: 'src/app/invoices/new/page.tsx',
    search: 'placeholder="Customer\'s details"',
    replace: 'placeholder="Customer&apos;s details"'
  },
  {
    file: 'src/app/quotations/[id]/edit/page.tsx',
    search: 'placeholder="Customer\'s details"',
    replace: 'placeholder="Customer&apos;s details"'
  }
];

// Apply fixes
for (const fix of fixes) {
  const filePath = path.join(__dirname, fix.file);
  
  if (fs.existsSync(filePath)) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      if (content.includes(fix.search)) {
        content = content.replace(fix.search, fix.replace);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed: ${fix.file}`);
      } else {
        console.log(`Pattern not found in: ${fix.file}`);
      }
    } catch (err) {
      console.error(`Error processing ${fix.file}:`, err.message);
    }
  } else {
    console.log(`File not found: ${fix.file}`);
  }
}

console.log('Lint fixes completed!');
