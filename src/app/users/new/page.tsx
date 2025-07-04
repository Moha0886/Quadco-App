import UnderDevelopmentPage from '@/components/UnderDevelopmentPage';

export default function NewUserPage() {
  return (
    <UnderDevelopmentPage
      title="Add New User"
      description="Create user accounts and assign roles and permissions for your team members. Set up access levels and manage user capabilities."
      backLink="/users"
      backText="Back to Users"
      icon={
        <svg className="w-16 h-16 mx-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-7.5H21m-6-6v6" />
        </svg>
      }
    />
  );
}
