"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Customer {
  id: string;
  name: string;
  email: string;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  unit: string;
}

interface Service {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  unit: string;
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

interface Invoice {
  id: string;
  customerId: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  status: string;
  total: number;
  notes?: string;
  customer: Customer;
  lineItems: LineItem[];
}

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    customerId: "",
    dueDate: "",
    status: "draft",
    notes: "",
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const [invoiceRes, customersRes, productsRes, servicesRes] = await Promise.all([
        fetch(`/api/invoices/${params.id}`),
        fetch("/api/customers"),
        fetch("/api/products"),
        fetch("/api/services"),
      ]);

      if (invoiceRes.ok) {
        const invoiceData = await invoiceRes.json();
        setInvoice(invoiceData);
        setFormData({
          customerId: invoiceData.customerId,
          dueDate: invoiceData.dueDate.split('T')[0],
          status: invoiceData.status,
          notes: invoiceData.notes || "",
        });
        setLineItems(invoiceData.lineItems.map((item: {
          id: string;
          itemType: string;
          productId?: string;
          serviceId?: string;
          quantity: number;
          unitPrice: number;
          total: number;
          description?: string;
        }) => ({
          id: item.id,
          itemType: item.itemType,
          productId: item.productId,
          serviceId: item.serviceId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
          description: item.description,
        })));
      }

      if (customersRes.ok) {
        const customersData = await customersRes.json();
        setCustomers(customersData);
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData);
      }

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        setServices(servicesData);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchData();
    }
  }, [params.id, fetchData]);

  const addLineItem = () => {
    const newItem: LineItem = {
      id: `temp-${Date.now()}`,
      itemType: "product",
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setLineItems([...lineItems, newItem]);
  };

  const updateLineItem = (id: string, updates: Partial<LineItem>) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, ...updates };
          
          // Auto-populate price when product/service is selected
          if (updates.productId) {
            const product = products.find((p) => p.id === updates.productId);
            if (product) {
              updatedItem.unitPrice = product.price;
              updatedItem.description = product.description || "";
            }
          } else if (updates.serviceId) {
            const service = services.find((s) => s.id === updates.serviceId);
            if (service) {
              updatedItem.unitPrice = service.basePrice;
              updatedItem.description = service.description || "";
            }
          }

          // Recalculate total
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
          
          return updatedItem;
        }
        return item;
      })
    );
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  const calculateGrandTotal = () => {
    return lineItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerId) {
      alert("Please select a customer");
      return;
    }

    if (lineItems.length === 0) {
      alert("Please add at least one line item");
      return;
    }

    try {
      const response = await fetch(`/api/invoices/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          lineItems: lineItems.map(({ id, ...item }) => ({ 
            ...item,
            // Remove temp IDs for new items
            ...(id.startsWith('temp-') ? {} : { id })
          })),
        }),
      });

      if (response.ok) {
        router.push(`/invoices/${params.id}`);
      } else {
        const error = await response.json();
        alert(`Failed to update invoice: ${error.error}`);
      }
    } catch (error) {
      console.error("Failed to update invoice:", error);
      alert("Failed to update invoice");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invoice not found</h2>
          <Link href="/invoices" className="text-blue-600 hover:text-blue-800">
            Return to invoices
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-6 py-4">
          <div className="flex items-center">
            <Link
              href={`/invoices/${params.id}`}
              className="text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Edit Invoice {invoice.invoiceNumber}
              </h1>
              <p className="text-sm text-gray-600">
                Update invoice details and line items
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Invoice Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer *
                </label>
                <select
                  value={formData.customerId}
                  onChange={(e) =>
                    setFormData({ ...formData, customerId: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Additional notes or terms..."
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Line Items</h2>
              <button
                type="button"
                onClick={addLineItem}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </button>
            </div>

            {lineItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No items added yet. Click &quot;Add Item&quot; to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {lineItems.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type
                        </label>
                        <select
                          value={item.itemType}
                          onChange={(e) =>
                            updateLineItem(item.id, {
                              itemType: e.target.value as "product" | "service",
                              productId: undefined,
                              serviceId: undefined,
                              unitPrice: 0,
                              total: 0,
                            })
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        >
                          <option value="product">Product</option>
                          <option value="service">Service</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {item.itemType === "product" ? "Product" : "Service"}
                        </label>
                        <select
                          value={item.itemType === "product" ? item.productId || "" : item.serviceId || ""}
                          onChange={(e) =>
                            updateLineItem(item.id, {
                              [item.itemType === "product" ? "productId" : "serviceId"]: e.target.value,
                            })
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        >
                          <option value="">Select {item.itemType}</option>
                          {item.itemType === "product"
                            ? products.map((product) => (
                                <option key={product.id} value={product.id}>
                                  {product.name} (${product.price}/{product.unit})
                                </option>
                              ))
                            : services.map((service) => (
                                <option key={service.id} value={service.id}>
                                  {service.name} (${service.basePrice}/{service.unit})
                                </option>
                              ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) =>
                            updateLineItem(item.id, {
                              quantity: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Unit Price
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateLineItem(item.id, {
                              unitPrice: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Total
                        </label>
                        <input
                          type="text"
                          value={`$${item.total.toFixed(2)}`}
                          readOnly
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50"
                        />
                      </div>

                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeLineItem(item.id)}
                          className="text-red-600 hover:text-red-800 p-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={item.description || ""}
                        onChange={(e) =>
                          updateLineItem(item.id, { description: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        placeholder="Item description..."
                      />
                    </div>
                  </div>
                ))}

                {/* Total */}
                <div className="flex justify-end border-t pt-4">
                  <div className="text-right">
                    <div className="text-lg font-medium text-gray-900">
                      Total: ${calculateGrandTotal().toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Link
              href={`/invoices/${params.id}`}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Update Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
