import {supabaseClient} from "@/utils/Superbase";

// 1. Get all jobs (with filters)
export async function getJobs(token, { location, company_id, searchQuery }) {
  const supabase = await supabaseClient(token);

  let query = supabase
    .from("jobs")
    .select("*, saved: saved_jobs(id), company: companies(name,logo_url)");

  if (location) {
    query = query.eq("location", location);
  }

  if (company_id) {
    query = query.eq("company_id", company_id);
  }

  if (searchQuery) {
    query = query.ilike("title", `%${searchQuery}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching Jobs:", error);
    return null;
  }

  return data;
}

// 2. Get saved jobs
export async function getSavedJobs(token) {
  const supabase = await supabaseClient(token);
  const { data, error } = await supabase
    .from("saved_jobs")
    .select("*, job: jobs(*, company: companies(name,logo_url))");

  if (error) {
    console.error("Error fetching Saved Jobs:", error);
    return null;
  }

  return data;
}

// 3. Get single job by ID
export async function getSingleJob(token, { job_id }) {
  const supabase = await supabaseClient(token);
  const { data, error } = await supabase
    .from("jobs")
    .select(
      "*, company: companies(name,logo_url), applications: applications(*)"
    )
    .eq("id", job_id)
    .single();

  if (error) {
    console.error("Error fetching Job:", error);
    return null;
  }

  return data;
}

// 4. Save / Unsave a job
export async function saveJob(token, { alreadySaved, job_id, user_id }) {
  const supabase = await supabaseClient(token);

  if (alreadySaved) {
    const { data, error: deleteError } = await supabase
      .from("saved_jobs")
      .delete()
      .eq("job_id", job_id)
      .eq("user_id", user_id);

    if (deleteError) {
      console.error(" Error Deleting saved job: ", deleteError);
      return null;
    }

    return data;
  } else {
    const { data, error: insertError } = await supabase
      .from("saved_jobs")
      .insert([{ job_id, user_id }])
      .select();

    if (insertError) {
      console.error("Error Saving job:", insertError);
      return null;
    }

    return data;
  }
}

export async function getsingleJob(token, { job_id }) {
    const supabase = await supabaseClient(token);
  
    const { data, error } = await supabase
      .from("jobs")
      .select(`
        id,
        title,
        description,
        isOpen,
        location,
        requriments,
        recruiter_id,
        company:companies(name, logo_url),
        applications:applications(*)
      `)
      .eq("id", job_id)
      .single();
  
    if (error) {
      console.error("❌ Error fetching job:", error.message);
      return null;
    }
  
    if (!data) {
      console.warn("⚠️ Job data is null or undefined for ID:", job_id);
      return null;
    }
  
    console.log("✅ Job data fetched:", data);
    return data;
  }
  

  export async function UpdateHiringStatus(token, options, { job_id, isOpen }) {
    console.log('UpdateHiringStatus Fxn, isOpen: ', isOpen)
    const supabase = await supabaseClient(token);
  
    const { data, error } = await supabase
      .from("jobs")
      .update({ isOpen })  // Dynamically update based on the isOpen value
      .eq("id", job_id)     // Update the correct job using job_id
      .select("*");         // Select returned data
  
    if (error) {
      throw error;
      console.error("❌ Error updating hiring status:", error);
      return null; // Return null instead of an empty array to indicate failure
    }
    else{
      console.log("✅ Hiring status updated:", data);
      return data; // Return the updated data
    }
  
  }

  export async function addnewjob(token , _,jobdata){
    const supabase = await supabaseClient(token);

    const {data , error} =  await supabase
    .from('jobs')
    .insert([jobdata])
     .select("*");

     if(error){
      console.error("Error Creating JOb" , error);
      return null;
     }
     return data;
  }
  