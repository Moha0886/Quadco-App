"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, FileSpreadsheet, Download } from "lucide-react";
import Link from "next/link";
import { pdf } from '@react-pdf/renderer';
import QuotationPDF from '@/components/pdf/QuotationPDF';
import { formatNaira } from '@/lib/currency';

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
  itemType: string;
  productId?: string;
  serviceId?: string;
  quantity: number;
  unitPrice: number;
  subtotal?: number;
  taxRate?: number;
  taxAmount?: number;
  total: number;
  description?: string;
  product?: Product;
  service?: Service;
}

interface Quotation {
  id: string;
  customerId: string;
  date: string;
  validUntil: string;
  status: string;
  subtotal?: number;
  taxAmount?: number;
  total: number;
  notes?: string;
  customer: Customer;
  lineItems: LineItem[];
}

export default function QuotationViewPage() {
  const params = useParams();
  const router = useRouter();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchQuotation(params.id as string);
    }
  }, [params.id]);

  const fetchQuotation = async (id: string) => {
    try {
      const response = await fetch(`/api/quotations/${id}`);
      if (response.ok) {
        const data = await response.json();
        setQuotation(data);
      } else {
        console.error("Failed to fetch quotation");
        router.push("/quotations");
      }
    } catch (error) {
      console.error("Failed to fetch quotation:", error);
      router.push("/quotations");
    } finally {
      setLoading(false);
    }
  };

  const convertToInvoice = async () => {
    if (!quotation || !confirm("Are you sure you want to convert this quotation to an invoice?")) {
      return;
    }

    try {
      const response = await fetch(`/api/quotations/${quotation.id}/convert-to-invoice`, {
        method: "POST",
      });

      if (response.ok) {
        const invoice = await response.json();
        alert(`Invoice created successfully! Invoice Number: ${invoice.invoiceNumber || invoice.id}`);
        // Refresh quotation to show updated status
        fetchQuotation(quotation.id);
      } else {
        const error = await response.json();
        alert(`Failed to convert to invoice: ${error.error}`);
      }
    } catch (error) {
      console.error("Failed to convert to invoice:", error);
      alert("Failed to convert to invoice");
    }
  };

  const downloadPDF = async () => {
    if (!quotation) return;

    try {
      // Transform quotation data for PDF component
      const pdfData = {
        id: quotation.id,
        date: quotation.date,
        validUntil: quotation.validUntil,
        status: quotation.status,
        total: quotation.total,
        notes: quotation.notes,
        customer: {
          name: quotation.customer.name,
          email: quotation.customer.email,
          phone: quotation.customer.phone,
          address: quotation.customer.address,
        },
        lineItems: quotation.lineItems.map(item => ({
          id: item.id,
          description: item.description || '',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
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
      const pdfBlob = await pdf(<QuotationPDF quotation={pdfData} />).toBlob();
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `quotation-${quotation.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF');
    }
  };

  const updateQuotationStatus = async (newStatus: string) => {
    if (!quotation) return;

    try {
      const response = await fetch(`/api/quotations/${quotation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...quotation,
          status: newStatus,
        }),
      });

      if (response.ok) {
        const updatedQuotation = await response.json();
        setQuotation(updatedQuotation);
      } else {
        console.error('Failed to update quotation status');
      }
    } catch (error) {
      console.error('Error updating quotation status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-yellow-100 text-yellow-800";
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
        <div className="text-lg">Loading quotation...</div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Quotation not found</h2>
          <Link href="/quotations" className="text-blue-600 hover:text-blue-800">
            Return to quotations
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
                href="/quotations"
                className="text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Quotation QUO-{quotation.id.slice(-6).toUpperCase()}
                </h1>
                <p className="text-sm text-gray-600">
                  View quotation details and manage status
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link
                href={`/quotations/${quotation.id}/edit`}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
              {(quotation.status === "accepted" || quotation.status === "sent") && (
                <button
                  onClick={convertToInvoice}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Convert to Invoice
                </button>
              )}
              <button
                onClick={downloadPDF}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
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
          {/* Quotation Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Quotation Information</h2>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date</dt>
                    <dd className="text-sm text-gray-900">{formatDate(quotation.date)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Valid Until</dt>
                    <dd className="text-sm text-gray-900">{formatDate(quotation.validUntil)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="flex items-center space-x-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          quotation.status
                        )}`}
                      >
                        {quotation.status}
                      </span>
                      {(quotation.status === "draft" || quotation.status === "sent") && (
                        <select
                          value={quotation.status}
                          onChange={(e) => updateQuotationStatus(e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                        >
                          <option value={quotation.status}>
                            {quotation.status === "draft" ? "Draft" : "Sent"}
                          </option>
                          {quotation.status === "draft" && (
                            <option value="sent">Mark as Sent</option>
                          )}
                          {quotation.status === "sent" && (
                            <>
                              <option value="accepted">Mark as Accepted</option>
                              <option value="rejected">Mark as Rejected</option>
                              <option value="expired">Mark as Expired</option>
                            </>
                          )}
                        </select>
                      )}
                    </dd>
                  </div>
                  {quotation.subtotal !== undefined && quotation.subtotal !== quotation.total && (
                    <>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Subtotal</dt>
                        <dd className="text-sm text-gray-900">{formatNaira(quotation.subtotal)}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Tax Amount</dt>
                        <dd className="text-sm text-gray-900">{formatNaira(quotation.taxAmount || 0)}</dd>
                      </div>
                    </>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Total</dt>
                    <dd className="text-lg font-semibold text-gray-900">{formatNaira(quotation.total)}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h2>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="text-sm text-gray-900">{quotation.customer.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="text-sm text-gray-900">{quotation.customer.email}</dd>
                  </div>
                  {quotation.customer.phone && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Phone</dt>
                      <dd className="text-sm text-gray-900">{quotation.customer.phone}</dd>
                    </div>
                  )}
                  {quotation.customer.address && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Address</dt>
                      <dd className="text-sm text-gray-900">{quotation.customer.address}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {quotation.notes && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Notes</h3>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">{quotation.notes}</p>
              </div>
            )}
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Line Items</h2>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tax
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quotation.lineItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.product?.name || item.service?.name || "Unknown Item"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.itemType === "product" ? "Product" : "Service"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {item.description || item.product?.description || item.service?.description || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.quantity} {item.product?.unit || item.service?.unit || ""}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNaira(item.unitPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.taxRate ? `${item.taxRate}% (${formatNaira(item.taxAmount || 0)})` : "No tax"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatNaira(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  {quotation.subtotal !== undefined && quotation.subtotal !== quotation.total ? (
                    <>
                      <tr>
                        <td colSpan={5} className="px-6 py-2 text-right text-sm font-medium text-gray-900">
                          Subtotal:
                        </td>
                        <td className="px-6 py-2 text-sm text-gray-900">
                          {formatNaira(quotation.subtotal)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={5} className="px-6 py-2 text-right text-sm font-medium text-gray-900">
                          Tax:
                        </td>
                        <td className="px-6 py-2 text-sm text-gray-900">
                          {formatNaira(quotation.taxAmount || 0)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={5} className="px-6 py-3 text-right text-sm font-bold text-gray-900">
                          Total:
                        </td>
                        <td className="px-6 py-3 text-sm font-bold text-gray-900">
                          {formatNaira(quotation.total)}
                        </td>
                      </tr>
                    </>
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                        Total:
                      </td>
                      <td className="px-6 py-3 text-sm font-bold text-gray-900">
                        {formatNaira(quotation.total)}
                      </td>
                    </tr>
                  )}
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
