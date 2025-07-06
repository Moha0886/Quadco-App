'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

function NewInvoiceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quotationId = searchParams.get('quotationId');
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showApiNotice, setShowApiNotice] = useState(false);
  const [loadingQuotation, setLoadingQuotation] = useState(false);
  
  const [formData, setFormData] = useState({
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: '',
    taxRate: '7.5'
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0, total: 0, selectedItemId: '', selectedItemType: undefined }
  ]);

  useEffect(() => {
    const loadData = async () => {
      setLoadingItems(true);
      await Promise.all([
        fetchCustomers(),
        fetchProducts(),
        fetchServices()
      ]);
      setLoadingItems(false);
    };
    
    loadData();
    
    if (quotationId) {
      loadQuotationData(quotationId);
    }
  }, [quotationId]);

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
      console.log('Fetching products...');
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        console.log('Products fetched successfully:', data.products?.length || 0, 'products');
        console.log('Products data:', data.products);
        setProducts(data.products || []);
      } else {
        console.error('Products API failed:', response.status);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchServices = async () => {
    try {
      console.log('Fetching services...');
      const response = await fetch('/api/services');
      if (response.ok) {
        const data = await response.json();
        console.log('Services fetched successfully:', data.services?.length || 0, 'services');
        console.log('Services data:', data.services);
        setServices(data.services || []);
      } else {
        console.error('Services API failed:', response.status);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const loadQuotationData = async (id: string) => {
    try {
      setLoadingQuotation(true);
      const response = await fetch(`/api/quotations/${id}`);
      if (response.ok) {
        const quotation = await response.json();
        
        // Pre-fill form with quotation data
        setFormData({
          customerId: quotation.customerId,
          date: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          notes: quotation.notes || `Invoice generated from quotation ${quotation.quotationNumber || quotation.id}`,
          taxRate: quotation.taxRate?.toString() || '7.5'
        });
        
        // Pre-fill line items
        if (quotation.lineItems && quotation.lineItems.length > 0) {
          setLineItems(quotation.lineItems.map((item: any, index: number) => ({
            id: (index + 1).toString(),
            description: item.description,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            total: Number(item.total),
            selectedItemId: item.productId || item.serviceId || '',
            selectedItemType: item.productId ? 'product' as const : item.serviceId ? 'service' as const : undefined
          })));
        }
      }
    } catch (error) {
      console.error('Error loading quotation:', error);
      setShowApiNotice(true);
      setTimeout(() => setShowApiNotice(false), 5000);
    } finally {
      setLoadingQuotation(false);
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
        lineItems: lineItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          selectedItemId: item.selectedItemId,
          selectedItemType: item.selectedItemType
        }))
      };

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      if (response.ok) {
        router.push('/invoices');
      } else {
        const error = await response.json();
        setShowApiNotice(true);
        setTimeout(() => setShowApiNotice(false), 5000);
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
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

  const { subtotal, taxAmount, total } = calculateTotals();

  // Debug logging
  console.log('Component render - Products:', products.length, 'Services:', services.length);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/invoices"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Invoices
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {quotationId ? 'Create Invoice from Quotation' : 'Create New Invoice'}
          </h1>
          <p className="mt-2 text-gray-600">
            {quotationId 
              ? 'Review and create an invoice based on the selected quotation.'
              : 'Generate a professional invoice for your customer with itemized billing.'
            }
          </p>
          {loadingQuotation && (
            <div className="mt-2 text-blue-600">
              <span className="inline-flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading quotation data...
              </span>
            </div>
          )}
        </div>

        {/* API Notice */}
        {showApiNotice && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Creating Invoice</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>There was an error creating the invoice. Please check your data and try again.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Invoice Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="customerId" className="block text-sm font-medium text-gray-700 mb-2">
                  Customer *
                </label>
                <select
                  id="customerId"
                  name="customerId"
                  required
                  value={formData.customerId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} ({customer.email})
                    </option>
                  ))}
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
                  required
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.taxRate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Line Items</h2>
              <button
                type="button"
                onClick={addLineItem}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Item
              </button>
            </div>

            <div className="space-y-4">
              {lineItems.map((item, index) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
                  {/* Item Selector */}
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 md:col-span-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Item (Optional)
                      </label>
                      <select
                        value={item.selectedItemId ? `${item.selectedItemType}:${item.selectedItemId}` : ''}
                        onChange={(e) => handleItemSelection(item.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={loadingItems}
                      >
                        <option value="">
                          {loadingItems ? 'Loading items...' : 'Custom item (manual entry)'}
                        </option>
                        {!loadingItems && products.length > 0 && (
                          <optgroup label="Products">
                            {products.map((product) => (
                              <option key={product.id} value={`product:${product.id}`}>
                                {product.name} - ₦{parseFloat(product.price).toFixed(2)} ({product.unit})
                              </option>
                            ))}
                          </optgroup>
                        )}
                        {!loadingItems && services.length > 0 && (
                          <optgroup label="Services">
                            {services.map((service) => (
                              <option key={service.id} value={`service:${service.id}`}>
                                {service.name} - ₦{parseFloat(service.basePrice).toFixed(2)} ({service.unit})
                              </option>
                            ))}
                          </optgroup>
                        )}
                        {!loadingItems && products.length === 0 && services.length === 0 && (
                          <option value="" disabled>No items available</option>
                        )}
                      </select>
                    </div>
                    <div className="col-span-12 md:col-span-6 flex items-end">
                      <button
                        type="button"
                        onClick={() => removeLineItem(item.id)}
                        disabled={lineItems.length === 1}
                        className="w-full px-3 py-2 text-sm text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed border border-red-300 rounded-md hover:bg-red-50"
                      >
                        <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove Item
                      </button>
                    </div>
                  </div>

                  {/* Item Details */}
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 md:col-span-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <input
                        type="text"
                        required
                        value={item.description}
                        onChange={(e) => handleLineItemChange(item.id, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Item description"
                      />
                    </div>

                    <div className="col-span-4 md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Qty *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleLineItemChange(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="col-span-4 md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unit Price (₦) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleLineItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="col-span-4 md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount (₦)
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700 font-medium">
                        ₦{item.total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="max-w-md ml-auto">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">₦{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax ({formData.taxRate}%):</span>
                  <span className="font-medium">₦{taxAmount.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span>₦{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Additional notes or payment terms..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4">
            <Link
              href="/invoices"
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </form>

        {/* Development Notice */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Invoice Creation Active</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>This invoice creation form is fully operational and connected to the backend API. You can create professional invoices with automatic calculations, customer integration, and line item management. All created invoices will be saved to the database and accessible from the invoices list.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewInvoicePage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    }>
      <NewInvoiceForm />
    </Suspense>
  );
}
