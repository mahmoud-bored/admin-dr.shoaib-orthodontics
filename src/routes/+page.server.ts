import { getFullDateISOString } from "$lib/jsAssets";
import { supabase } from "$lib/supabaseClient";
import { redirect, type Actions } from "@sveltejs/kit";


export async function load() {
    const { error: dbErr, data } = await supabase
        .from('patient_appointment')
        .select('*')
        .eq('is_archived', false)
        .eq('is_test', false)
        .eq('is_patient_deleted', false)
        .eq('is_appointment_deleted', false);
        
    if(dbErr) {
        console.log(dbErr)
        redirect(303, '/dbError');
    }
    return {
        patientAppointments: data
    }
}

export const actions = {
    newAppointments: async () => {
        const { error: dbErr, data } = await supabase
            .from('patient_form_submissions')
            .select('*')
            .eq('is_archived', false)
            .eq('is_deleted', false)
            .eq('long_term', false);

        if(dbErr) redirect(303, '/dbError');
        return data
    },
    newAppointmentsFollowUps: async () => {
        const { error: dbErr, data } = await supabase
            .from('patient_appointment')
            .select('*')
            .eq('long_term', false)
            .eq('is_archived', false)
            .eq('is_patient_deleted', false)
            .eq('is_appointment_deleted', false);

        if(dbErr) redirect(303, '/dbError');
        return data
    },
    followUps: async () => {
        const { error: dbErr, data } = await supabase
            .from('patient')
            .select('*')
            .eq('is_archived', false)
            .eq('is_deleted', false)
            .eq('long_term', true);

        if(dbErr) redirect(303, '/dbError');
        return data
    },
    newPatientAppointment: async ({ request }) => {
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
    newRelativeAppointment: async ({ request }) => {
        const formData = await request.formData()
        const patient_id = formData.get('patient_id')?.toString()
        const appointment_id = formData.get('appointment_id')?.toString()
        const appointmentDate = formData.get('new_appointment_date')?.toString()
        const appointmentTime = formData.get('new_appointment_time')?.toString()
        if(!patient_id || !appointmentDate || !appointmentTime || !appointment_id) redirect(303, '/dbError');

        const { error: dbErr } = await supabase.rpc('new_related_appointment', {
            current_patient_id: parseInt(patient_id),
            current_appointment_id: parseInt(appointment_id),
            new_appointment_date: getFullDateISOString(appointmentDate, appointmentTime),
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
    },
    editAppointment: async ({ request }) => {
        const formData = await request.formData()
        const appointment_id = formData.get('appointment_id')?.toString()
        const new_appointment_date = formData.get('new_appointment_date')?.toString()
        const new_appointment_time = formData.get('new_appointment_time')?.toString()
        if(!appointment_id || !new_appointment_date || !new_appointment_time) redirect(303, '/dbError');
        const new_appointment_full_date = getFullDateISOString(new_appointment_date, new_appointment_time)

        const { error: dbErr } = await supabase
            .from('appointment')
            .update({
                appointment_date: new_appointment_full_date
            })
            .eq('appointment_id', parseInt(appointment_id))

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
} satisfies Actions