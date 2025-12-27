import { supabase } from "$lib/supabaseClient";
import { error } from "@sveltejs/kit";
import type { Actions } from './$types';
import { redirect } from "@sveltejs/kit";
import { getFullDateISOString } from "$lib/jsAssets";




export async function load() {
    const { error: dbErr, data } = await supabase
        .from('patient_form_submissions')
        .select('*')
        .eq('is_archived', false)
        .eq('is_deleted', false)
        .eq('long_term', false);
    if(dbErr) error(404);
    return {
        formSubmissions: data,
        error: false
    }
}


export const actions = {
    update: async ({ request }) => {
        const formData = await request.formData()
        const current_form_id = parseInt(formData.get('form_id')?.toString() as string)
        const current_patient_id = parseInt(formData.get('patient_id')?.toString() as string)
        const new_full_name = formData.get('full_name')?.toString()
        const new_phone_number = formData.get('phone_number')?.toString()
        const new_status = formData.get('status')?.toString()
        const new_appointment_date = formData.get('new_appointment_date')?.toString()
        const new_appointment_time = formData.get('new_appointment_time')?.toString()

        
        const new_appointment_full_date = getFullDateISOString(new_appointment_date!, new_appointment_time!) ?? null

        if(
            !current_patient_id || 
            !new_full_name || 
            !new_phone_number || 
            !current_form_id
        ) redirect(303, '/dbError');
        
        if(new_status === "appointment_booked") {
            const { error: dbErr } = await supabase.rpc('update&create_patient_form_submission_appointment', {
                current_form_id,
                current_patient_id,
                new_full_name,
                new_phone_number,
                new_status: null as unknown as string,
                new_appointment_date: new_appointment_full_date!
            })
            if(dbErr) {
                console.log(dbErr)
                redirect(303, '/dbError');
            }
        } else if(new_status) {
            const { error: dbErr } = await supabase.rpc('update_patient_form_submission', {
                current_form_id,
                current_patient_id,
                new_full_name,
                new_phone_number,
                new_status
            })

            if(dbErr) {
                console.log(dbErr)
                redirect(303, '/dbError');
            }
        }

    },

} satisfies Actions;