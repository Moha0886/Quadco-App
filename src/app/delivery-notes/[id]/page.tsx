'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface DeliveryNote {
  id: string;
  deliveryNumber: string;
  customerId: string;
  status: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  lineItems: {
    id: string;
    itemType: string;
    productId?: string;
    serviceId?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    product?: {
      id: string;
      name: string;
      description: string;
      price: string;
      unit: string;
      category: string;
    };
    service?: {
      id: string;
      name: string;
      description: string;
      rate: string;
      unit: string;
    };
  }[];
}

export default function DeliveryNoteViewPage() {
  const params = useParams();
  const router = useRouter();
  const [deliveryNote, setDeliveryNote] = useState<DeliveryNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params?.id) {
      fetchDeliveryNote();
    }
  }, [params?.id]);

  const fetchDeliveryNote = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/delivery-notes/${params?.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch delivery note');
      }
      const data = await response.json();
      setDeliveryNote(data.deliveryNote);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'In Transit': return 'bg-blue-100 text-blue-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading delivery note</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={fetchDeliveryNote}
                  className="bg-red-100 px-4 py-2 rounded-md text-red-800 hover:bg-red-200"
                >
                  Try Again
                </button>
                <Link
                  href="/delivery-notes"
                  className="bg-gray-100 px-4 py-2 rounded-md text-gray-800 hover:bg-gray-200"
                >
                  Back to Delivery Notes
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!deliveryNote) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Delivery Note Not Found</h3>
          <p className="text-gray-600 mb-4">The delivery note you're looking for doesn't exist.</p>
          <Link
            href="/delivery-notes"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Delivery Notes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Delivery Note Details</h1>
            <p className="text-gray-600 mt-2">{deliveryNote.deliveryNumber}</p>
          </div>
          <div className="flex space-x-2">
            <Link
              href={`/delivery-notes/${deliveryNote.id}/edit`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit
            </Link>
            <Link
              href="/delivery-notes"
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back to List
            </Link>
          </div>
        </div>

        {/* Delivery Note Info */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-600">Delivery Number</dt>
                  <dd className="text-sm text-gray-900">{deliveryNote.deliveryNumber}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-600">Status</dt>
                  <dd>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(deliveryNote.status)}`}>
                      {deliveryNote.status}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-600">Delivery Date</dt>
                  <dd className="text-sm text-gray-900">{new Date(deliveryNote.date).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-600">Created</dt>
                  <dd className="text-sm text-gray-900">{new Date(deliveryNote.createdAt).toLocaleDateString()}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-600">Name</dt>
                  <dd className="text-sm text-gray-900">{deliveryNote.customer?.name || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-600">Email</dt>
                  <dd className="text-sm text-gray-900">{deliveryNote.customer?.email || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-600">Phone</dt>
                  <dd className="text-sm text-gray-900">{deliveryNote.customer?.phone || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-600">Address</dt>
                  <dd className="text-sm text-gray-900">{deliveryNote.customer?.address || 'N/A'}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden mb-8">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Items</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deliveryNote.lineItems && deliveryNote.lineItems.length > 0 ? (
                  deliveryNote.lineItems.map((item, index) => (
                    <tr key={item.id || index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{item.description}</div>
                          {item.product && (
                            <div className="text-gray-500 text-xs">Product: {item.product.name}</div>
                          )}
                          {item.service && (
                            <div className="text-gray-500 text-xs">Service: {item.service.name}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${item.unitPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${item.total.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No items found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {deliveryNote.lineItems?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Total Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                ${deliveryNote.lineItems?.reduce((sum, item) => sum + item.total, 0).toFixed(2) || '0.00'}
              </div>
              <div className="text-sm text-gray-600">Total Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {deliveryNote.status === 'DELIVERED' ? 'Completed' : 'In Progress'}
              </div>
              <div className="text-sm text-gray-600">Status</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
