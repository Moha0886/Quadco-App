"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Edit, Download } from "lucide-react";
import Link from "next/link";
import { pdf } from '@react-pdf/renderer';
import DeliveryNotePDF from '@/components/pdf/DeliveryNotePDF';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

interface Product {
  id: string;
  name: string;
  unit: string;
}

interface Service {
  id: string;
  name: string;
  unit: string;
}

interface LineItem {
  id: string;
  itemType: string;
  quantity: number;
  description?: string;
  product?: Product;
  service?: Service;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
}

interface DeliveryNote {
  id: string;
  deliveryNumber: string;
  date: string;
  deliveredDate?: string;
  status: string;
  notes?: string;
  customer: Customer;
  invoice?: Invoice;
  lineItems: LineItem[];
}

export default function DeliveryNoteDetailPage() {
  const [deliveryNote, setDeliveryNote] = useState<DeliveryNote | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();

  useEffect(() => {
    if (params.id) {
      fetchDeliveryNote(params.id as string);
    }
  }, [params.id]);

  const fetchDeliveryNote = async (id: string) => {
    try {
      const response = await fetch(`/api/delivery-notes/${id}`);
      if (response.ok) {
        const data = await response.json();
        setDeliveryNote(data);
      }
    } catch (error) {
      console.error("Failed to fetch delivery note:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateDeliveryNoteStatus = async (newStatus: string) => {
    if (!deliveryNote) return;

    try {
      const updateData: { status: string; deliveredDate?: string } = {
        status: newStatus,
      };

      // If marking as delivered, set the delivered date
      if (newStatus === "delivered") {
        updateData.deliveredDate = new Date().toISOString();
      }

      const response = await fetch(`/api/delivery-notes/${deliveryNote.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const updatedNote = await response.json();
        setDeliveryNote(updatedNote);
      } else {
        alert("Failed to update delivery note");
      }
    } catch (error) {
      console.error("Failed to update delivery note:", error);
      alert("Failed to update delivery note");
    }
  };

  const downloadPDF = async () => {
    if (!deliveryNote) return;

    try {
      // Transform delivery note data for PDF component
      const pdfData = {
        id: deliveryNote.id,
        deliveryNumber: deliveryNote.deliveryNumber,
        date: deliveryNote.date,
        deliveredDate: deliveryNote.deliveredDate,
        status: deliveryNote.status,
        notes: deliveryNote.notes,
        customer: {
          name: deliveryNote.customer.name,
          email: deliveryNote.customer.email,
          phone: deliveryNote.customer.phone,
          address: deliveryNote.customer.address,
        },
        invoice: deliveryNote.invoice,
        lineItems: deliveryNote.lineItems.map(item => ({
          id: item.id,
          description: item.description || '',
          quantity: item.quantity,
          itemType: item.itemType,
          product: item.product ? {
            name: item.product.name,
            unit: item.product.unit,
          } : undefined,
          service: item.service ? {
            name: item.service.name,
            unit: item.service.unit,
          } : undefined,
        })),
      };

      // Generate PDF blob
      const pdfBlob = await pdf(<DeliveryNotePDF deliveryNote={pdfData} />).toBlob();
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `delivery-note-${deliveryNote.deliveryNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_transit":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading delivery note...</div>
      </div>
    );
  }

  if (!deliveryNote) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Delivery note not found</h2>
          <Link href="/delivery-notes" className="text-purple-600 hover:text-purple-800">
            Return to delivery notes
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
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                href="/delivery-notes"
                className="text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Delivery Note {deliveryNote.deliveryNumber}
                </h1>
                <p className="text-sm text-gray-600">
                  View delivery note details and manage status
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link
                href={`/delivery-notes/${deliveryNote.id}/edit`}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
              {deliveryNote.status !== "delivered" && deliveryNote.status !== "failed" && (
                <select
                  value={deliveryNote.status}
                  onChange={(e) => updateDeliveryNoteStatus(e.target.value)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 border-none focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value={deliveryNote.status}>
                    {deliveryNote.status === "pending" ? "Pending" : 
                     deliveryNote.status === "in_transit" ? "In Transit" : 
                     deliveryNote.status}
                  </option>
                  {deliveryNote.status === "pending" && (
                    <option value="in_transit">Mark as In Transit</option>
                  )}
                  {(deliveryNote.status === "pending" || deliveryNote.status === "in_transit") && (
                    <>
                      <option value="delivered">Mark as Delivered</option>
                      <option value="failed">Mark as Failed</option>
                    </>
                  )}
                </select>
              )}
              <button
                onClick={downloadPDF}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Delivery Note Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Delivery Information</h2>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Delivery Number</dt>
                    <dd className="text-sm text-gray-900 font-medium">{deliveryNote.deliveryNumber}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date</dt>
                    <dd className="text-sm text-gray-900">{formatDate(deliveryNote.date)}</dd>
                  </div>
                  {deliveryNote.deliveredDate && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Delivered Date</dt>
                      <dd className="text-sm text-gray-900">{formatDate(deliveryNote.deliveredDate)}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="flex items-center space-x-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          deliveryNote.status
                        )}`}
                      >
                        {deliveryNote.status.replace('_', ' ')}
                      </span>
                      {deliveryNote.status !== "delivered" && deliveryNote.status !== "failed" && (
                        <select
                          value={deliveryNote.status}
                          onChange={(e) => updateDeliveryNoteStatus(e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                        >
                          <option value={deliveryNote.status}>
                            {deliveryNote.status === "pending" ? "Pending" : 
                             deliveryNote.status === "in_transit" ? "In Transit" : 
                             deliveryNote.status}
                          </option>
                          {deliveryNote.status === "pending" && (
                            <option value="in_transit">Mark as In Transit</option>
                          )}
                          {(deliveryNote.status === "pending" || deliveryNote.status === "in_transit") && (
                            <>
                              <option value="delivered">Mark as Delivered</option>
                              <option value="failed">Mark as Failed</option>
                            </>
                          )}
                        </select>
                      )}
                    </dd>
                  </div>
                  {deliveryNote.invoice && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Invoice Reference</dt>
                      <dd className="text-sm text-gray-900">
                        <Link
                          href={`/invoices/${deliveryNote.invoice.id}`}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          {deliveryNote.invoice.invoiceNumber}
                        </Link>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h2>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="text-sm text-gray-900">{deliveryNote.customer.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="text-sm text-gray-900">{deliveryNote.customer.email}</dd>
                  </div>
                  {deliveryNote.customer.phone && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Phone</dt>
                      <dd className="text-sm text-gray-900">{deliveryNote.customer.phone}</dd>
                    </div>
                  )}
                  {deliveryNote.customer.address && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Address</dt>
                      <dd className="text-sm text-gray-900">{deliveryNote.customer.address}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Items</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deliveryNote.lineItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.product?.name || item.service?.name || 'Unknown Item'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.itemType === 'product' ? 'Product' : 'Service'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {item.description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.quantity} {item.product?.unit || item.service?.unit || ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          {deliveryNote.notes && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Notes</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{deliveryNote.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
