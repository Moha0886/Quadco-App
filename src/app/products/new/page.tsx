import UnderDevelopmentPage from '@/components/UnderDevelopmentPage';

export default function NewProductPage() {
  return (
    <UnderDevelopmentPage
      title="Add New Product"
      description="Add products and services to your catalog with pricing, descriptions, categories, and inventory management features."
      backLink="/products"
      backText="Back to Products"
      icon={
        <svg className="w-16 h-16 mx-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      }
    />
  );
}
