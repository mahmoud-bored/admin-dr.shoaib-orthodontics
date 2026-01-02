import { supabase } from "$lib/supabaseClient";
import { error } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";
import type { Actions } from "@sveltejs/kit";




export async function load() {
    const { error: dbErr, data } = await supabase
        .from('patient_appointment')
        .select('*')
        .eq('long_term', false)
        .eq('is_archived', false)
        .eq('is_patient_deleted', false)
        .eq('is_appointment_deleted', false);

    if(dbErr) error(404);
    return {
        patientsAppointments: data,
        error: false
    }
}


export const actions = {
    update: async ({ request }) => {
        const formData = await request.formData()
        const current_patient_id = parseInt(formData.get('patient_id')?.toString() as string)
        const current_appointment_id = parseInt(formData.get('appointment_id')?.toString() as string)
        const new_appointment_date = formData.get('date_iso_string')?.toString()
        const new_full_name = formData.get('full_name')?.toString()
        const new_phone_number = formData.get('phone_number')?.toString()
        const new_long_term = formData.get('long_term')?.toString() === "true" ? true : false

        if(
            !current_patient_id || 
            !new_full_name || 
            !new_phone_number || 
            !new_appointment_date ||
            !current_appointment_id
        ) redirect(303, '/dbError');
                
        const { error: dbErr } = await supabase.rpc('update_patient_appointment', {
            current_patient_id,
            current_appointment_id,
            new_full_name,
            new_phone_number,
            new_long_term,
            new_appointment_date
        })

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
        const new_appointment_date = formData.get('date_iso_string')?.toString()
        const appointment_id = formData.get('appointment_id')?.toString()
        if(!patient_id || !new_appointment_date || !appointment_id) redirect(303, '/dbError');

        const { error: dbErr } = await supabase.rpc('new_related_appointment', {
            current_patient_id: parseInt(patient_id),
            current_appointment_id: parseInt(appointment_id),
            new_appointment_date,
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
        const new_appointment_date = formData.get('date_iso_string')?.toString()
        if(!new_full_name || !new_phone_number || !new_appointment_date) redirect(303, '/dbError');

        const { error: dbErr } = await supabase.rpc('new_patient_and_appointment', {
            new_full_name,
            new_phone_number,
            new_appointment_date
        })
        if(dbErr) {
            console.log(dbErr)
            redirect(303, '/dbError');
        }
    },
    deleteAppointment: async ({ request }) => {
        const formData = await request.formData()
        const appointment_id = formData.get('appointment_id')?.toString()
        if(!appointment_id) redirect(303, '/dbError');

        const { error: dbErr } = await supabase.rpc('delete_related_appointment', {
            current_appointment_id: parseInt(appointment_id)
        })
        
        if(dbErr) {
            console.log(dbErr)
            redirect(303, '/dbError');
        }
    },
    archiveAppointment: async ({ request }) => {
        const formData = await request.formData()
        const patient_id = formData.get('patient_id')?.toString()
        if(!patient_id) redirect(303, '/dbError');

        const { error: dbErr } = await supabase
            .from('patient')
            .update({ is_archived: true })
            .eq('patient_id', parseInt(patient_id));
        
        if(dbErr) {
            console.log(dbErr)
            redirect(303, '/dbError');
        }
    }
} satisfies Actions;