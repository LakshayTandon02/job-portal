import { useUser, useAuth } from '@clerk/clerk-react';
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Heart, MapPinIcon, Trash2Icon } from 'lucide-react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';
import { saveJob } from '@/api/apijobs';

const JobCard = ({
  job,
  isMyjob = false,
  savedInit = false,
  onJobSaved = () => {},
}) => {
  const [saved, setSaved] = useState(savedInit);
  const { user } = useUser();
  const { getToken } = useAuth();

  const handleSaveJob = async () => {
    try {
      const token = await getToken();

      const result = await saveJob(token, { alreadySaved: saved }, {
        job_id: job.id,
        user_id: user.id,
      });

      if (result) {
        setSaved(!saved);
        onJobSaved();
      }
    } catch (err) {
      console.error('Error saving job:', err);
    }
  };

  return (
    <Card className="bg-[#011532] text-white border border-gray-700 shadow-md rounded-xl">
      <CardHeader>
        <CardTitle className="flex justify-between font-bold">
          {job.title}
          {isMyjob && (
            <Trash2Icon fill="red" size={18} className="text-red-300 cursor-pointer" />
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 flex-1">
        <div className='flex justify-between'>
          {job.company && <img src={job.company.logo_url} className='h-6' />}
          <div className='flex gap-2 items-center'>
            <MapPinIcon size={15} /> {job.location}
          </div>
        </div>
        <hr className='bg-[#011532] solid to-black' />
        {job.description?.substring(0, job.description.indexOf("."))}
      </CardContent>

      <CardFooter className="flex gap-2">
        <Link to={`/job/${job.id}`} className="flex-1">
          <Button
            variant="secondary"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            More Details
          </Button>
        </Link>

        {!isMyjob && (
          <Button
            variant="outline"
            className={`w-15 ${saved ? 'bg-red-100' : ''}`}
            onClick={handleSaveJob}
          >
            {saved ? (
              <Heart size={20} stroke="red" fill="red" />
            ) : (
              <Heart size={20} />
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default JobCard;
