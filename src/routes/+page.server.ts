import { supabase } from "$lib/supabaseClient";
import { redirect, type Actions } from "@sveltejs/kit";

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
    }
} satisfies Actions