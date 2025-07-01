"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

interface Customer {
  id: string;
  name: string;
  email: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
}

interface Service {
  id: string;
  name: string;
  basePrice: number;
  unit: string;
  category: {
    name: string;
  };
}

interface LineItem {
  id: string;
  itemType: "product" | "service";
  productId?: string;
  serviceId?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  description?: string;
}

export default function NewQuotationPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [formData, setFormData] = useState({
    customerId: "",
    validUntil: "",
    notes: "",
  });
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
    
    // Set default valid until date (30 days from now)
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);
    setFormData(prev => ({
      ...prev,
      validUntil: validUntil.toISOString().split('T')[0]
    }));
  }, []);

  const fetchData = async () => {
    try {
      const [customersRes, productsRes, servicesRes] = await Promise.all([
        fetch("/api/customers"),
        fetch("/api/products"),
        fetch("/api/services"),
      ]);
      
      if (customersRes.ok && productsRes.ok && servicesRes.ok) {
        const [customersData, productsData, servicesData] = await Promise.all([
          customersRes.json(),
          productsRes.json(),
          servicesRes.json(),
        ]);
        
        setCustomers(customersData);
        setProducts(productsData);
        setServices(servicesData);
        
        if (customersData.length > 0) {
          setFormData(prev => ({ ...prev, customerId: customersData[0].id }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      itemType: "product",
      productId: products.length > 0 ? products[0].id : "",
      quantity: 1,
      unitPrice: products.length > 0 ? products[0].price : 0,
      total: products.length > 0 ? products[0].price : 0,
      description: "",
    };
    setLineItems([...lineItems, newItem]);
  };

  const updateLineItem = (index: number, updates: Partial<LineItem>) => {
    const updatedItems = [...lineItems];
    updatedItems[index] = { ...updatedItems[index], ...updates };
    
    // Recalculate total when quantity or unit price changes
    if (updates.quantity !== undefined || updates.unitPrice !== undefined) {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unitPrice;
    }
    
    // Update unit price when item is changed
    if (updates.productId !== undefined && updates.itemType === "product") {
      const product = products.find(p => p.id === updates.productId);
      if (product) {
        updatedItems[index].unitPrice = product.price;
        updatedItems[index].total = updatedItems[index].quantity * product.price;
      }
    }
    
    if (updates.serviceId !== undefined && updates.itemType === "service") {
      const service = services.find(s => s.id === updates.serviceId);
      if (service) {
        updatedItems[index].unitPrice = service.basePrice;
        updatedItems[index].total = updatedItems[index].quantity * service.basePrice;
      }
    }
    
    setLineItems(updatedItems);
  };

  const removeLineItem = (index: number) => {
    const updatedItems = lineItems.filter((_, i) => i !== index);
    setLineItems(updatedItems);
  };

  const calculateGrandTotal = () => {
    return lineItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (lineItems.length === 0) {
      setError("Please add at least one line item");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/quotations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          lineItems: lineItems.map(item => ({
            itemType: item.itemType,
            productId: item.itemType === "product" ? item.productId : null,
            serviceId: item.itemType === "service" ? item.serviceId : null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
            description: item.description,
          })),
        }),
      });

      if (response.ok) {
        router.push("/quotations");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to create quotation");
      }
    } catch (error) {
      console.error("Error creating quotation:", error);
      setError("Failed to create quotation");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (customers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
          <p className="mt-1 text-sm text-gray-500">You need to create a customer first.</p>
          <div className="mt-6">
            <Link
              href="/customers/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Create Customer
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Link
                href="/quotations"
                className="mr-4 p-2 rounded-md hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">New Quotation</h1>
                <p className="text-sm text-gray-600">Create a new quotation for products and services</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Quotation Details</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">
                  Customer *
                </label>
                <select
                  id="customerId"
                  name="customerId"
                  required
                  value={formData.customerId}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} ({customer.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="validUntil" className="block text-sm font-medium text-gray-700">
                  Valid Until *
                </label>
                <input
                  type="date"
                  id="validUntil"
                  name="validUntil"
                  required
                  value={formData.validUntil}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Additional notes or terms for this quotation"
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Line Items</h3>
              <button
                type="button"
                onClick={addLineItem}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center text-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </button>
            </div>

            {lineItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No line items added yet. Click &quot;Add Item&quot; to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {lineItems.map((item, index) => (
                  <div key={item.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-6 items-end">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Type</label>
                        <select
                          value={item.itemType}
                          onChange={(e) => updateLineItem(index, { 
                            itemType: e.target.value as "product" | "service",
                            productId: e.target.value === "product" ? (products[0]?.id || "") : undefined,
                            serviceId: e.target.value === "service" ? (services[0]?.id || "") : undefined,
                          })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                          <option value="product">Product</option>
                          <option value="service">Service</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {item.itemType === "product" ? "Product" : "Service"}
                        </label>
                        {item.itemType === "product" ? (
                          <select
                            value={item.productId || ""}
                            onChange={(e) => updateLineItem(index, { productId: e.target.value })}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                          >
                            {products.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name} (${product.price}/{product.unit})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <select
                            value={item.serviceId || ""}
                            onChange={(e) => updateLineItem(index, { serviceId: e.target.value })}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                          >
                            {services.map((service) => (
                              <option key={service.id} value={service.id}>
                                {service.name} (${service.basePrice}/{service.unit})
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Quantity</label>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(index, { quantity: parseFloat(e.target.value) || 0 })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Unit Price</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateLineItem(index, { unitPrice: parseFloat(e.target.value) || 0 })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>

                      <div className="flex items-end space-x-2">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700">Total</label>
                          <div className="mt-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm font-medium">
                            ${item.total.toFixed(2)}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLineItem(index)}
                          className="p-2 text-red-600 hover:text-red-900"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Description field */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                      <input
                        type="text"
                        value={item.description || ""}
                        onChange={(e) => updateLineItem(index, { description: e.target.value })}
                        placeholder="Additional description for this line item"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </div>
                ))}

                {/* Grand Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-end">
                    <div className="text-right">
                      <div className="text-lg font-medium text-gray-900">
                        Grand Total: ${calculateGrandTotal().toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3">
            <Link
              href="/quotations"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || lineItems.length === 0}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Quotation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
