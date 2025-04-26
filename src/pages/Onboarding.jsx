import { useUser } from '@clerk/clerk-react';
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { BarLoader } from 'react-spinners';

const Onboarding = () => {
  const { user, isLoaded } = useUser();
  const [redirect, setRedirect] = useState(null);

  const handleRoleSelection = async (role) => {
    try {
      await user.update({
        unsafeMetadata: { role },
      });
      setRedirect(role === "recruiter" ? "/post-job" : "/jobs");
    } catch (err) {
      console.error("Error Updating role:", err);
    }
  };

  useEffect(() => {
    // Prevent auto-redirect from URL param on refresh
    // You can remove this effect entirely if no auto role set is needed
  }, []);

  if (!isLoaded) {
    return <BarLoader className="mb-4" width="100%" color="#36d7d7" />;
  }

  if (redirect) {
    return <Navigate to={redirect} />;
  }

  return (
    <div className="flex flex-col items-center justify-center mt-32">
      <h2 className="gradient-title font-extrabold text-7xl sm:text-8xl tracking-tighter">
        I am a...
      </h2>
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 w-full px-6 md:px-40">
        <button
          className="h-28 sm:h-36 px-10 sm:px-16 text-xl sm:text-2xl font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all duration-300 ease-in-out hover:scale-105"
          onClick={() => handleRoleSelection("candidate")}
        >
          Candidate
        </button>
        <button
          className="h-28 sm:h-36 px-10 sm:px-16 text-xl sm:text-2xl font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transition-all duration-300 ease-in-out hover:scale-105"
          onClick={() => handleRoleSelection("recruiter")}
        >
          Recruiter
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
