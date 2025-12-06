import { supabase } from "$lib/supabaseClient";
import { error, redirect } from "@sveltejs/kit";
import type { Actions } from './$types';



export async function load() {
    const { error: dbErr, data } = await supabase
        .from('patient_appointment')
        .select('*')

    if(dbErr) error(404);
    return {
        patientsAppointments: data,
        error: false
    }
}

export const actions = {
	cancel: async ({ request }) => {
        const formData = await request.formData()
        const appointmentID = formData.get('appointment_id')?.toString()

        if(!appointmentID) redirect(500, '/dbError');
        const { error } = await supabase
            .from('appointment')
            .update({ is_cancelled: true })
            .eq('appointment_id', parseInt(appointmentID));
        console.log(error)
        if(error) redirect(500, '/dbError');
            else redirect(200, '/appointments');
    },
    reschedule: async ({ request }) => {
        const formData = await request.formData()
        const newDate = formData.get('new_date')?.toString()
        const appointmentID = formData.get('appointment_id')?.toString()
        if(!newDate || !appointmentID) redirect(500, '/dbError');

        const { error } = await supabase
            .from('appointment')
            .update({ appointment_date: newDate })
            .eq('appointment_id', parseInt(appointmentID));

        if(error) redirect(500, '/dbError');
            else redirect(200, '/appointments');
	},
	complete: async ({ request }) => {
        const formData = await request.formData()
        const patientID = formData.get('patient_id')
        const appointmentID = formData.get('appointment_id')?.toString()
        console.log(formData, appointmentID)
        if(!patientID || !appointmentID) redirect(500, '/dbError');
		const { error } = await supabase
            .from('appointment')
            .update({ is_done: true })
            .eq('appointment_id', parseInt(appointmentID));
        if(error) redirect(500, '/dbError');
            else redirect(200, '/payments/new?patient_id=' + patientID + '&appointment_id=' + appointmentID);
	}
} satisfies Actions;