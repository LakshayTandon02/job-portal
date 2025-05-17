import { supabaseClient, supabaseUrl } from "@/utils/Superbase";

export async function applyToJob(token, jobData) {
    const supabase = await supabaseClient(token);

    const random = Math.floor(Math.random() * 90000);
    const fileName = `resume-${random}-${jobData.candidate_id}`;

    // Upload the resume to Supabase storage
    const { error: storageError } = await supabase.storage
        .from("resumes")
        .upload(fileName, jobData.resume);

    if (storageError) {
        console.error("Error Uploading Resume:", storageError);
        return null;
    }

    const resume = `${supabaseUrl}/storage/v1/object/public/resumes/${fileName}`;

    const { data, error } = await supabase
        .from("applications")
        .insert([{ ...jobData, resume }])
        .select();

    if (error) {
        console.error("Error Submitting Application:", error);
        return null;
    }

    return data;
}

export async function updateapplications(token, { application_id, status }) {
    console.log('Updating application:', { application_id, status }); // Debug log
    
    const supabase = await supabaseClient(token);
    const { data, error } = await supabase
        .from("applications")
        .update({ status })
        .eq("id", application_id)
        .select();

    console.log('Update result:', { data, error }); // Debug log

    if (error) {
        console.error("Supabase Error Details:", {
            message: error.message,
            code: error.code,
            details: error.details
        });
        return null;
    }
    
    if (!data || data.length === 0) {
        console.error("No data returned from update");
        return null;
    }
    
    return data;
}

export async function getApplications(token, { user_id }) {
    const supabase = await supabaseClient(token);
    const { data, error } = await supabase
      .from("applications")
      .select("*, job:jobs(title, company:companies(name))")
      .eq("candidate_id", user_id);
  
    if (error) {
      console.error("Error fetching Applications:", error);
      return null;
    }
  
    return data;
  }