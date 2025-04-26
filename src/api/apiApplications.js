import superbaseClient, { supabaseUrl } from "@/utils/Superbase";

export async function applyToJob(token, jobData) {
    const supabase = await superbaseClient(token);

    const random = Math.floor(Math.random() * 90000);
    const fileName = `resume-${random}-${jobData.candidate_id}`;

    // Upload the resume to Supabase storage
    const { error: storageError } = await supabase.storage.from("resumes").upload(fileName, jobData.resume);

    // Check for errors in uploading the resume
    if (storageError) {
        console.log("Error Uploading Resume : ", storageError);  // Corrected reference to storageError
        return null;
    }

    // Construct the public URL for the uploaded resume
    const resume = `${supabaseUrl}/storage/v1/object/public/resumes/${fileName}`;

    // Insert the job application record into the database
    const { data, error } = await supabase.from("applications").insert([{
        ...jobData,
        resume,
    }]).select();

    // Check for errors when submitting the application
    if (error) {
        console.error("Error Submitting Application: ", error);
    } else {
        console.log("Application submitted successfully!", data);
    }

    return data;  // Return the data to indicate success
}

