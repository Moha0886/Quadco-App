"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface DeliveryNote {
  id: string;
  deliveryNumber: string;
  date: string;
  deliveredDate?: string;
  status: string;
  notes?: string;
}

export default function EditDeliveryNotePage() {
  const [deliveryNote, setDeliveryNote] = useState<DeliveryNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    deliveredDate: "",
    status: "",
    notes: "",
  });

  const params = useParams();
  const router = useRouter();

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
        setFormData({
          deliveredDate: data.deliveredDate ? data.deliveredDate.split('T')[0] : "",
          status: data.status,
          notes: data.notes || "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch delivery note:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/delivery-notes/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deliveredDate: formData.deliveredDate || null,
          status: formData.status,
          notes: formData.notes,
        }),
      });

      if (response.ok) {
        router.push(`/delivery-notes/${params.id}`);
      } else {
        const error = await response.json();
        alert(`Failed to update delivery note: ${error.error}`);
      }
    } catch (error) {
      console.error("Failed to update delivery note:", error);
      alert("Failed to update delivery note");
    } finally {
      setSaving(false);
    }
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
          <div className="flex items-center">
            <Link
              href={`/delivery-notes/${deliveryNote.id}`}
              className="text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Edit Delivery Note {deliveryNote.deliveryNumber}
              </h1>
              <p className="text-sm text-gray-600">
                Update delivery status and notes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Update Delivery Status
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="in_transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivered Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.deliveredDate}
                    onChange={(e) =>
                      setFormData({ ...formData, deliveredDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Set this when the delivery is completed
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Delivery notes, special instructions, or status updates..."
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-3">
              <Link
                href={`/delivery-notes/${deliveryNote.id}`}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
