import { useEffect } from 'react'; // Added this import
import useFetch from '@/hooks/usefetch';
import { getSavedJobs } from '@/api/apijobs';
import JobCard from '@/components/JobCard';
import { BarLoader } from 'react-spinners';
import { toast } from 'sonner';

const SavedJob = () => {
  const { 
    data: savedJobs, 
    loading, 
    error,
    fetchData: fetchSavedJobs
  } = useFetch(getSavedJobs, true);

  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <BarLoader width="100%" color="#3B82F6" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error loading saved jobs</p>
        <button 
          onClick={fetchSavedJobs}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
        Your Saved Jobs
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {savedJobs?.length ? (
          savedJobs.map((saved) => (
            <JobCard
              key={saved.id}
              job={saved.job}
              savedInit={true}
              onJobSaved={fetchSavedJobs}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p>No saved jobs found</p>
            <button 
              onClick={fetchSavedJobs}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJob;