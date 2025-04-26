import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BarLoader } from 'react-spinners';
import { supabase } from '@/utils/Superbase';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from './ui/drawer';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';

const schema = z.object({
  experience: z
    .number({ invalid_type_error: "Experience is required" })
    .min(0, { message: "Experience must be at least 0" }),
  skills: z.string().min(1, { message: "Skills are required" }),
  education: z.enum(["Intermediate", "Graduate", "Post Graduate"], {
    message: "Education is required",
  }),
  resume: z.string().url({ message: "Resume must be uploaded" }),
});

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
}

const ApplyJobDrawer = ({ user, job, applied = false, fetchJob }) => {
  const [loadingApply, setLoadingApply] = useState(false);
  const [errorApply, setErrorApply] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      experience: 0,
      skills: '',
      education: '',
      resume: '',
    },
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      setErrorApply('Please upload a PDF or Word document');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorApply('File size must be less than 5MB');
      return;
    }

    const fileExt = file.name.split('.').pop();
    const fileKey = `${generateRandomString(10)}.${fileExt}`;
    setLoadingApply(true);
    setErrorApply(null);
    
    try {
      const { data, error } = await supabase.storage
        .from('resumes')
        .upload(`resumes/${fileKey}`, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(data.path);

      if (!publicUrl) throw new Error('Failed to get public URL');

      setValue('resume', publicUrl, { shouldValidate: true });
    } catch (error) {
      console.error('Upload error:', error);
      setErrorApply(error.message || 'Failed to upload resume');
    } finally {
      setLoadingApply(false);
    }
  };

  const handleApply = async (formData) => {
    if (!formData.resume) {
      setErrorApply('Please upload your resume first');
      return;
    }

    setLoadingApply(true);
    try {
      const { error } = await supabase.from('applications').insert([
        {
          job_id: job.id,
          candidate_id: user.id,
          resume: formData.resume,
          experience: formData.experience,
          skills: formData.skills,
          education: formData.education,
          status: 'applied',
        },
      ]);

      if (error) throw error;

      fetchJob();
      reset();
      alert('Application submitted successfully!');
    } catch (error) {
      setErrorApply(error.message);
      console.error('Application error:', error);
    } finally {
      setLoadingApply(false);
    }
  };

  return (
    <Drawer open={applied ? false : undefined}>
      <DrawerTrigger asChild>
        <Button
          disabled={!job?.isOpen || applied}
          className={`w-full sm:w-auto ${
            applied 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          {job?.isOpen ? (applied ? 'Applied ✓' : 'Apply') : 'Hiring Closed'}
        </Button>
      </DrawerTrigger>

      <DrawerContent className="max-w-lg mx-auto">
        <DrawerHeader>
          <DrawerTitle>Apply for {job?.title} at {job?.company?.name}</DrawerTitle>
          <DrawerDescription>Please fill the form below.</DrawerDescription>
        </DrawerHeader>

        <form onSubmit={handleSubmit(handleApply)} className="p-4 flex flex-col gap-4">
          <div>
            <Label htmlFor="experience">Years of Experience</Label>
            <Input
              id="experience"
              type="number"
              placeholder="0"
              {...register('experience', { valueAsNumber: true })}
            />
            {errors.experience && <p className="text-red-500 text-sm mt-1">{errors.experience.message}</p>}
          </div>

          <div>
            <Label htmlFor="skills">Skills</Label>
            <Input
              id="skills"
              type="text"
              placeholder="JavaScript, React, Node.js"
              {...register('skills')}
            />
            {errors.skills && <p className="text-red-500 text-sm mt-1">{errors.skills.message}</p>}
          </div>

          <div>
            <Label>Education Level</Label>
            <Controller
              name="education"
              control={control}
              render={({ field }) => (
                <RadioGroup onValueChange={field.onChange} value={field.value} className="mt-2">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="Intermediate" id="Intermediate" />
                    <Label htmlFor="Intermediate">Intermediate</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="Graduate" id="Graduate" />
                    <Label htmlFor="Graduate">Graduate</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="Post Graduate" id="Post Graduate" />
                    <Label htmlFor="Post Graduate">Post Graduate</Label>
                  </div>
                </RadioGroup>
              )}
            />
            {errors.education && <p className="text-red-500 text-sm mt-1">{errors.education.message}</p>}
          </div>

          <div>
            <Label htmlFor="resume">Resume (PDF or Word)</Label>
            <Input
              id="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              disabled={loadingApply}
              className="mt-2"
            />
            {watch('resume') ? (
              <p className="text-green-500 text-sm mt-1">Resume uploaded successfully!</p>
            ) : (
              <p className="text-gray-500 text-sm mt-1">Please upload your resume</p>
            )}
            {errors.resume && <p className="text-red-500 text-sm mt-1">{errors.resume.message}</p>}
          </div>

          {errorApply && <p className="text-red-500 text-sm">{errorApply}</p>}

          {loadingApply && (
            <div className="flex flex-col gap-2">
              <BarLoader width="100%" color="#3b82f6" />
              <p className="text-sm text-gray-500 text-center">Uploading, please wait...</p>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 mt-4"
            disabled={loadingApply || !watch('resume')}
          >
            {loadingApply ? 'Processing...' : 'Apply'}
          </Button>
        </form>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline" className="w-full" disabled={loadingApply}>
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ApplyJobDrawer;