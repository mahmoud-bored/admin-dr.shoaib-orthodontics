import { supabase } from "$lib/supabaseClient";
import { error } from "@sveltejs/kit";
import type { Actions } from './$types';
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


export const actions = {
    update: async ({ request }) => {
        const formData = await request.formData()
        const processedData = {
            patient_id: parseInt(formData.get('patient_id')?.toString() as string),
            form_id: parseInt(formData.get('form_id')?.toString() as string),
            appointment_id: formData.get('appointment_id') === "" ? null : parseInt(formData.get('appointment_id') as string),
            full_name: formData.get('full_name')?.toString(),
            phone_number: formData.get('phone_number')?.toString(),
            call_status: formData.get('call_status')?.toString(),
            new_appointment_date: formData.get('new_appointment_date'),
            new_appointment_time: formData.get('new_appointment_time')
        }
        const new_appointment_full_date = (processedData.new_appointment_date && processedData.new_appointment_time) ? 
            new Date(processedData.new_appointment_date + ' ' + processedData.new_appointment_time).toISOString() : 
            null

        if(
            !processedData.patient_id || 
            !processedData.full_name || 
            !processedData.phone_number || 
            !processedData.call_status ||
            !processedData.form_id
        ) redirect(303, '/dbError');
        

        console.log(processedData, new_appointment_full_date)
        const { error } = await supabase
            .rpc('update_patient_appointment_form_submission', {
                current_patient_id: processedData.patient_id,
                current_form_id: processedData.form_id,
                new_full_name: processedData.full_name,
                new_phone_number: processedData.phone_number,
                new_status: processedData.call_status,
                current_appointment_id: processedData.appointment_id as number,
                new_appointment_date: processedData.call_status === "appointment_booked" ? new_appointment_full_date as string : null as any,
            })
        if(error) console.log(error)
    },
    present: async ({ request }) => {
        const formData = await request.formData()
        const appointment_id = formData.get('appointment_id')
        const patient_id = formData.get('patient_id')
        const form_id = formData.get('form_id')
        if(!appointment_id) redirect(303, '/dbError');

        const { error: dbErr } = await supabase
            .from('appointment')
            .update({ attended: true })
            .eq('appointment_id', parseInt(appointment_id.toString()));
        if(dbErr) {
            console.log(dbErr)
            redirect(303, '/dbError');
        } else {
            redirect(303, '/new-appointments/completed?patient_id=' + patient_id + '&form_id=' + form_id + '&appointment_id=' + appointment_id);
        }
    },
    absent: async ({ request }) => {
        const formData = await request.formData()
        const appointment_id = formData.get('appointment_id')
        if(!appointment_id) redirect(303, '/dbError');

        const { error: dbErr } = await supabase
            .from('appointment')
            .update({ attended: false })
            .eq('appointment_id', parseInt(appointment_id.toString()));
        if(dbErr) {
            console.log(dbErr)
            redirect(303, '/dbError');
        }
    },
    newAppointment: async ({ request }) => {
        const formData = await request.formData()
        const form_id = formData.get('form_id')?.toString()
        const patient_id = formData.get('patient_id')?.toString()
        const appointmentDate = formData.get('new_appointment_date')?.toString()
        const appointmentTime = formData.get('new_appointment_time')?.toString()
        if(!patient_id || !appointmentDate || !appointmentTime || !form_id) redirect(303, '/dbError');

        const { error: dbErr } = await supabase.rpc('new_form_submission_appointment', {
            current_patient_id: parseInt(patient_id),
            new_appointment_date: getFullDateISOString(appointmentDate, appointmentTime) as string,
            current_form_id: parseInt(form_id),
        })
        if(dbErr) {
            console.log(dbErr)
            redirect(303, '/dbError');
        }
    },
    cancelAppointment: async ({ request }) => {
        const formData = await request.formData()
        const appointment_id = formData.get('appointment_id')?.toString()
        const form_id = formData.get('form_id')?.toString()
        if(!appointment_id || !form_id) redirect(303, '/dbError');

        const { error: dbErr } = await supabase.rpc('cancel_appointment', { 
            current_appointment_id: parseInt(appointment_id),
            current_form_id: parseInt(form_id), 
        });
        
        if(dbErr) {
            console.log(dbErr)
            redirect(303, '/dbError');
        }
    }
} satisfies Actions;