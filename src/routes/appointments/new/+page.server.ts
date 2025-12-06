import { supabase } from "$lib/supabaseClient";
import { error } from "@sveltejs/kit";

const { error: dbErr, data } = await supabase
    .from('patient')
    .select('*')


export function load() {
    if(dbErr) error(404); 
    return {
        patientsData: data,
        error: false
    }
}