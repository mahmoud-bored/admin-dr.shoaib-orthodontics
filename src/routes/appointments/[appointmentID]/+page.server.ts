import { supabase } from "$lib/supabaseClient";
import { error } from "@sveltejs/kit";
import type { Actions } from './$types';
import { redirect } from "@sveltejs/kit";

export async function load({ params }) {
    const appointmentID = params.appointmentID
    const { error: dbErr, data: appointmentData } = await supabase
        .from('patient_appointment')
        .select('*')
        .eq('appointment_id', parseInt(appointmentID));


    if(dbErr) error(404); 
    return {
        appointmentData: appointmentData,
        error: false
    }
}


export const actions = {
    cancel: async ({ request }) => {
        const formData = await request.formData()
        const appointmentID = formData.get('appointment_id')?.toString()
        if(!appointmentID) redirect(500, '/dbError');
        const { error: dbErr } = await supabase
            .from('appointment')
            .update({ is_cancelled: true })
            .eq('appointment_id', parseInt(appointmentID));

        console.log(dbErr)
        if(dbErr) error(500, '/dbError');
            else redirect(303, '/appointments');
    },
    complete: async ({ request }) => {
        const formData = await request.formData()
        const patientID = formData.get('patient_id')
        const appointmentID = formData.get('appointment_id')?.toString()

        if(!patientID || !appointmentID) redirect(500, '/dbError');
        const { error: dbErr } = await supabase
            .from('appointment')
            .update({ is_done: true })
            .eq('appointment_id', parseInt(appointmentID));
        console.log(dbErr)
        if(dbErr) redirect(500, '/dbError');
            else redirect(303, '/payments/new?patient_id=' + patientID + '&appointment_id=' + appointmentID);
    }
} satisfies Actions;


