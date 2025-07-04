'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Customer {
  id: string;
  name: string;
  email: string;
}

interface Product {
  id: string;
  name: string;
  price: string;
  unit: string;
}

interface Service {
  id: string;
  name: string;
  basePrice: string;
  unit: string;
}

interface LineItem {
  itemType: 'PRODUCT' | 'SERVICE';
  productId?: string;
  serviceId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function NewQuotationPage() {
  const [formData, setFormData] = useState({
    customerId: '',
    validUntil: '',
    notes: '',
    taxRate: 0
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Fetch customers, products, and services
    Promise.all([
      fetch('/api/customers').then(res => res.json()),
      fetch('/api/products').then(res => res.json()),
      fetch('/api/services').then(res => res.json())
    ]).then(([customersData, productsData, servicesData]) => {
      setCustomers(customersData.customers || []);
      setProducts(productsData.products || []);
      setServices(servicesData.services || []);
    }).catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    });
  };

  const addLineItem = () => {
    setLineItems([...lineItems, {
      itemType: 'PRODUCT',
      description: '',
      quantity: 1,
      unitPrice: 0
    }]);
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-fill description and price based on product/service selection
    if (field === 'productId' && value) {
      const product = products.find(p => p.id === value);
      if (product) {
        updated[index].description = product.name;
        updated[index].unitPrice = parseFloat(product.price);
      }
    } else if (field === 'serviceId' && value) {
      const service = services.find(s => s.id === value);
      if (service) {
        updated[index].description = service.name;
        updated[index].unitPrice = parseFloat(service.basePrice);
      }
    }
    
    setLineItems(updated);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = (subtotal * formData.taxRate) / 100;
    return {
      subtotal,
      taxAmount,
      total: subtotal + taxAmount
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { subtotal, taxAmount, total } = calculateTotal();
      
      const response = await fetch('/api/quotations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          lineItems,
          subtotal,
          taxAmount,
          total
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/quotations');
      } else {
        setError(data.error || 'Failed to create quotation');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, taxAmount, total } = calculateTotal();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <Link href="/quotations" className="inline-flex items-center text-blue-600 hover:text-blue-500 font-medium transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Quotations
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
          Create New Quotation
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Create a professional quotation for your customer with detailed line items and pricing.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <form onSubmit={handleSubmit} className="divide-y divide-gray-200 dark:divide-gray-700">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quotation Details</h2>
          </div>

          <div className="p-6 space-y-8">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {/* Customer and Basic Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="customerId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Customer *
                </label>
                <select
                  id="customerId"
                  name="customerId"
                  required
                  className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all"
                  value={formData.customerId}
                  onChange={handleChange}
                >
                  <option value="">Select a customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} {customer.email && `(${customer.email})`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="validUntil" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Valid Until
                </label>
                <input
                  type="date"
                  id="validUntil"
                  name="validUntil"
                  className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all"
                  value={formData.validUntil}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Notes & Comments
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all"
                placeholder="Add any additional notes or terms for this quotation..."
                value={formData.notes}
                onChange={handleChange}
              />
            </div>

            {/* Line Items Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Line Items
                </h3>
                <button
                  type="button"
                  onClick={addLineItem}
                  className="inline-flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Item
                </button>
              </div>

              {lineItems.length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No line items added yet</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Click "Add Item" to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lineItems.map((item, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Type</label>
                          <select
                            value={item.itemType}
                            onChange={(e) => updateLineItem(index, 'itemType', e.target.value)}
                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="PRODUCT">Product</option>
                            <option value="SERVICE">Service</option>
                          </select>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                            {item.itemType === 'PRODUCT' ? 'Product' : 'Service'}
                          </label>
                          {item.itemType === 'PRODUCT' ? (
                            <select
                              value={item.productId || ''}
                              onChange={(e) => updateLineItem(index, 'productId', e.target.value)}
                              className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">Select product</option>
                              {products.map(product => (
                                <option key={product.id} value={product.id}>{product.name}</option>
                              ))}
                            </select>
                          ) : (
                            <select
                              value={item.serviceId || ''}
                              onChange={(e) => updateLineItem(index, 'serviceId', e.target.value)}
                              className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">Select service</option>
                              {services.map(service => (
                                <option key={service.id} value={service.id}>{service.name}</option>
                              ))}
                            </select>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Description</label>
                          <input
                            type="text"
                            placeholder="Item description"
                            value={item.description}
                            onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Quantity</label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="1"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Unit Price</label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={item.unitPrice}
                            onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Total</label>
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">
                              ₦{(item.quantity * item.unitPrice).toFixed(2)}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeLineItem(index)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/50 transition-all"
                              title="Remove item"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tax and Total Section */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700/50 dark:to-blue-900/20 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tax Rate (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      id="taxRate"
                      name="taxRate"
                      className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 pr-8 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all"
                      value={formData.taxRate}
                      onChange={handleChange}
                      placeholder="7.5"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm">%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                    <span className="font-medium text-gray-900 dark:text-white">₦{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Tax ({formData.taxRate}%):</span>
                    <span className="font-medium text-gray-900 dark:text-white">₦{taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-300 dark:border-gray-600 pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-gray-900 dark:text-white">Total:</span>
                      <span className="text-blue-600 dark:text-blue-400">₦{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex justify-end space-x-3">
            <Link
              href="/quotations"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !formData.customerId}
              className="inline-flex items-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Quotation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
