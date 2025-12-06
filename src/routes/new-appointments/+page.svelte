<script lang="ts">
	import { formatDate, formatTime, getOlderDataList, getTodayDataList, getYesterdayDataList } from '$lib/jsAssets.js';
    import MobileDevice from 'phosphor-svelte/lib/DeviceMobileSpeaker'
	import Phone from 'phosphor-svelte/lib/Phone';
    import WhatsappLogo from 'phosphor-svelte/lib/WhatsappLogo';
	import FormSubmissionCard from './FormSubmissionCard.svelte';
    let { data } = $props();
    const formSubmissions = data.formSubmissions

    const todayFormSubmissionsList = getTodayDataList(formSubmissions, 'created_at')
    const yesterdayFormSubmissionsList = getYesterdayDataList(formSubmissions, 'created_at')
    const olderFormSubmissionsList = getOlderDataList(formSubmissions, 'created_at')
</script>

<div class="p-4 w-full h-full flex justify-center">
    <div class="w-full lg:w-8/10 max-w-4xl">
        <div class="w-full gap-2 flex flex-col pb-8">
            <p class="text-xl py-2 font-bold text-right">اليوم</p>
            {#if todayFormSubmissionsList.length > 0}
                {#each todayFormSubmissionsList as formSubmission}
                    <FormSubmissionCard 
                        patientData={{
                            patient_id: formSubmission.patient_id,
                            form_id: formSubmission.form_id,
                            appointment_id: formSubmission.appointment_id,
                            full_name: formSubmission.full_name,
                            phone_number: formSubmission.phone_number,
                            appointment_date: formSubmission.appointment_date,
                            call_status: formSubmission.status,
                            attended: formSubmission.attended,
                            next_appointment_created: formSubmission.next_appointment_created,
                        }}
                    />
                {/each}
            {:else}
                <div class="w-full p-4 flex flex-col justify-center items-center gap-3 opacity-75">
                    <MobileDevice size={64} weight="thin" color="#441306" style="rotate: 180deg;" />
                    <p class="text-lg font-bold text-orange-950" dir="rtl">لا توجد طلبات حتى الآن!</p>
                </div>
            {/if}
            <hr class="w-8/10 border border-orange-900/40 self-center my-2"/>
            <p class="text-xl py-2 font-bold text-right">أمس</p>
            {#if yesterdayFormSubmissionsList.length > 0}
                {#each yesterdayFormSubmissionsList as formSubmission}
                    <FormSubmissionCard 
                        patientData={{
                            patient_id: formSubmission.patient_id,
                            form_id: formSubmission.form_id,
                            appointment_id: formSubmission.appointment_id,
                            full_name: formSubmission.full_name,
                            phone_number: formSubmission.phone_number,
                            appointment_date: formSubmission.appointment_date,
                            call_status: formSubmission.status,
                            attended: formSubmission.attended,
                            next_appointment_created: formSubmission.next_appointment_created,
                        }}
                    />
                {/each}
            {:else}
                <div class="w-full p-4 flex flex-col justify-center items-center gap-3 opacity-75">
                    <MobileDevice size={64} weight="thin" color="#441306" style="rotate: 180deg;" />
                    <p class="text-lg font-bold text-orange-950" dir="rtl">لا توجد طلبات بالأمس!</p>
                </div>
            {/if}
            <hr class="w-8/10 border border-orange-900/40 self-center my-2"/>
            <p class="text-xl py-2 font-bold text-right">اقدم</p>
            {#each olderFormSubmissionsList as formSubmission}
                <FormSubmissionCard 
                    patientData={{
                        patient_id: formSubmission.patient_id,
                        form_id: formSubmission.form_id,
                        appointment_id: formSubmission.appointment_id,
                        full_name: formSubmission.full_name,
                        phone_number: formSubmission.phone_number,
                        appointment_date: formSubmission.appointment_date,
                        call_status: formSubmission.status,
                        attended: formSubmission.attended,
                        next_appointment_created: formSubmission.next_appointment_created,
                    }}
                />
            {/each}
        </div>
    </div>
    

</div>