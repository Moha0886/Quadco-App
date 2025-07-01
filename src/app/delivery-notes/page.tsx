"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Eye, Edit, Trash2, Truck, Download } from "lucide-react";
import Link from "next/link";

interface Customer {
  id: string;
  name: string;
  email: string;
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
}

export default function DeliveryNotesPage() {
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchDeliveryNotes();
  }, []);

  const fetchDeliveryNotes = async () => {
    try {
      const response = await fetch("/api/delivery-notes");
      if (response.ok) {
        const data = await response.json();
        setDeliveryNotes(data);
      }
    } catch (error) {
      console.error("Failed to fetch delivery notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteDeliveryNote = async (id: string) => {
    if (!confirm("Are you sure you want to delete this delivery note?")) {
      return;
    }

    try {
      const response = await fetch(`/api/delivery-notes/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDeliveryNotes(deliveryNotes.filter((note) => note.id !== id));
      } else {
        alert("Failed to delete delivery note");
      }
    } catch (error) {
      console.error("Failed to delete delivery note:", error);
      alert("Failed to delete delivery note");
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
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredDeliveryNotes = deliveryNotes.filter(
    (note) =>
      note.deliveryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading delivery notes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Delivery Notes</h1>
              <p className="text-sm text-gray-600">
                Manage delivery notes and track shipments
              </p>
            </div>
            <Link
              href="/delivery-notes/new"
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Delivery Note
            </Link>
          </div>
        </div>
      </div>

      {/* Search and Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search delivery notes..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full max-w-md focus:ring-purple-500 focus:border-purple-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Delivery Notes Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Delivery Note
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Delivered
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDeliveryNotes.map((note) => (
                    <tr key={note.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {note.deliveryNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{note.customer.name}</div>
                        <div className="text-sm text-gray-500">{note.customer.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {note.invoice?.invoiceNumber || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(note.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {note.deliveredDate ? formatDate(note.deliveredDate) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            note.status
                          )}`}
                        >
                          {note.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <Link
                            href={`/delivery-notes/${note.id}`}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/delivery-notes/${note.id}/edit`}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => deleteDeliveryNote(note.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredDeliveryNotes.length === 0 && (
              <div className="text-center py-12">
                <Truck className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No delivery notes</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm
                    ? "No delivery notes match your search."
                    : "Get started by creating a new delivery note."}
                </p>
                {!searchTerm && (
                  <div className="mt-6">
                    <Link
                      href="/delivery-notes/new"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Delivery Note
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
