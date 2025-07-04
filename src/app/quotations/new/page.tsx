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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/quotations" className="text-blue-600 hover:text-blue-500 font-medium">
            ← Back to Quotations
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
            Create New Quotation
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Create a professional quotation for your customer.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="customerId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Customer *
                </label>
                <select
                  id="customerId"
                  name="customerId"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
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

              <div>
                <label htmlFor="validUntil" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Valid Until
                </label>
                <input
                  type="date"
                  id="validUntil"
                  name="validUntil"
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                  value={formData.validUntil}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                value={formData.notes}
                onChange={handleChange}
              />
            </div>

            {/* Line Items */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Line Items</h3>
                <button
                  type="button"
                  onClick={addLineItem}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Item
                </button>
              </div>

              {lineItems.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3 p-3 border border-gray-200 dark:border-gray-600 rounded-md">
                  <div>
                    <select
                      value={item.itemType}
                      onChange={(e) => updateLineItem(index, 'itemType', e.target.value)}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="PRODUCT">Product</option>
                      <option value="SERVICE">Service</option>
                    </select>
                  </div>
                  
                  <div>
                    {item.itemType === 'PRODUCT' ? (
                      <select
                        value={item.productId || ''}
                        onChange={(e) => updateLineItem(index, 'productId', e.target.value)}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Select service</option>
                        {services.map(service => (
                          <option key={service.id} value={service.id}>{service.name}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <input
                      type="number"
                      placeholder="Quantity"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Unit Price"
                      value={item.unitPrice}
                      onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      ₦{(item.quantity * item.unitPrice).toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeLineItem(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Tax and Total */}
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    id="taxRate"
                    name="taxRate"
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                    value={formData.taxRate}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₦{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({formData.taxRate}%):</span>
                    <span>₦{taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>₦{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Link
                href="/quotations"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || !formData.customerId}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Quotation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
