<script lang="ts">
	import type { Database } from "$lib/database.types";
	import Form from "$lib/Form.svelte";
	import { getOrderedDataList } from "$lib/jsAssets";
	import PatientCard from "$lib/PatientCard.svelte";
	import TelInputElmnt from "$lib/TelInputElmnt.svelte";
	import Plus from "phosphor-svelte/lib/Plus";
    import UserCircle from "phosphor-svelte/lib/UserCircle";

    type DbRow = Database['public']['Tables']['patient']['Row'];

    let { 
        patientsList, 
        loading = $bindable()
    }: {
        patientsList: DbRow[],
        loading: boolean
    } = $props()


    function getPatientCardStyle(dataObj: DbRow): string {
        return "border-orange-400"
    }

    let isNewPatientFormOpen = $state({ value: false })
    const patientsListOrdered = getOrderedDataList(patientsList, 'created_at', null)
</script>

{#if isNewPatientFormOpen.value}
    <Form
        bind:isFormOpen={isNewPatientFormOpen}
        formData={{
            title: "متابع جديد",
            preliminaryData: [],
            actionButtonsProperties: {
                actionButtonsType: "icons",
                actionButtonsFunctions: {
                    cancel: () => {
                        isNewPatientFormOpen.value = false
                    }
                }
            },
            formAction: "?/newPatient"
        }}
    >
        <input 
            type="text" 
            name="full_name" 
            class="w-full p-2 rounded-md bg-orange-100 font-bold text-orange-900 mt-1" 
            placeholder="إسم المريض" 
            required 
            dir="rtl"
        />
        <TelInputElmnt inputName="phone_number" />
    </Form>
{/if}

<div class="w-full flex justify-center items-center p-3 mt-2">
    <button 
        class="w-full h-9 py-2 bg-orange-900 rounded-md flex justify-center items-center gap-3 hover:bg-orange-800 transition cursor-pointer drop-shadow"
        type="button"
        onclick={() => isNewPatientFormOpen.value = true}
    >
        <Plus size={20} weight="bold" color="#ffedd4" class="mt-1"/>
        <p class="font-bold text-md text-orange-100">متابع جديد</p>

    </button>
</div>
<div class="w-full flex justify-center">
    <hr class="w-8/10 border border-orange-900/30 self-center my-2"/>
</div>


{#snippet cardIcon()}
    <UserCircle size={36} weight="fill" color="#441306"/>
{/snippet}
<div class="w-full gap-1 flex flex-col pb-8 p-4">
    {#each patientsListOrdered as patient}
        <PatientCard 
            patientData={patient}
            cardStyle={{
                patientCardStyle: getPatientCardStyle(patient),
                alertCardStyle: "",
                disablePatientCard: false,
                cardIcon: cardIcon
            }}
            texts={{
                alertCardText: null,
                disabledButtonPlaceholderText: "",
            }}
            visibleControls={{
                mergePatientCardTriggerActions: true,
                appointmentAttendanceControls: false,
                newAppointmentButton: true,
                deleteOrArchiveRecordControls: true,
            }}
            formControls={{
                editPatientForm: {
                    preliminaryData: [
                        { name: "patient_id", value: patient.patient_id! },
                    ],
                    formAction: "?/updatePatient"
                },
                newAppointmentForm: {
                    preliminaryData: [
                        { name: "patient_id", value: patient.patient_id! },
                    ],
                    formAction: "?/newPatientAppointment"
                },
                deleteRecordForm: {
                    preliminaryData: [
                        { name: "patient_id", value: patient.patient_id! },
                    ],
                    formAction: "?/deletePatient"
                },
                archiveRecordForm: {
                    preliminaryData: [
                        { name: "patient_id", value: patient.patient_id! },
                    ],
                    formAction: "?/archivePatient"
                }
            }}
        />
    {/each}

</div>
