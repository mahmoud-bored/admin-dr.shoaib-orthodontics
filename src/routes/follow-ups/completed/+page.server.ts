import { getFullDateISOString } from "$lib/jsAssets";
import { supabase } from "$lib/supabaseClient";
import type { Actions } from './$types';
import { redirect } from "@sveltejs/kit";


export const actions = {
    default: async ({ request }) => {
        const formData = await request.formData()

        const current_patient_id = parseInt(formData.get('patient_id')?.toString() as string)
        const current_appointment_id = formData.get('appointment_id') === "" ? null : parseInt(formData.get('appointment_id') as string)
        const new_payment = formData.get('new_payment')?.toString() === "true" ? true : false
        const payment_amount = parseInt(formData.get('payment_amount')?.toString() ?? "0")
        const is_new_amount_positive = formData.get('is_amount_positive')?.toString() === "false" ? false : true
        const new_notes = formData.get('notes')?.toString() ?? null as unknown as string
        const isNewAppointment = formData.get('new_appointment')?.toString()
        const new_appointment_date = formData.get('date_iso_string')?.toString()!

        const isNewPayment = (new_payment && payment_amount !== 0) ? true : false

        if(!current_patient_id || !current_appointment_id) 
            redirect(303, '/dbError')

        if(isNewPayment && isNewAppointment) {
            // Case for: New Payment and New Appointment
            const { error: dbErr } = await supabase.rpc('new_appointment_and_payment', {
                current_patient_id,
                current_appointment_id,
                new_appointment_date,
                new_payment_amount: payment_amount,
                is_new_payment_amount_positive: is_new_amount_positive,
                new_notes
            })
            if(dbErr) {
                console.log(dbErr);
                redirect(303, '/dbError');
            }
        } else if(isNewPayment && !isNewAppointment) {
            // Case for: New Payment and [NO] Appointment
            const { error: dbErr } = await supabase.rpc('new_single_payment', {
                current_patient_id,
                current_appointment_id,
                payment_amount,
                is_new_amount_positive,
                new_notes
            })
            if(dbErr) {
                console.log(dbErr);
                redirect(303, '/dbError');
            }
        } else if(!isNewPayment && isNewAppointment) {
            // Case for: [NO] Payment and New Appointment
            const { error: dbErr } = await supabase.rpc('new_single_appointment', {
                current_patient_id,
                current_appointment_id,
                new_appointment_date,
                new_notes
            })
            if(dbErr) {
                console.log(dbErr);
                redirect(303, '/dbError');
            }
        } else if(!isNewPayment && !isNewAppointment) {
            // Case for: [NO] Payment and [NO] Appointment
            const { error: dbErr } = await supabase
                .from('appointment')
                .update({ notes: new_notes })
                .eq('appointment_id', current_appointment_id);
            
            if(dbErr) {
                console.log(dbErr);
                redirect(303, '/dbError');
            }
        }
        redirect(303, '/new-appointments');
    }
} satisfies Actions