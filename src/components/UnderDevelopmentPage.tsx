'use client';

import Link from 'next/link';

interface UnderDevelopmentPageProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  backLink?: string;
  backText?: string;
}

export default function UnderDevelopmentPage({ 
  title, 
  description, 
  icon, 
  backLink = "/dashboard",
  backText = "Back to Dashboard"
}: UnderDevelopmentPageProps) {
  const defaultIcon = (
    <svg className="w-16 h-16 mx-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Logo */}
        <div className="mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">Q</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Quadco</h3>
        </div>

        {/* Icon */}
        <div className="text-gray-400 mb-6">
          {icon || defaultIcon}
        </div>
        
        {/* Content */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {title}
        </h1>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          {description}
        </p>

        {/* Feature Coming Soon Badge */}
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-6">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Coming Soon
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-3">
          <Link 
            href={backLink}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium inline-block"
          >
            {backText}
          </Link>
          
          <Link 
            href="/dashboard"
            className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium inline-block"
          >
            Go to Dashboard
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            This feature is being developed and will be available soon.
          </p>
        </div>
      </div>
    </div>
  );
}
