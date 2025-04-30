import { getsingleJob, UpdateHiringStatus } from '@/api/apijobs';
import Applyjobdrawer from '@/components/apply-job';
import ApplicationCard from '@/components/application-card'; // Make sure this path is correct
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
import { Briefcase, DoorClosed, DoorOpen, MapPinIcon, FileText, CheckCircle2 } from 'lucide-react';
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BarLoader } from 'react-spinners';
import { Button } from '@/components/ui/button';

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

  const handlestatuschange = (value) => {
    const isOpen = value === 'open';
    fnHiringStatus({ job_id: id, isOpen: isOpen })
      .then((res) => {
        if (res && res.length > 0) {
          fnjob();
        }
      })
      .catch(console.error);
  };
  
  useEffect(() => {
    if (isLoaded) {
      fnjob();
    }
  }, [isLoaded]);

  if (!isLoaded || loadingjob) {
    return <BarLoader className="mb-4" width={'100%'} color="#36d7b7" />;
  }

  const userId = user?.id?.trim();
  const recruiterId = job?.recruiter_id?.trim();
  const isRecruiter = userId === recruiterId;
  const hasApplications = job?.applications?.length > 0;
  const hasApplied = job?.applications?.some((ap) => ap.candidate_id === userId);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="flex flex-col gap-8 mt-5 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col-reverse gap-6 md:flex-row justify-between items-center">
        <h1 className="gradient-title font-extrabold pb-3 text-4xl sm:text-5xl lg:text-6xl text-center md:text-left">
          {job?.title}
        </h1>
        <img src={job?.company?.logo_url} className="h-16 w-auto mx-auto md:mx-0" alt={job?.title} />
      </div>

      <div className="flex justify-between md:flex-row flex-col gap-4 md:gap-0 items-start md:items-center">
        <div className="flex gap-2 items-center text-sm text-gray-100">
          <MapPinIcon />
          <span>{job?.location}</span>
        </div>
        <div className="flex gap-2 items-center text-sm text-gray-100">
          <Briefcase />
          <span>{job?.applications?.length || 0} Applicants</span>
        </div>
        <div className="flex gap-2 items-center text-sm text-gray-700">
          {job?.isOpen ? (
            <>
              <DoorOpen className="text-green-500" /> <span>Open</span>
            </>
          ) : (
            <>
              <DoorClosed className="text-red-500" /> <span>Closed</span>
            </>
          )}
        </div>
      </div>

      {isRecruiter && (
        <div className="my-6">
          <label htmlFor="hiring-status" className="block mb-2 text-lg font-medium text-white">
            Hiring Status
          </label>
          <Select
            onValueChange={handlestatuschange}
            defaultValue={job?.isOpen ? 'open' : 'closed'}
          >
            <SelectTrigger
              id="hiring-status"
              className={`w-full px-4 py-2 rounded-xl border font-semibold ${
                job?.isOpen
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              <SelectValue placeholder={`(${job?.isOpen ? 'open' : 'closed'})`} />
            </SelectTrigger>
            <SelectContent className="bg-gray-600 text-white rounded-xl">
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">About the Job</h2>
            <div className="text-lg text-white mt-4">
              <MDEditor.Markdown source={job?.description} />
            </div>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">Requirements</h2>
            <ul className="list-disc list-inside sm:text-lg text-white mt-4 space-y-2">
              {job?.requriments
                ?.split('\n')
                .filter(line => line.trim())
                .map((line, index) => (
                  <li key={index}>{line.replace(/^[-•]\s?/, '')}</li>
                ))}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          {!isRecruiter && job?.isOpen && (
            <div className="sticky top-6">
              {hasApplied ? (
                <Button
                  disabled
                  className="w-full bg-green-600 hover:bg-green-600/90 text-white py-6 text-lg"
                >
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  You've Applied Successfully
                </Button>
              ) : (
                <Applyjobdrawer 
                  job={job} 
                  user={user} 
                  fetchJob={fnjob}
                />
              )}
            </div>
          )}

          {/* Applications section - only shows for recruiters */}
          {isRecruiter && (
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              {hasApplications ? (
                <>
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <FileText className="text-blue-400" />
                    <span>Applications ({job.applications.length})</span>
                  </h2>
                  <div className="space-y-4">
                    {job.applications.map((app) => (
                      <ApplicationCard
                        key={app.id}
                        application={{
                          ...app,
                          name: app.name,
                          email: app.candidate_email,
                          skills: typeof app.skills === 'string' 
                            ? app.skills 
                            : Array.isArray(app.skills)
                              ? app.skills.join(', ')
                              : 'Not specified',
                          resume: app.resume,
                          created_at: app.created_at,
                          status: app.status || 'pending'
                        }}
                        isCandidate={false}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-10 w-10 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium">No applications yet</h3>
                  <p className="mt-1 text-gray-400">Applicants will appear here when they apply</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobPage;