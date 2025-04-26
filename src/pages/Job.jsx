import { getsingleJob, UpdateHiringStatus } from '@/api/apijobs';
import Applyjobdrawer from '@/components/apply-job';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import useFetch from '@/hooks/usefetch';
import { useUser } from '@clerk/clerk-react';
import MDEditor from '@uiw/react-md-editor';
import { Briefcase, DoorClosed, DoorOpen, MapPinIcon } from 'lucide-react';
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BarLoader } from 'react-spinners';
import {supabase} from '@/utils/Superbase';

const JobPage = () => {
  const { isLoaded, user } = useUser();
  const { id } = useParams();

  const {
    loading: loadingjob,
    data: job,
    fn: fnjob,
  } = useFetch(getsingleJob, {
    job_id: id,
  });

  const {
    loading: loadingHiringStatus,
    fn: fnHiringStatus,
  } = useFetch(UpdateHiringStatus, {
    job_id: id,
  });

  const handlestatuschange = async (value) => {
    const isOpen = value === 'open';
    console.log("🔁 Updating status to:", isOpen ? 'Open' : 'Closed');
  
    try {
      const res = await fnHiringStatus({ job_id: id, isOpen });
      if (res) {
        console.log("✅ Job updated successfully", res);
        await fnjob();
      }
    } catch (err) {
      console.error("Error during status change:", err);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      fnjob();
    }
  }, [isLoaded]);

  if (!isLoaded || loadingjob) {
    return <BarLoader className="mb-4" width={'100%'} color="#36d7b7" />;
  }

  const isRecruiter = user?.id === job?.recruiter_id;
  const isCandidate = !isRecruiter;
  const hasApplied = job?.applications?.some(app => app.candidate_id === user?.id);

  return (
    <div className="flex flex-col gap-8 mt-5 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Job Header */}
      <div className="flex flex-col-reverse gap-6 md:flex-row justify-between items-center">
        <h1 className="gradient-title font-extrabold pb-3 text-4xl sm:text-5xl lg:text-6xl text-center md:text-left">
          {job?.title}
        </h1>
        <img src={job?.company?.logo_url} className="h-16 w-auto mx-auto md:mx-0" alt={job?.title} />
      </div>

      {/* Job Meta */}
      <div className="flex justify-between md:flex-row flex-col gap-4 md:gap-0 items-start md:items-center">
        <div className="flex gap-2 items-center text-sm text-gray-100">
          <MapPinIcon />
          <span>{job?.location}</span>
        </div>
        <div className="flex gap-2 items-center text-sm text-gray-100">
          <Briefcase />
          <span>{job?.applications?.length || 0} Applicants</span>
        </div>
        <div className="flex gap-2 items-center text-sm">
          {job?.isOpen ? (
            <>
              <DoorOpen className="text-green-500" />
              <span className="text-green-500">Open</span>
            </>
          ) : (
            <>
              <DoorClosed className="text-red-500" />
              <span className="text-red-500">Closed</span>
            </>
          )}
        </div>
      </div>

      {/* Hiring Status (Recruiter Only) */}
      {isRecruiter && (
        <div className="my-6">
          <label htmlFor="hiring-status" className="block mb-2 text-lg font-medium text-white">
            Hiring Status
          </label>
          <Select
            onValueChange={handlestatuschange}
            value={job?.isOpen ? 'open' : 'closed'}
            disabled={loadingHiringStatus}
          >
            <SelectTrigger
              id="hiring-status"
              className={`w-full px-4 py-2 rounded-xl border font-semibold transition-colors ${
                job?.isOpen
                  ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200'
                  : 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200'
              }`}
            >
              <SelectValue placeholder={`(${job?.isOpen ? 'open' : 'closed'})`} />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-md rounded-lg">
              <SelectItem
                value="open"
                className="text-green-700 hover:bg-green-100 hover:text-green-900"
              >
                Open
              </SelectItem>
              <SelectItem
                value="closed"
                className="text-red-700 hover:bg-red-100 hover:text-red-900"
              >
                Closed
              </SelectItem>
            </SelectContent>
          </Select>
          {loadingHiringStatus && (
            <div className="mt-2">
              <BarLoader width="100%" color="#36d7b7" />
            </div>
          )}
        </div>
      )}

      {/* Job Content */}
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold">About the Job</h2>
          <div className="text-lg text-white mt-2">
            <MDEditor.Markdown source={job?.description} />
          </div>
        </section>

        <section>
          <h2 className="text-2xl sm:text-3xl font-bold">Requirements</h2>
          <ul className="list-disc list-inside sm:text-lg text-white mt-2 space-y-2">
            {job?.requriments?.split('\n')
              .filter(line => line.trim().length > 0)
              .map((line, index) => (
                <li key={index}>{line.replace(/^[-•]\s?/, '')}</li>
              ))}
          </ul>
        </section>
      </div>

      {/* Apply Button (Candidate Only) */}
      {isCandidate && job?.isOpen && (
        <Applyjobdrawer 
          job={job} 
          user={user} 
          fetchJob={fnjob}
          applied={hasApplied}
        />
      )}

      {/* Applications List (Recruiter Only) */}
      {isRecruiter && job?.applications?.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Applications ({job.applications.length})</h2>
          <div className="space-y-4">
            {job.applications.map(application => (
              <div key={application.id} className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-medium">{application.candidate_name || 'Applicant'}</h3>
                <p className="text-sm text-gray-400">{application.education}</p>
                <p className="text-sm">{application.skills}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobPage;