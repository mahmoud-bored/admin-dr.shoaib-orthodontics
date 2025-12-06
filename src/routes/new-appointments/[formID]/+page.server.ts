import { supabase } from '$lib/supabaseClient.js';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
    const formID = params.formID
    const { error: formSubmissionErr, data: patientFormSubmissions } = await supabase
        .from('patient_form_submissions')
        .select('*')
        .eq('form_id', parseInt(formID));


    if(formSubmissionErr) error(404);

    return {
        patientFormSubmissions: patientFormSubmissions
    }
}