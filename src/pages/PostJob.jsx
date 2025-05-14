import { getCompanies } from "@/api/apicompanies";
import { addnewjob } from "@/api/apijobs";
import AddCompanyDrawer from "@/components/add-company-drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import useFetch from "@/hooks/usefetch";
import { useUser, useAuth } from "@clerk/clerk-react";
import { zodResolver } from "@hookform/resolvers/zod";
import MDEditor from "@uiw/react-md-editor";
import { State } from "country-state-city";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import { BarLoader } from "react-spinners";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  location: z.string().min(1, { message: "Select a location" }),
  company_id: z.string().min(1, { message: "Select or Add a new Company" }),
  requirements: z.string().min(1, { message: "Requirements are required" }),
});

const PostJob = () => {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: { 
      location: "", 
      company_id: "", 
      requirements: "",
      title: "",
      description: ""
    },
    resolver: zodResolver(schema),
  });

  const {
    loading: loadingCreateJob,
    error: errorCreateJob,
    data: dataCreateJob,
    fn: fnCreateJob,
  } = useFetch(addnewjob);

  const onSubmit = async (data) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const token = await getToken();
      if (!token) {
        console.error("No token found for the user.");
        setIsSubmitting(false);
        return;
      }

      const response = await fnCreateJob({
        token,
        ...data,
        recruiter_id: user.id,
        isOpen: true,
      });

      if (response) {
        navigate("/jobs");
      }
    } catch (error) {
      console.error("Error submitting job:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const {
    loading: loadingCompanies,
    data: companies,
    fn: fnCompanies,
  } = useFetch(getCompanies);

  useEffect(() => {
    if (isLoaded) {
      const fetchCompanies = async () => {
        await fnCompanies();
      };
      fetchCompanies();
    }
  }, [isLoaded]);

  if (!isLoaded || loadingCompanies) {
    return <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />;
  }

  if (user?.unsafeMetadata?.role !== "recruiter") {
    return <Navigate to="/jobs" />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <h1 className="gradient-title font-extrabold text-4xl sm:text-5xl text-center pb-6">
        Post a Job
      </h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Job Title</label>
          <Input
            placeholder="e.g. Senior Frontend Developer"
            {...register("title")}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <Textarea
            placeholder="Detailed job description..."
            {...register("description")}
            className="min-h-[120px]"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <Controller
              name="location"
              control={control}
              render={({ field }) => (
                <Select 
                  value={field.value} 
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {State.getStatesOfCountry("IN").map(({ name }) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Company</label>
            <div className="flex gap-2">
              <Controller
                name="company_id"
                control={control}
                render={({ field }) => (
                  <Select 
                    value={field.value} 
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {companies?.map(({ name, id }) => (
                          <SelectItem key={id} value={id.toString()}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              <AddCompanyDrawer fetchCompanies={fnCompanies} />
            </div>
            {errors.company_id && (
              <p className="text-red-500 text-sm mt-1">{errors.company_id.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Requirements</label>
          <Controller
            name="requirements"
            control={control}
            render={({ field }) => (
              <MDEditor
                value={field.value}
                onChange={field.onChange}
                height={300}
              />
            )}
          />
          {errors.requirements && (
            <p className="text-red-500 text-sm mt-1">{errors.requirements.message}</p>
          )}
        </div>

        {errorCreateJob && (
          <p className="text-red-500 text-sm mt-1">
            {errorCreateJob.message || "Failed to post job. Please try again."}
          </p>
        )}

        <Button
          type="submit"
          className="mt-4"
          disabled={isSubmitting || loadingCreateJob}
        >
          {isSubmitting || loadingCreateJob ? (
            <>
              <span className="mr-2">Posting...</span>
              <BarLoader width={20} height={4} color="#ffffff" />
            </>
          ) : (
            "Post Job"
          )}
        </Button>
      </form>
    </div>
  );
};

export default PostJob;