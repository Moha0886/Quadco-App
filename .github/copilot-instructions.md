# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a business management application for generating quotations, invoices, and delivery notes for supplies businesses and service providers. The application is built with Next.js, TypeScript, and Tailwind CSS.

## Key Features
- Customer management
- Product catalog management
- Service catalog management with categories
- Supplier management
- Quotation generation (products and services)
- Invoice generation
- Delivery note generation
- PDF export functionality
- Modern responsive UI

## Tech Stack
- **Frontend**: Next.js 15 with App Router, React, TypeScript
- **Styling**: Tailwind CSS for modern, responsive design
- **Database**: Prisma ORM with SQLite (easily upgradeable to PostgreSQL)
- **PDF Generation**: React-PDF or Puppeteer for document generation
- **UI Components**: Custom components with Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **State Management**: React Context API or Zustand for global state

## Code Style Guidelines
- Use TypeScript for all components and utilities
- Follow React best practices with functional components and hooks
- Use Tailwind CSS for styling with responsive design patterns
- Implement proper error handling and loading states
- Use Server Components where appropriate for better performance
- Follow Next.js App Router patterns for routing and data fetching

## Database Schema
- Customers (id, name, email, phone, address, tax_id)
- Products (id, name, description, price, unit, category, stock)
- Services (id, name, description, base_price, unit, category_id, is_active)
- ServiceCategories (id, name, description)
- Suppliers (id, name, email, phone, address, tax_id)
- Quotations (id, customer_id, date, valid_until, status, total)
- Invoices (id, customer_id, quotation_id, date, due_date, status, total)
- DeliveryNotes (id, customer_id, invoice_id, date, delivered_date, status)
- LineItems (id, item_type, product_id?, service_id?, document_id, document_type, quantity, unit_price, total)

## Component Structure
- Use atomic design principles (atoms, molecules, organisms)
- Create reusable form components
- Implement data tables with sorting and filtering
- Build PDF preview components
- Design print-friendly layouts
