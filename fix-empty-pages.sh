#!/bin/bash

# Script to add basic page implementations to empty files

echo "🔧 Adding basic implementations to empty page files..."

# Fix all empty page files
find src/app -name "*.tsx" -size 0 | while read file; do
  echo "Fixing: $file"
  
  # Determine page name from path
  pageName=$(basename "$(dirname "$file")")
  if [[ "$pageName" == "new" ]]; then
    pageName="New $(basename "$(dirname "$(dirname "$file")")")"
  elif [[ "$pageName" == "edit" ]]; then
    pageName="Edit $(basename "$(dirname "$(dirname "$file")")")"
  elif [[ "$pageName" == "[id]" ]]; then
    pageName="$(basename "$(dirname "$(dirname "$file")")")"
  elif [[ "$file" == *"[id]"* ]]; then
    pageName="$(basename "$(dirname "$file")")"
  fi
  
  # Capitalize first letter
  pageName="$(echo "$pageName" | sed 's/^./\U&/')"
  
  # Create basic page template
  cat > "$file" << EOF
'use client';

import { Suspense } from 'react';

export default function ${pageName//[^a-zA-Z0-9]/}Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          $pageName
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Page Under Construction
            </h2>
            <p className="text-gray-600 mb-6">
              This page is being developed. Please check back soon.
            </p>
            <button 
              onClick={() => window.history.back()}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
EOF
done

echo "✅ All empty page files have been fixed!"
echo "🏗️ You can now build and deploy your application."
