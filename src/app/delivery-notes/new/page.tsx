"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
}

interface LineItem {
  id: string;
  productId: string;
  itemType: string;
  quantity: number;
  description: string;
}

export default function NewDeliveryNotePage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerId: "",
    invoiceId: "",
    deliveryNumber: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: "1",
      productId: "",
      itemType: "product",
      quantity: 1,
      description: "",
    },
  ]);

  const router = useRouter();

  useEffect(() => {
    fetchCustomers();
    fetchInvoices();
    fetchProducts();
    generateDeliveryNumber();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers");
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await fetch("/api/invoices");
      if (response.ok) {
        const data = await response.json();
        setInvoices(data);
      }
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const generateDeliveryNumber = async () => {
    try {
      const response = await fetch("/api/delivery-notes");
      if (response.ok) {
        const deliveryNotes = await response.json();
        const deliveryNumber = `DN-${new Date().getFullYear()}-${String(deliveryNotes.length + 1).padStart(3, "0")}`;
        setFormData(prev => ({ ...prev, deliveryNumber }));
      }
    } catch (error) {
      console.error("Failed to generate delivery number:", error);
    }
  };

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: Date.now().toString(),
        productId: "",
        itemType: "product",
        quantity: 1,
        description: "",
      },
    ]);
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  const updateLineItem = (id: string, field: string, value: any) => {
    setLineItems(
      lineItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const processedLineItems = lineItems
        .filter((item) => item.productId)
        .map((item) => {
          const product = products.find((p) => p.id === item.productId);
          return {
            productId: item.productId,
            itemType: item.itemType,
            quantity: item.quantity,
            unitPrice: product?.price || 0,
            total: (product?.price || 0) * item.quantity,
            description: item.description,
          };
        });

      if (processedLineItems.length === 0) {
        alert("Please add at least one item");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/delivery-notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          lineItems: processedLineItems,
        }),
      });

      if (response.ok) {
        const deliveryNote = await response.json();
        router.push(`/delivery-notes/${deliveryNote.id}`);
      } else {
        const error = await response.json();
        alert(`Failed to create delivery note: ${error.error}`);
      }
    } catch (error) {
      console.error("Failed to create delivery note:", error);
      alert("Failed to create delivery note");
    } finally {
      setLoading(false);
    }
  };

  const selectedCustomer = customers.find((c) => c.id === formData.customerId);
  const filteredInvoices = invoices.filter((i) => i.customerId === formData.customerId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-6 py-4">
          <div className="flex items-center">
            <Link
              href="/delivery-notes"
              className="text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Delivery Note</h1>
              <p className="text-sm text-gray-600">
                Create a new delivery note for shipments
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Delivery Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Number
                  </label>
                  <input
                    type="text"
                    value={formData.deliveryNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, deliveryNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer
                  </label>
                  <select
                    value={formData.customerId}
                    onChange={(e) =>
                      setFormData({ ...formData, customerId: e.target.value, invoiceId: "" })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    required
                  >
                    <option value="">Select customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Invoice Reference (Optional)
                  </label>
                  <select
                    value={formData.invoiceId}
                    onChange={(e) =>
                      setFormData({ ...formData, invoiceId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    disabled={!formData.customerId}
                  >
                    <option value="">Select invoice (optional)</option>
                    {filteredInvoices.map((invoice) => (
                      <option key={invoice.id} value={invoice.id}>
                        {invoice.invoiceNumber}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Special delivery instructions or notes..."
                />
              </div>
            </div>

            {/* Line Items */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Items to Deliver</h2>
                <button
                  type="button"
                  onClick={addLineItem}
                  className="bg-purple-600 text-white px-3 py-1 rounded-md hover:bg-purple-700 flex items-center text-sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </button>
              </div>

              <div className="space-y-4">
                {lineItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border border-gray-200 rounded-md"
                  >
                    <div className="md:col-span-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product
                      </label>
                      <select
                        value={item.productId}
                        onChange={(e) =>
                          updateLineItem(item.id, "productId", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                        required
                      >
                        <option value="">Select product</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} (${product.price})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateLineItem(item.id, "quantity", parseFloat(e.target.value) || 0)
                        }
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                        required
                      />
                    </div>
                    <div className="md:col-span-5">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          updateLineItem(item.id, "description", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Additional description..."
                      />
                    </div>
                    <div className="md:col-span-1 flex items-end">
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLineItem(item.id)}
                          className="text-red-600 hover:text-red-800 p-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Info Display */}
            {selectedCustomer && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  Delivery Address
                </h3>
                <div className="text-sm text-blue-700">
                  <p className="font-medium">{selectedCustomer.name}</p>
                  <p>{selectedCustomer.email}</p>
                  {selectedCustomer.phone && <p>{selectedCustomer.phone}</p>}
                  {selectedCustomer.address && <p>{selectedCustomer.address}</p>}
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Delivery Note"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
