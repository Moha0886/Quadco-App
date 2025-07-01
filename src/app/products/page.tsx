import Link from "next/link";
import { Calculator, Package, Plus, DollarSign, Hash } from "lucide-react";
import { prisma } from "@/lib/prisma";

async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            lineItems: true
          }
        }
      }
    });
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export default async function Products() {
  const products = await getProducts();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Calculator className="h-8 w-8 text-blue-600" />
                <h1 className="ml-2 text-2xl font-bold text-gray-900">QuadCo</h1>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">
                Dashboard
              </Link>
              <Link href="/customers" className="text-gray-700 hover:text-blue-600 font-medium">
                Customers
              </Link>
              <Link href="/products" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-4">
                Products
              </Link>
              <Link href="/quotations" className="text-gray-700 hover:text-blue-600 font-medium">
                Quotations
              </Link>
              <Link href="/invoices" className="text-gray-700 hover:text-blue-600 font-medium">
                Invoices
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="mt-2 text-gray-600">
              Manage your product catalog with pricing and inventory.
            </p>
          </div>
          <Link
            href="/products/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Link>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start">
                    <Package className="h-8 w-8 text-red-600 flex-shrink-0 mt-1" />
                    <div className="ml-4 min-w-0 flex-1">
                      <h3 className="text-lg font-medium text-gray-900 break-words">
                        {product.name}
                      </h3>
                      {product.category && (
                        <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                          {product.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {product.description && (
                    <p className="mt-3 text-sm text-gray-600 line-clamp-3">
                      {product.description}
                    </p>
                  )}

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span className="font-medium">${product.price.toFixed(2)}</span>
                        <span className="ml-1">per {product.unit}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Hash className="h-4 w-4 mr-2" />
                      <span>Stock: {product.stock} {product.unit}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      Used in {product._count.lineItems} documents
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-3">
                    <Link
                      href={`/products/${product.id}`}
                      className="flex-1 text-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Edit
                    </Link>
                    <button className="flex-1 px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                      Add to Quote
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
            <p className="text-gray-500 mb-6">
              Start building your product catalog by adding your first product.
            </p>
            <Link
              href="/products/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Product
            </Link>
          </div>
        )}

        {/* Quick Stats */}
        {products.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Product Summary</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{products.length}</p>
                <p className="text-sm text-gray-500">Total Products</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  ${products.reduce((sum, product) => sum + product.price, 0).toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">Total Value</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {products.reduce((sum, product) => sum + product.stock, 0)}
                </p>
                <p className="text-sm text-gray-500">Total Stock</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
