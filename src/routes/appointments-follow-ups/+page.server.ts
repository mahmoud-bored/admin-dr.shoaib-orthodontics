import { supabase } from "$lib/supabaseClient";
import { error } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";
import { getFullDateISOString } from "$lib/jsAssets";




export async function load() {
    const { error: dbErr, data } = await supabase
        .from('patient_form_submission_appointments')
        .select('*')
    if(dbErr) error(404);
    return {
        formSubmissions: data,
        error: false
    }
}