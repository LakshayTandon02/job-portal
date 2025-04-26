import { useUser } from '@clerk/clerk-react';
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoaded, user } = useUser();
  const { pathname } = useLocation();

  if (!isLoaded) return null; // Wait for Clerk to load

  // Not signed in → send to homepage with login trigger
  if (!isSignedIn) {
    return <Navigate to="/?sign-in=true" state={{ from: pathname }} replace />;
  }

  // Signed in but no role → send to onboarding
  if (
    isSignedIn &&
    user &&
    !user?.unsafeMetadata?.role &&
    pathname !== "/onboarding"
  ) {
    return <Navigate to="/onboarding" replace />;
  }

  // Signed in and role exists → allow access
  return children;
};

export default ProtectedRoute;
