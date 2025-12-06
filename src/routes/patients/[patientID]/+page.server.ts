import { supabase } from '$lib/supabaseClient.js';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
    const patientID = params.patientID
    const { error: dbErr, data: patientData } = await supabase
        .from('patient')
        .select('*')
        .eq('patient_id', parseInt(patientID));
    
    const { error: apptErr, data: patientAppointments } = await supabase
        .from('appointment')
        .select('*')
        .eq('patient_id', parseInt(patientID));

    const { error: paymentErr, data: patientPayments } = await supabase
        .from('payment')
        .select('*')
        .eq('patient_id', parseInt(patientID));

    const { error: formSubmissionErr, data: patientFormSubmissions } = await supabase
        .from('form_submission')
        .select('*')
        .eq('patient_id', parseInt(patientID));


    if(dbErr || apptErr || paymentErr || formSubmissionErr) error(404);

    return {
        patientData: patientData,
        patientAppointments: patientAppointments,
        patientPayments: patientPayments,
        patientFormSubmissions: patientFormSubmissions
    }
}