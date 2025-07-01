# QuadCo - Business Document Management System

A modern web application for generating quotations, invoices, and delivery notes for supplies businesses and service providers. Built with Next.js, TypeScript, and Prisma.

## Features

- **Customer Management** - Maintain customer directory with contact information
- **Product Catalog** - Manage products with pricing, descriptions, and inventory
- **Service Management** - Organize services by categories with flexible pricing models
- **Quotation Generation** - Create professional quotations with products and services
- **Invoice Management** - Generate invoices from quotations with payment tracking
- **Delivery Notes** - Track deliveries and manage shipping documentation
- **PDF Export** - Generate professional PDF documents for all business documents
- **Dashboard Analytics** - Overview of business operations and recent activity
- **Responsive Design** - Modern, mobile-friendly interface

## Business Models Supported

- **Supplies Business** - Traditional product-based business with inventory management
- **Service Provision** - Service-based business with categorized offerings
- **Hybrid Business** - Combination of products and services in the same documents

## Tech Stack

- **Frontend**: Next.js 15 with App Router, React, TypeScript
- **Styling**: Tailwind CSS for responsive design
- **Database**: Prisma ORM with SQLite (easily upgradeable to PostgreSQL)
- **Icons**: Lucide React for modern icons
- **PDF Generation**: React-PDF for document generation
- **Form Handling**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, pnpm, or bun package manager

### Installation

1. Clone the repository or use this project
2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up the database:

```bash
npx prisma generate
npx prisma migrate dev
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) to view the application

## Database Schema

The application uses the following main entities:

- **Customers** - Customer information and contact details
- **Products** - Product catalog with pricing and inventory
- **Suppliers** - Supplier information and contacts
- **Quotations** - Customer quotations with line items
- **Invoices** - Generated invoices with payment tracking
- **Delivery Notes** - Shipping and delivery documentation
- **Line Items** - Individual items on documents

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard page
│   ├── customers/         # Customer management
│   ├── products/          # Product management
│   ├── quotations/        # Quotation management
│   ├── invoices/          # Invoice management
│   └── delivery-notes/    # Delivery note management
├── lib/                   # Utility libraries
│   └── prisma.ts         # Database connection
└── components/            # Reusable React components
    └── ui/               # UI component library
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="file:./dev.db"

# Optional: Add other environment variables as needed
```

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [Prisma Documentation](https://prisma.io/docs) - Database ORM and migrations
- [Tailwind CSS](https://tailwindcss.com/docs) - Utility-first CSS framework
- [TypeScript](https://www.typescriptlang.org/docs) - Static type checking

## Deployment

The application can be deployed on any platform that supports Next.js:

- [Vercel](https://vercel.com) - Recommended for Next.js applications
- [Netlify](https://netlify.com) - Alternative deployment platform
- [Railway](https://railway.app) - For database hosting

For database in production, consider upgrading from SQLite to PostgreSQL.

## License

This project is licensed under the MIT License.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
