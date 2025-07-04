#!/bin/bash

# Script to update all remaining placeholder pages with professional content
# This script will replace all the "This page is being developed" placeholders

echo "Updating placeholder pages with professional content..."

# Define pages that need updating
pages_to_update=(
    "/Users/muhammadilu/quadco-app/src/app/invoices/new/page.tsx|New Invoice|Create and send professional invoices to your customers. Add line items, apply taxes, and track payment status.|invoices"
    "/Users/muhammadilu/quadco-app/src/app/invoices/[id]/page.tsx|Invoice Details|View detailed invoice information, track payment status, and manage customer communications.|invoices"
    "/Users/muhammadilu/quadco-app/src/app/invoices/[id]/edit/page.tsx|Edit Invoice|Modify invoice details, update line items, and resend to customers as needed.|invoices"
    "/Users/muhammadilu/quadco-app/src/app/products/new/page.tsx|Add New Product|Add products and services to your catalog with pricing, descriptions, and inventory management.|products"
    "/Users/muhammadilu/quadco-app/src/app/services/new/page.tsx|New Service|Create new service offerings with detailed descriptions, pricing, and availability.|services"
    "/Users/muhammadilu/quadco-app/src/app/services/categories/new/page.tsx|New Service Category|Organize your services by creating custom categories for better management.|services"
    "/Users/muhammadilu/quadco-app/src/app/users/new/page.tsx|Add New User|Create user accounts and assign roles and permissions for your team members.|users"
    "/Users/muhammadilu/quadco-app/src/app/users/[id]/page.tsx|User Profile|View user details, activity history, and manage account settings.|users"
    "/Users/muhammadilu/quadco-app/src/app/delivery-notes/new/page.tsx|New Delivery Note|Create delivery notes for shipments and track package delivery status.|delivery-notes"
    "/Users/muhammadilu/quadco-app/src/app/delivery-notes/[id]/page.tsx|Delivery Note Details|View delivery note information and track shipment progress.|delivery-notes"
    "/Users/muhammadilu/quadco-app/src/app/delivery-notes/[id]/edit/page.tsx|Edit Delivery Note|Modify delivery note details and update delivery information.|delivery-notes"
    "/Users/muhammadilu/quadco-app/src/app/quotations/[id]/page.tsx|Quotation Details|View quotation details, customer information, and proposal status.|quotations"
    "/Users/muhammadilu/quadco-app/src/app/quotations/[id]/edit/page.tsx|Edit Quotation|Modify quotation details, update pricing, and resend to customers.|quotations"
)

echo "Found ${#pages_to_update[@]} pages to update"

# Function to get the appropriate icon based on page type
get_icon() {
    local page_type=$1
    case $page_type in
        "invoices")
            echo '<svg className="w-16 h-16 mx-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>'
            ;;
        "products")
            echo '<svg className="w-16 h-16 mx-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>'
            ;;
        "services")
            echo '<svg className="w-16 h-16 mx-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z" /></svg>'
            ;;
        "users")
            echo '<svg className="w-16 h-16 mx-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-7.5H21m-6-6v6" /></svg>'
            ;;
        "delivery-notes")
            echo '<svg className="w-16 h-16 mx-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>'
            ;;
        "quotations")
            echo '<svg className="w-16 h-16 mx-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>'
            ;;
        *)
            echo '<svg className="w-16 h-16 mx-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>'
            ;;
    esac
}

echo "Script created successfully"
