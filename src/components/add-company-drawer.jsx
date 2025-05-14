/* eslint-disable react/prop-types */
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
  } from "@/components/ui/drawer";
  import { Button } from "./ui/button";
  import { Input } from "./ui/input";
  import { z } from "zod";
  import { zodResolver } from "@hookform/resolvers/zod";
  import { useForm, useWatch } from "react-hook-form";
  import useFetch from "@/hooks/usefetch";
  import { addNewcompany } from "@/api/apicompanies";
  import { BarLoader } from "react-spinners";
  import { useEffect } from "react";
  import { AlertCircleIcon, Loader2Icon, PlusIcon, UploadIcon } from "lucide-react";
  import { Label } from "./ui/label";
  
  const schema = z.object({
    name: z.string().min(1, { message: "Company name is required" }),
    logo: z
      .any()
      .refine(
        (file) => file?.[0] && (file[0].type === "image/png" || file[0].type === "image/jpeg"),
        {
          message: "Only PNG or JPG images are allowed (MAX 5MB)",
        }
      ),
  });
  
  const AddCompanyDrawer = ({ fetchCompanies }) => {
    const {
      register,
      handleSubmit,
      formState: { errors },
      reset,
      control,
    } = useForm({
      resolver: zodResolver(schema),
    });
  
    const logoFile = useWatch({ control, name: "logo" })?.[0];
  
    const {
      loading: loadingAddCompany,
      error: errorAddCompany,
      data: dataAddCompany,
      fn: fnAddCompany,
    } = useFetch(addNewcompany);
  
    const onSubmit = async (data) => {
      const formData = new FormData();
      formData.append('name', data.name);
      if (data.logo?.[0]) {
        formData.append('logo', data.logo[0]);
      }
  
      try {
        await fnAddCompany(formData);
        reset();
      } catch (error) {
        console.error("Submission error:", error);
      }
    };
  
    useEffect(() => {
      if (dataAddCompany) {
        fetchCompanies();
      }
    }, [dataAddCompany, fetchCompanies]);
  
    return (
      <Drawer>
        <DrawerTrigger asChild>
          <Button 
            type="button" 
            size="sm" 
            variant="secondary"
            className="text-sm sm:text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transition-all duration-300 hover:shadow-xl px-3 py-1 sm:px-4 sm:py-2"
          >
            <PlusIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Add Company
          </Button>
        </DrawerTrigger>
        
        <DrawerContent className="max-h-[90dvh] overflow-y-auto">
          <div className="mx-auto w-full max-w-md px-2 sm:px-4">
            <DrawerHeader className="text-center px-2 sm:px-4">
              <DrawerTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Add New Company
              </DrawerTitle>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Fill in the details to add a new company
              </p>
            </DrawerHeader>
            
            <form onSubmit={handleSubmit(onSubmit)} className="px-2 sm:px-4 py-4 sm:py-6">
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="name" className="text-xs sm:text-sm font-medium">
                    Company Name
                  </Label>
                  <Input 
                    id="name"
                    placeholder="e.g. Tech Innovations Inc." 
                    {...register("name")}
                    className="text-sm sm:text-base h-10 sm:h-12 focus-visible:ring-2 focus-visible:ring-purple-500"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs animate-pulse">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="logo" className="text-xs sm:text-sm font-medium">
                    Company Logo
                  </Label>
                  <div className="flex items-center justify-center w-full">
                    <Label
                      htmlFor="logo"
                      className="flex flex-col items-center justify-center w-full h-24 sm:h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50/10 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-3 pb-4 sm:pt-5 sm:pb-6">
                        <UploadIcon className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 text-gray-400" />
                        <p className="mb-1 text-xs sm:text-sm text-gray-400">
                          <span className="font-semibold">Click to upload</span>
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-400">
                          PNG or JPG (MAX. 5MB)
                        </p>
                      </div>
                      <Input
                        id="logo"
                        type="file"
                        accept="image/png, image/jpeg"
                        className="hidden"
                        {...register("logo")}
                      />
                    </Label>
                  </div>
                  {logoFile && (
                    <p className="text-xs text-green-600">
                      Selected: {logoFile.name}
                    </p>
                  )}
                  {errors.logo && (
                    <p className="text-red-500 text-xs animate-pulse">
                      {errors.logo.message}
                    </p>
                  )}
                </div>
              </div>
      
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6 sm:mt-8">
                <Button
                  type="submit"
                  disabled={loadingAddCompany}
                  className="w-full text-sm sm:text-base h-10 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transition-all duration-300 hover:shadow-xl"
                >
                  {loadingAddCompany ? (
                    <div className="flex items-center justify-center">
                      <Loader2Icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                      Adding...
                    </div>
                  ) : (
                    "Add Company"
                  )}
                </Button>
                <DrawerClose asChild>
                  <Button 
                    type="button" 
                    variant="outline"
                    className="w-full text-sm sm:text-base h-10 sm:h-12 border-gray-300 hover:bg-gray-100/10"
                  >
                    Cancel
                  </Button>
                </DrawerClose>
              </div>
            </form>
            
            <DrawerFooter className="px-2 sm:px-4">
              {errorAddCompany && (
                <div className="p-2 sm:p-3 text-xs sm:text-sm bg-red-50/10 border border-red-400 rounded-lg text-red-500 animate-fade-in">
                  <AlertCircleIcon className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  {errorAddCompany.message}
                </div>
              )}
              {loadingAddCompany && (
                <div className="w-full">
                  <BarLoader width={"100%"} color="#7c3aed" />
                </div>
              )}
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    );
  };
  
  export default AddCompanyDrawer;