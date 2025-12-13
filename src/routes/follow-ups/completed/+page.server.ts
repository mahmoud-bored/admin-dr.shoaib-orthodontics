import { supabase } from "$lib/supabaseClient";
import type { Actions } from './$types';
import { redirect } from "@sveltejs/kit";


export const actions = {
    default: async ({ request }) => {
        const formData = await request.formData()

        // Don't even bother understanding this
        const processedData = {
            patient_id: parseInt(formData.get('patient_id')?.toString() as string),
            appointment_id: formData.get('appointment_id') === "" ? null : parseInt(formData.get('appointment_id') as string),
            new_payment: formData.get('new_payment')?.toString() === "true" ? true : false,
            new_appointment: formData.get('new_appointment')?.toString() === "true" ? true : false,
            payment_amount: parseInt(formData.get('payment_amount')?.toString() ?? "0"),
            is_amount_positive: formData.get('is_amount_positive')?.toString() === "false" ? false : true,
            notes: formData.get('notes')?.toString() ?? null,
            new_appointment_date: formData.get('new_appointment_date'),
            new_appointment_time: formData.get('new_appointment_time')
        }
        const isNewAppointment = (processedData.new_appointment_date && processedData.new_appointment_time) ? true : false
        const isNewPayment = (processedData.new_payment && processedData.payment_amount !== 0) ? true : false

        const new_appointment_full_date = (processedData.new_appointment_date && processedData.new_appointment_time) ? 
            new Date(processedData.new_appointment_date + ' ' + processedData.new_appointment_time).toISOString() : 
            null
        if(!processedData.patient_id || !processedData.appointment_id) 
            redirect(303, '/dbError')

        if(isNewPayment && isNewAppointment) {
            // Case for: New Payment and New Appointment
            const { error: dbErr } = await supabase.rpc('new_appointment_and_payment', {
                current_patient_id: processedData.patient_id,
                new_appointment_date: new_appointment_full_date as string,
                current_appointment_id: processedData.appointment_id,
                new_payment_amount: processedData.payment_amount,
                is_new_payment_amount_positive: processedData.is_amount_positive,
                new_notes: processedData.notes!
            })
            if(dbErr) {
                console.log(dbErr);
                redirect(303, '/dbError');
            }
        } else if(isNewPayment && !isNewAppointment) {
            // Case for: New Payment and [NO] Appointment
            const { error: dbErr } = await supabase.rpc('new_single_payment', {
                current_patient_id: processedData.patient_id,
                current_appointment_id: processedData.appointment_id,
                payment_amount: processedData.payment_amount,
                is_new_amount_positive: processedData.is_amount_positive,
                new_notes: processedData.notes!
            })
            if(dbErr) {
                console.log(dbErr);
                redirect(303, '/dbError');
            }
        } else if(!isNewPayment && isNewAppointment) {
            // Case for: [NO] Payment and New Appointment
            const { error: dbErr } = await supabase.rpc('new_single_appointment', {
                current_patient_id: processedData.patient_id,
                current_appointment_id: processedData.appointment_id,
                new_appointment_date: new_appointment_full_date as string,
                new_notes: processedData.notes!
            })
            if(dbErr) {
                console.log(dbErr);
                redirect(303, '/dbError');
            }
        }
        redirect(303, '/new-appointments');
    }
} satisfies Actions