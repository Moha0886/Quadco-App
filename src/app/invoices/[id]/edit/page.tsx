'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Customer {
  id: string;
  name: string;
  email: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  unit: string;
  category: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  basePrice: string;
  unit: string;
  category?: {
    name: string;
  };
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  selectedItemId?: string;
  selectedItemType?: 'product' | 'service';
}

interface Invoice {
  id: string;
  customerId: string;
  date: string;
  dueDate?: string;
  status: string;
  notes?: string;
  taxRate: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  lineItems: {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    productId?: string;
    serviceId?: string;
    product?: Product;
    service?: Service;
  }[];
}

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params?.id as string;
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loadingInvoice, setLoadingInvoice] = useState(true);
  const [loadingItems, setLoadingItems] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showApiNotice, setShowApiNotice] = useState(false);
  
  const [formData, setFormData] = useState({
    customerId: '',
    date: '',
    dueDate: '',
    notes: '',
    taxRate: '7.5',
    status: 'DRAFT'
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoadingItems(true);
      await Promise.all([
        fetchCustomers(),
        fetchProducts(),
        fetchServices(),
        fetchInvoice()
      ]);
      setLoadingItems(false);
    };
    
    loadData();
  }, [invoiceId]);

  const fetchInvoice = async () => {
    try {
      setLoadingInvoice(true);
      setError(null);
      const response = await fetch(`/api/invoices/${invoiceId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch invoice');
      }
      const data = await response.json();
      const invoiceData = data.invoice;
      setInvoice(invoiceData);
      
      // Pre-fill form with invoice data
      setFormData({
        customerId: invoiceData.customerId,
        date: invoiceData.date.split('T')[0], // Convert to YYYY-MM-DD format
        dueDate: invoiceData.dueDate ? invoiceData.dueDate.split('T')[0] : '',
        notes: invoiceData.notes || '',
        taxRate: invoiceData.taxRate.toString(),
        status: invoiceData.status
      });
      
      // Pre-fill line items
      if (invoiceData.lineItems && invoiceData.lineItems.length > 0) {
        setLineItems(invoiceData.lineItems.map((item: any, index: number) => ({
          id: (index + 1).toString(),
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          total: Number(item.total),
          selectedItemId: item.productId || item.serviceId || '',
          selectedItemType: item.productId ? 'product' as const : item.serviceId ? 'service' as const : undefined
        })));
      } else {
        setLineItems([
          { id: '1', description: '', quantity: 1, unitPrice: 0, total: 0, selectedItemId: '', selectedItemType: undefined }
        ]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoice');
    } finally {
      setLoadingInvoice(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers || []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      // Fallback demo data
      setCustomers([
        { id: '1', name: 'Demo Customer 1', email: 'demo1@example.com' },
        { id: '2', name: 'Demo Customer 2', email: 'demo2@example.com' }
      ]);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services');
      if (response.ok) {
        const data = await response.json();
        setServices(data.services || []);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLineItemChange = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = updated.quantity * updated.unitPrice;
        }
        return updated;
      }
      return item;
    }));
  };

  const addLineItem = () => {
    const newId = (lineItems.length + 1).toString();
    setLineItems(prev => [...prev, {
      id: newId,
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
      selectedItemId: '',
      selectedItemType: undefined
    }]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = subtotal * (parseFloat(formData.taxRate) / 100);
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const invoiceData = {
        customerId: formData.customerId,
        date: formData.date,
        dueDate: formData.dueDate,
        notes: formData.notes,
        taxRate: formData.taxRate,
        status: formData.status,
        lineItems: lineItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
          itemType: item.selectedItemType === 'product' ? 'PRODUCT' : item.selectedItemType === 'service' ? 'SERVICE' : 'CUSTOM',
          productId: item.selectedItemType === 'product' ? item.selectedItemId : null,
          serviceId: item.selectedItemType === 'service' ? item.selectedItemId : null
        }))
      };

      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      if (response.ok) {
        router.push(`/invoices/${invoiceId}`);
      } else {
        const error = await response.json();
        console.error('Update error:', error);
        setShowApiNotice(true);
        setTimeout(() => setShowApiNotice(false), 5000);
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
      setShowApiNotice(true);
      setTimeout(() => setShowApiNotice(false), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelection = (lineItemId: string, selectedValue: string) => {
    if (!selectedValue) {
      // Clear selection
      setLineItems(prev => prev.map(item => 
        item.id === lineItemId 
          ? { ...item, selectedItemId: '', selectedItemType: undefined, description: '', unitPrice: 0, total: 0 }
          : item
      ));
      return;
    }

    const [itemType, itemId] = selectedValue.split(':');
    let selectedItem: Product | Service | null = null;
    
    if (itemType === 'product') {
      selectedItem = products.find(p => p.id === itemId) || null;
    } else if (itemType === 'service') {
      selectedItem = services.find(s => s.id === itemId) || null;
    }

    if (selectedItem) {
      setLineItems(prev => prev.map(item => {
        if (item.id === lineItemId) {
          const unitPrice = itemType === 'product' 
            ? parseFloat((selectedItem as Product).price) 
            : parseFloat((selectedItem as Service).basePrice);
          
          return {
            ...item,
            selectedItemId: itemId,
            selectedItemType: itemType as 'product' | 'service',
            description: `${selectedItem.name} - ${selectedItem.description}`,
            unitPrice: unitPrice,
            total: item.quantity * unitPrice
          };
        }
        return item;
      }));
    }
  };

  if (loadingInvoice || loadingItems) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <Link href="/invoices" className="text-sm font-medium text-red-800 hover:text-red-600">
                    ← Back to Invoices
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Invoice Not Found</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>The invoice you're trying to edit could not be found.</p>
                </div>
                <div className="mt-4">
                  <Link href="/invoices" className="text-sm font-medium text-yellow-800 hover:text-yellow-600">
                    ← Back to Invoices
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { subtotal, taxAmount, total } = calculateTotals();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Invoice</h1>
            <p className="text-gray-600 mt-2">Update invoice details and line items</p>
          </div>
          <Link 
            href={`/invoices/${invoiceId}`}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </Link>
        </div>

        {/* API Notice */}
        {showApiNotice && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Update Failed</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>There was an error updating the invoice. Please try again.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Invoice Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Invoice Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="customerId" className="block text-sm font-medium text-gray-700 mb-2">
                  Customer *
                </label>
                <select
                  id="customerId"
                  name="customerId"
                  value={formData.customerId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} ({customer.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="SENT">Sent</option>
                  <option value="PAID">Paid</option>
                  <option value="PARTIALLY_PAID">Partially Paid</option>
                  <option value="OVERDUE">Overdue</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700 mb-2">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  id="taxRate"
                  name="taxRate"
                  value={formData.taxRate}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Additional notes for this invoice..."
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Line Items</h2>
              <button
                type="button"
                onClick={addLineItem}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Item
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Item</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Description</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Qty</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Unit Price</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Total</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-3 px-3">
                        <select
                          value={item.selectedItemId && item.selectedItemType ? `${item.selectedItemType}:${item.selectedItemId}` : ''}
                          onChange={(e) => handleItemSelection(item.id, e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                          <option value="">Custom Item</option>
                          {products.length > 0 && (
                            <optgroup label="Products">
                              {products.map((product) => (
                                <option key={`product-${product.id}`} value={`product:${product.id}`}>
                                  {product.name} (${product.price})
                                </option>
                              ))}
                            </optgroup>
                          )}
                          {services.length > 0 && (
                            <optgroup label="Services">
                              {services.map((service) => (
                                <option key={`service-${service.id}`} value={`service:${service.id}`}>
                                  {service.name} (${service.basePrice})
                                </option>
                              ))}
                            </optgroup>
                          )}
                        </select>
                      </td>
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleLineItemChange(item.id, 'description', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          placeholder="Item description"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleLineItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleLineItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-sm font-medium">${item.total.toFixed(2)}</span>
                      </td>
                      <td className="py-3 px-3">
                        {lineItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLineItem(item.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Totals</h2>
            
            <div className="space-y-2 max-w-md ml-auto">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax ({formData.taxRate}%):</span>
                <span className="font-medium">${taxAmount.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-lg font-semibold">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Link
              href={`/invoices/${invoiceId}`}
              className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
