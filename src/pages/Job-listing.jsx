import { getCompanies } from '@/api/apicompanies';
import { getJobs } from '@/api/apijobs';
import JobCard from '@/components/jobcard';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import useFetch from '@/hooks/usefetch';
import { useUser } from '@clerk/clerk-react';
import { State } from 'country-state-city';
import React, { useEffect, useState } from 'react';
import { BarLoader } from 'react-spinners';

const JobListing = () => {
  const { isLoaded } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [company_id, setcompany_id] = useState('');

  const { fn, data, loading, error } = useFetch(getJobs, {
    location,
    company_id,
    searchQuery,
  });

  const { fn: fnCompanies, data: companies } = useFetch(getCompanies);

  useEffect(() => {
    if (isLoaded) fnCompanies();
  }, [isLoaded]);

  useEffect(() => {
    if (isLoaded) fn();
  }, [isLoaded, location, company_id, searchQuery]);

  const handlesearch = (e) => {
    e.preventDefault();
    let formData = new FormData(e.target);
    const query = formData.get('search-query');
    if (query) setSearchQuery(query);
  };

  const clearFIlters = ()=>{
    setSearchQuery("");
    setcompany_id("");
    setLocation("")
  }

  if (!isLoaded) {
    return <BarLoader className="mb-4" width={'100%'} color="#36d7b7" />;
  }

  return (
    <div className="p-4">
      <h1 className="gradient-title font-extrabold text-4xl sm:text-6xl md:text-7xl text-center pb-8">
        Latest Jobs
      </h1>

      <form
        onSubmit={handlesearch}
        className="flex flex-col sm:flex-row sm:flex-wrap items-center gap-3 w-full mb-6 p-4 bg-[#1f2937] rounded-lg shadow-md shadow-blue-900 transition"
      >
        <input
          type="text"
          placeholder="Search jobs, roles..."
          name="search-query"
          className="w-full sm:flex-1 h-12 px-2 py-2 rounded-md text-white placeholder-gray-400 bg-[#011532] border border-[#011532] focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-300"
        />

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
          <Select value={location} onValueChange={(value) => setLocation(value)}>
            <SelectTrigger className="w-full sm:w-[180px] bg-[#011532] text-white border border-[#011532] rounded-md h-12">
              <SelectValue placeholder="Filter by Location" />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto bg-[#1f2937] text-white">
              <SelectGroup>
                {State.getStatesOfCountry('IN').map(({ name }) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select value={company_id} onValueChange={(value) => setcompany_id(value)}>
  <SelectTrigger className="w-full sm:w-[180px] bg-[#011532] text-white border border-[#011532] rounded-md h-12">
    <SelectValue placeholder="Filter by Company">
      {company_id && companies?.length
        ? companies.find((c) => c.id === company_id)?.name ?? "Filter by Company"
        : "Filter by Company"}
    </SelectValue>
  </SelectTrigger>
  <SelectContent className="max-h-60 overflow-y-auto bg-[#1f2937] text-white">
    <SelectGroup>
      {(companies || []).map(({ name, id }) => (
        <SelectItem key={id} value={id}>
          {name}
        </SelectItem>
      ))}
    </SelectGroup>
  </SelectContent>
</Select>




  {/* Clear Filters Button */}
  <Button
    onClick={clearFIlters}
    variant="destructive"
    className="w-full sm:w-auto h-12 px-4 rounded-md bg-red-600 hover:bg-red-700 transition text-white font-semibold"
  >
    Clear Filters
  </Button>

        </div>

        <Button
          type="submit"
          className="w-full sm:w-auto h-12 px-6 text-white font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition rounded-md"
          variant="blue"
        >
          Search
        </Button>
      </form>

      {loading && (
        <BarLoader className="mt-4" width={'100%'} color="#36d7b7" />
      )}

      {!loading && data?.length > 0 && (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {data.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              savedInit={job?.saved?.length > 0}
              onJobSaved={() => fn()}
            />
          ))}
        </div>
      )}

      {!loading && data?.length === 0 && (
        <p className="text-center mt-4 text-gray-500">No jobs found.</p>
      )}

      {error && (
        <p className="text-center mt-4 text-red-500">Error: {error.message}</p>
      )}
    </div>
  );
};

export default JobListing;
