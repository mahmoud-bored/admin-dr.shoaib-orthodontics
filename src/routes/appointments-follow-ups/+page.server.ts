import { supabase } from "$lib/supabaseClient";
import { error } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";
import { getFullDateISOString } from "$lib/jsAssets";
import type { Actions } from "@sveltejs/kit";




export async function load() {
    const { error: dbErr, data } = await supabase
        .from('patient_appointment')
        .select('*')
    if(dbErr) error(404);
    return {
        formSubmissions: data,
        error: false
    }
}


export const actions = {
    update: async ({ request }) => {
        const formData = await request.formData()
        const patient_id = parseInt(formData.get('patient_id')?.toString() as string)
        const full_name = formData.get('full_name')?.toString()
        const phone_number = formData.get('phone_number')?.toString()

        if(!patient_id || !full_name || !phone_number) redirect(303, '/dbError');
        
        const { error: dbErr } = await supabase
            .from('patient')
            .update({
                full_name: full_name,
                phone_number: phone_number
            })
            .eq('patient_id', patient_id);

        if(dbErr) {
            console.log(dbErr)
            redirect(303, '/dbError');
        }
    },
    present: async ({ request }) => {
        const formData = await request.formData()
        const patient_id = formData.get('patient_id')
        const appointment_id = formData.get('appointment_id')?.toString()
        if(!appointment_id) redirect(303, '/dbError');

        const { error: dbErr } = await supabase
            .from('appointment')
            .update({ attended: true })
            .eq('appointment_id', parseInt(appointment_id));

        if(dbErr) {
            console.log(dbErr)
            redirect(303, '/dbError');
        } else {
            redirect(303, '/appointments-follow-ups/completed?patient_id=' + patient_id + '&appointment_id=' + appointment_id);
        }
    },
    absent: async ({ request }) => {
        const formData = await request.formData()
        const appointment_id = formData.get('appointment_id')?.toString()
        if(!appointment_id) redirect(303, '/dbError');

        const { error: dbErr } = await supabase
            .from('appointment')
            .update({ attended: false })
            .eq('appointment_id', parseInt(appointment_id));

        if(dbErr) {
            console.log(dbErr)
            redirect(303, '/dbError');
        }
    },
    cancelAppointment: async ({ request }) => {
        const formData = await request.formData()
        const appointment_id = formData.get('appointment_id')?.toString()
        if(!appointment_id) redirect(303, '/dbError');

        const { error: dbErr } = await supabase
            .from('appointment')
            .update({ is_cancelled: true })
            .eq('appointment_id', parseInt(appointment_id));
        
        if(dbErr) {
            console.log(dbErr)
            redirect(303, '/dbError');
        }
    },
    newAppointment: async ({ request }) => {
        const formData = await request.formData()
        const patient_id = formData.get('patient_id')?.toString()
        const appointmentDate = formData.get('new_appointment_date')?.toString()
        const appointmentTime = formData.get('new_appointment_time')?.toString()
        if(!patient_id || !appointmentDate || !appointmentTime) redirect(303, '/dbError');

        const { error: dbErr } = await supabase
            .from('appointment')
            .insert({
                patient_id: parseInt(patient_id),
                appointment_date: getFullDateISOString(appointmentDate, appointmentTime),
            })

        if(dbErr) {
            console.log(dbErr)
            redirect(303, '/dbError');
        }
    },
    newPatientAndAppointment: async ({ request }) => {
        const formData = await request.formData()
        const new_full_name = formData.get('full_name')?.toString()
        const new_phone_number = formData.get('phone_number')?.toString()
        const new_appointment_date = formData.get('new_appointment_date')?.toString()
        const new_appointment_time = formData.get('new_appointment_time')?.toString()
        if(!new_full_name || !new_phone_number || !new_appointment_date || !new_appointment_time) redirect(303, '/dbError');
        const new_appointment_full_date = getFullDateISOString(new_appointment_date, new_appointment_time)

        const { error: dbErr } = await supabase.rpc('new_patient_and_appointment', {
            new_full_name,
            new_phone_number,
            new_appointment_date: new_appointment_full_date
        })
        if(dbErr) {
            console.log(dbErr)
            redirect(303, '/dbError');
        }
    }
} satisfies Actions;