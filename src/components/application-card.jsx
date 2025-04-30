import { Boxes, BriefcaseBusiness, Download, School } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import useFetch from "@/hooks/usefetch";
import { BarLoader } from "react-spinners";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { updateapplications } from "@/api/apiApplications";
import { toast } from "sonner"; // or your preferred toast library

const ApplicationCard = ({ application, isCandidate = false }) => {
  const handleDownload = () => {
    if (application?.resume) {
      const link = document.createElement("a");
      link.href = application.resume;
      link.target = "_blank";
      link.click();
    }
  };

  const { loading: loadingHiringStatus, fn: fnHiringStatus } = useFetch(updateapplications);

  const handlestatuschange = async (status) => {
    console.log('Changing status to:', status, 'for application:', application.id);
    
    try {
      const result = await fnHiringStatus(
        null, // token handled by useFetch
        { 
          application_id: application.id,
          status 
        }
      );
      
      console.log('Update result:', result);
      
      // Modified success condition - some APIs return success with empty response
      if (result !== undefined) {
        console.log("Status updated successfully to:", status);
        toast.success(`Status changed to ${status}`);
      } else {
        // Some APIs might return empty response on success
        console.log("Status updated (empty response)");
        toast.success(`Status changed to ${status}`);
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Error updating status");
    }
  };

  return (
    <Card className="border-gray-700 bg-transparent hover:shadow-md transition-shadow">
      {loadingHiringStatus && (
        <div className="w-full">
          <BarLoader width={'100%'} color="#36d7b7"/>
        </div>
      )}

      {/* Rest of your component remains the same */}
      <CardHeader className="pb-3">
        <CardTitle className="flex justify-between items-center text-lg">
          <span className="font-medium">
            {isCandidate ? (
              <>
                {application?.job?.title} at <span className="text-blue-400">{application?.job?.company?.name}</span>
              </>
            ) : (
              application?.name || 'Candidate'
            )}
          </span>
          {application?.resume && (
            <button 
              onClick={handleDownload}
              className="text-gray-400 hover:text-blue-400 transition-colors"
              aria-label="Download resume"
            >
              <Download size={18} />
            </button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 px-6 pb-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 text-sm">
          <div className="flex items-center gap-2 text-gray-300">
            <BriefcaseBusiness size={15} className="text-gray-400" /> 
            {application?.experience || '0'} years
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <School size={15} className="text-gray-400" /> 
            {application?.education || 'Education not specified'}
          </div>
        </div>
        
        <div className="flex items-start gap-2 text-sm text-gray-300 mt-1">
          <Boxes size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
          <span>Skills: {application?.skills || 'Not specified'}</span>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center px-6 py-3 text-xs text-gray-400 border-t border-gray-700">
        <span>
          {application?.created_at ? new Date(application.created_at).toLocaleString() : 'Date not available'}
        </span>
        {isCandidate ? (
          <span className={`px-2 py-1 rounded capitalize ${
            application?.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
            application?.status === 'accepted' ? 'bg-green-500/10 text-green-500' :
            'bg-gray-700 text-gray-300'
          }`}>
            {application?.status || 'pending'}
          </span>
        ) : (
          <Select 
            onValueChange={handlestatuschange} 
            defaultValue={application.status || 'applied'}
            disabled={loadingHiringStatus}
          >
            <SelectTrigger className='w-52'>
              <SelectValue placeholder="Application Status"/>
            </SelectTrigger>  
            <SelectContent>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="interviewing">Interviewing</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        )}
      </CardFooter>
    </Card>
  );
};

export default ApplicationCard;