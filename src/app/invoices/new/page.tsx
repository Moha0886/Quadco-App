import UnderDevelopmentPage from '@/components/UnderDevelopmentPage';

export default function NewInvoicePage() {
  return (
    <UnderDevelopmentPage
      title="New Invoice"
      description="Create and send professional invoices to your customers. Add line items, apply taxes, set payment terms, and track payment status."
      backLink="/invoices"
      backText="Back to Invoices"
      icon={
        <svg className="w-16 h-16 mx-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      }
    />
  );
}
