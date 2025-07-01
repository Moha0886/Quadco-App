import Link from "next/link";
import { Calculator, FileText, FileSpreadsheet, Truck, Users, Package, Plus, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";

async function getDashboardStats() {
  try {
    const [customers, products, quotations, invoices, deliveryNotes] = await Promise.all([
      prisma.customer.count(),
      prisma.product.count(),
      prisma.quotation.count(),
      prisma.invoice.count(),
      prisma.deliveryNote.count(),
    ]);

    const recentQuotations = await prisma.quotation.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: { name: true }
        }
      }
    });

    return {
      customers,
      products,
      quotations,
      invoices,
      deliveryNotes,
      recentQuotations
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      customers: 0,
      products: 0,
      quotations: 0,
      invoices: 0,
      deliveryNotes: 0,
      recentQuotations: []
    };
  }
}

export default async function Dashboard() {
  const stats = await getDashboardStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to Quadco Consults Limited Business Management System</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Customers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.customers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.products}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Quotations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.quotations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FileSpreadsheet className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Invoices</p>
                <p className="text-2xl font-bold text-gray-900">{stats.invoices}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Deliveries</p>
                <p className="text-2xl font-bold text-gray-900">{stats.deliveryNotes}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6 space-y-4">
              <Link
                href="/quotations/new"
                className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus className="h-5 w-5 text-blue-600" />
                <span className="ml-3 text-blue-900 font-medium">Create New Quotation</span>
              </Link>
              <Link
                href="/invoices/new"
                className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Plus className="h-5 w-5 text-green-600" />
                <span className="ml-3 text-green-900 font-medium">Create New Invoice</span>
              </Link>
              <Link
                href="/customers/new"
                className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <Plus className="h-5 w-5 text-orange-600" />
                <span className="ml-3 text-orange-900 font-medium">Add New Customer</span>
              </Link>
              <Link
                href="/products/new"
                className="flex items-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Plus className="h-5 w-5 text-red-600" />
                <span className="ml-3 text-red-900 font-medium">Add New Product</span>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Quotations</h2>
            </div>
            <div className="p-6">
              {stats.recentQuotations.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentQuotations.map((quotation) => (
                    <div key={quotation.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{quotation.customer.name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(quotation.date).toLocaleDateString()} • ${quotation.total.toFixed(2)}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        quotation.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        quotation.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                        quotation.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {quotation.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No quotations yet</p>
                  <Link
                    href="/quotations/new"
                    className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    Create your first quotation →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/quotations"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <h3 className="ml-3 text-lg font-medium text-gray-900">Manage Quotations</h3>
            </div>
            <p className="mt-2 text-gray-500">
              Create, edit, and track quotations for your customers.
            </p>
          </Link>

          <Link
            href="/invoices"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <FileSpreadsheet className="h-8 w-8 text-green-600" />
              <h3 className="ml-3 text-lg font-medium text-gray-900">Manage Invoices</h3>
            </div>
            <p className="mt-2 text-gray-500">
              Generate and track invoices from quotations.
            </p>
          </Link>

          <Link
            href="/delivery-notes"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-purple-600" />
              <h3 className="ml-3 text-lg font-medium text-gray-900">Delivery Notes</h3>
            </div>
            <p className="mt-2 text-gray-500">
              Track and manage product deliveries.
            </p>
          </Link>

          <Link
            href="/customers"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <Users className="h-8 w-8 text-orange-600" />
              <h3 className="ml-3 text-lg font-medium text-gray-900">Customer Directory</h3>
            </div>
            <p className="mt-2 text-gray-500">
              Manage customer information and contacts.
            </p>
          </Link>

          <Link
            href="/products"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <Package className="h-8 w-8 text-red-600" />
              <h3 className="ml-3 text-lg font-medium text-gray-900">Product Catalog</h3>
            </div>
            <p className="mt-2 text-gray-500">
              Maintain your product inventory and pricing.
            </p>
          </Link>

          <Link
            href="/services"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <Calculator className="h-8 w-8 text-indigo-600" />
              <h3 className="ml-3 text-lg font-medium text-gray-900">Service Catalog</h3>
            </div>
            <p className="mt-2 text-gray-500">
              Manage services and service categories.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
