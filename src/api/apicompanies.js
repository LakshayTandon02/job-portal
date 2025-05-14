// Use either ONE of these import approaches:

// APPROACH 1: If you have a centralized supabase client utility
import { supabaseClient } from "@/utils/Superbase";

// OR APPROACH 2: Direct Supabase client import
import { createClient } from '@supabase/supabase-js';

export async function getCompanies(token) {
    const supabase = await supabaseClient(token);
    
    const { data, error } = await supabase
        .from("companies")
        .select("id, name, logo_url, created_at")  // Added more fields
        .order("name", { ascending: true });

    if (error) {
        console.error("Error Fetching Companies:", {
            message: error.message,
            code: error.code,
            details: error.details
        });
        throw new Error(error.message || "Failed to fetch companies");
    }

    return data.map(company => ({
        id: company.id.toString(),
        name: company.name,
        logoUrl: company.logo_url,
        createdAt: company.created_at
    }));
}

export async function addNewcompany(token, companyData) {
    try {
      // Get authenticated client
      const supabase = await supabaseClient(token);
  
      // Verify user (redundant check but good practice)
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("User not authenticated - please sign in again");
      }
  
      // Process file upload
      const logoFile = companyData.logo[0];
      if (!logoFile) throw new Error("No logo file provided");
  
      // Validate file type and size
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!validTypes.includes(logoFile.type)) {
        throw new Error("Only PNG or JPG images are allowed");
      }
      if (logoFile.size > 5 * 1024 * 1024) {
        throw new Error("File must be smaller than 5MB");
      }
  
      // Upload to storage
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${user.id}/logo-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('company-logo')
        .upload(fileName, logoFile, {
          contentType: logoFile.type,
          upsert: false,
          cacheControl: '3600'
        });
  
      if (uploadError) throw uploadError;
  
      // Create company record
      const { data: { publicUrl } } = supabase.storage
        .from('company-logo')
        .getPublicUrl(fileName);
  
      const { data, error } = await supabase
        .from('companies')
        .insert({
          name: companyData.name,
          logo_url: publicUrl,
          created_by: user.id
        })
        .select();
  
      if (error) throw error;
      
      return data[0];
      
    } catch (error) {
      console.error('Company creation failed:', {
        message: error.message,
        code: error.code,
        details: error.details
      });
      
      // Convert specific errors to user-friendly messages
      if (error.message.includes('JWT expired')) {
        throw new Error('Your session has expired - please sign in again');
      }
      if (error.message.includes('storage')) {
        throw new Error('File upload failed: ' + error.message);
      }
      
      throw new Error(error.message || 'Failed to create company');
    }
  }