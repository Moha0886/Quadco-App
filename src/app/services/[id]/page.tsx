'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface ServiceCategory {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  basePrice: string | number; // Prisma Decimal comes as string
  unit: string;
  categoryId?: string;
  category?: ServiceCategory;
  createdAt: string;
  updatedAt: string;
}

export default function ServiceViewPage() {
  const params = useParams();
  const 
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params?.id) {
      fetchService();
    }
  }, [params?.id]);

  const fetchService = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/services/${params?.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch service');
      }
      const data = await response.json();
      setService(data.service);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!service || !confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      const response = await fetch(`/api/services/${service.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/services');
      } else {
        throw new Error('Failed to delete service');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete service');
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
                  <Link href="/services" className="text-sm font-medium text-red-800 hover:text-red-600">
                    ← Back to Services
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
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
                <h3 className="text-sm font-medium text-yellow-800">Service Not Found</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>The service you're looking for could not be found.</p>
                </div>
                <div className="mt-4">
                  <Link href="/services" className="text-sm font-medium text-yellow-800 hover:text-yellow-600">
                    ← Back to Services
                  </Link>
                </div>
              </div>
            </div>
          </div>
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
            <h1 className="text-3xl font-bold text-gray-900">Service Details</h1>
            <p className="text-gray-600 mt-2">{service.name}</p>
          </div>
          <div className="flex space-x-2">
            <Link
              href={`/services/${service.id}/edit`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
            <Link
              href="/services"
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back to List
            </Link>
          </div>
        </div>

        {/* Service Info */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Service Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <dt className="text-sm font-medium text-gray-600">Service Name</dt>
              <dd className="text-sm text-gray-900 mt-1">{service.name}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-600">Category</dt>
              <dd className="text-sm text-gray-900 mt-1">{service.category?.name || 'No category'}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-600">Base Price</dt>
              <dd className="text-sm text-gray-900 mt-1">${parseFloat(service.basePrice.toString()).toFixed(2)}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-600">Unit</dt>
              <dd className="text-sm text-gray-900 mt-1">{service.unit}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-600">Service ID</dt>
              <dd className="text-sm text-gray-900 mt-1 font-mono">{service.id}</dd>
            </div>
          </div>

          <div className="mt-6">
            <dt className="text-sm font-medium text-gray-600">Description</dt>
            <dd className="text-sm text-gray-900 mt-1">{service.description}</dd>
          </div>
        </div>

        {/* Metadata */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">System Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <dt className="text-sm font-medium text-gray-600">Created</dt>
              <dd className="text-sm text-gray-900 mt-1">
                {new Date(service.createdAt).toLocaleDateString()} at {new Date(service.createdAt).toLocaleTimeString()}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-600">Last Updated</dt>
              <dd className="text-sm text-gray-900 mt-1">
                {new Date(service.updatedAt).toLocaleDateString()} at {new Date(service.updatedAt).toLocaleTimeString()}
              </dd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
