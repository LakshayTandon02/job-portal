import {supabaseClient} from "@/utils/Superbase";


export async function getcompanies(token){
    const supabase = await superbaseClient(token);

    const {data,error} = await supabase.from("companies").select("*");

    if(error){
        console.error("Error Fetching Companies",error);
        return null;
    }

     return data;
}
 