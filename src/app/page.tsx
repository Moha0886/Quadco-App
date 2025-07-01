import Link from "next/link";
import Image from "next/image";
import { FileText, Users, Package, Calculator, FileSpreadsheet, Truck, Settings } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-full">
      {/* Header with Logo */}
      <div className="text-center mb-8">
        <div className="flex justify-center items-center mb-6">
          <div className="relative h-16 w-16 bg-blue-100 rounded-full p-2 flex items-center justify-center mr-4">
            <Image
              src="/quadco-logo.png"
              alt="Quadco Consults Limited"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <div className="text-left">
            <h2 className="text-2xl font-bold text-gray-900">Quadco Consults Limited</h2>
            <p className="text-blue-600 font-medium">Business Management System</p>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
          Business Document
          <span className="text-blue-600"> Management</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Generate professional quotations, invoices, and delivery notes for your supplies business and service provision. 
          Streamline your workflow with our modern, intuitive platform.
        </p>
        <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
          <div className="rounded-md shadow">
            <Link
              href="/dashboard"
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mt-20">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Quotations */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <h3 className="ml-3 text-lg font-medium text-gray-900">Quotations</h3>
            </div>
            <p className="mt-2 text-base text-gray-500">
              Create professional quotations with detailed line items and customizable templates.
            </p>
            <Link
              href="/quotations"
              className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              Manage Quotations →
            </Link>
          </div>

          {/* Invoices */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <FileSpreadsheet className="h-8 w-8 text-green-600" />
              <h3 className="ml-3 text-lg font-medium text-gray-900">Invoices</h3>
            </div>
            <p className="mt-2 text-base text-gray-500">
              Generate invoices from quotations with automatic calculations and payment tracking.
            </p>
            <Link
              href="/invoices"
              className="mt-4 inline-flex items-center text-green-600 hover:text-green-800"
            >
              Manage Invoices →
            </Link>
          </div>

          {/* Delivery Notes */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-purple-600" />
              <h3 className="ml-3 text-lg font-medium text-gray-900">Delivery Notes</h3>
            </div>
            <p className="mt-2 text-base text-gray-500">
              Track deliveries with detailed delivery notes and status updates.
            </p>
            <Link
              href="/delivery-notes"
              className="mt-4 inline-flex items-center text-purple-600 hover:text-purple-800"
            >
              Manage Deliveries →
            </Link>
          </div>

          {/* Customers */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-orange-600" />
              <h3 className="ml-3 text-lg font-medium text-gray-900">Customers</h3>
            </div>
            <p className="mt-2 text-base text-gray-500">
              Manage customer information, contact details, and transaction history.
            </p>
            <Link
              href="/customers"
              className="mt-4 inline-flex items-center text-orange-600 hover:text-orange-800"
            >
              Manage Customers →
            </Link>
          </div>

          {/* Products */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-red-600" />
              <h3 className="ml-3 text-lg font-medium text-gray-900">Products</h3>
            </div>
            <p className="mt-2 text-base text-gray-500">
              Maintain product catalog with pricing, descriptions, and inventory levels.
            </p>
            <Link
              href="/products"
              className="mt-4 inline-flex items-center text-red-600 hover:text-red-800"
            >
              Manage Products →
            </Link>
          </div>

          {/* Services */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-teal-600" />
              <h3 className="ml-3 text-lg font-medium text-gray-900">Services</h3>
            </div>
            <p className="mt-2 text-base text-gray-500">
              Manage service categories and offerings with flexible pricing models.
            </p>
            <Link
              href="/services"
              className="mt-4 inline-flex items-center text-teal-600 hover:text-teal-800"
            >
              Manage Services →
            </Link>
          </div>

          {/* Reports */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <Calculator className="h-8 w-8 text-indigo-600" />
              <h3 className="ml-3 text-lg font-medium text-gray-900">Reports</h3>
            </div>
            <p className="mt-2 text-base text-gray-500">
              Generate business reports and analytics to track performance and growth.
            </p>
            <Link
              href="/reports"
              className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-800"
            >
              View Reports →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
