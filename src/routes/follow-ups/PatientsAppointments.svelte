<script lang="ts">
	import type { Database } from "$lib/database.types";
	import { formatDate, formatTime, getOrderedDataList } from "$lib/jsAssets";
	import PatientCard from "$lib/PatientCard.svelte";
	import CalendarDots from "phosphor-svelte/lib/CalendarDots";
	import X from "phosphor-svelte/lib/X";
    import Clock from "phosphor-svelte/lib/Clock";

    let { 
        patientAppointments, 
        loading = $bindable()
    }: {
        patientAppointments: Database['public']['Views']['patient_appointment']['Row'][],
        loading: boolean
    } = $props()

    type DbRow = Database['public']['Views']['patient_appointment']['Row'];

    function getPatientCardStyle(dataObj: DbRow): string {
        if(dataObj.attended === null) {
            if (dataObj.is_cancelled) return "border-red-600"
        } else if(dataObj.attended === false) {
            if(dataObj.next_appointment_created !== true) return "border-red-600"
        }
        return "border-green-600"
    }


    function getAlertCardStyle(dataObj: DbRow): string {
        if(dataObj.attended === null) {
            if(dataObj.is_cancelled) return "bg-red-600 drop-shadow-md drop-shadow-red-600/70"
        } else if(dataObj.attended === false) {
            if(dataObj.next_appointment_created !== true) return "bg-red-600 drop-shadow-md drop-shadow-red-600/70"
        }
        return "bg-green-600 w-26"
    }

    function getAlertText(dataObj: DbRow): string {
        let alertText = ``
        if(dataObj.attended === null) 
                if(dataObj.is_cancelled) alertText = "تم إلغاء الموعد"
                    else alertText = `${formatTime(dataObj.appointment_date!)} \n ${formatDate(dataObj.appointment_date!)}`
            else if (dataObj.attended === false) alertText = "لم يحضر الموعد"
            else if(dataObj.attended === true) alertText = "تم حضور الموعد"
            
        return alertText
    }
    function disableAppointmentDateEditing(dataObj: DbRow): boolean {
        if(dataObj.attended !== null || dataObj.is_cancelled) return true
            else return false
    }
    function getDisabledButtonPlaceholderText(dataObj: DbRow): string {
        if(dataObj.next_appointment_created) return "تم إنشاء موعد جديد"
            else return ""
    }
    function displayNewAppointmentButton(dataObj: DbRow): boolean {
        if(
            (dataObj.attended === null && dataObj.is_cancelled && !dataObj.next_appointment_created) ||
            (dataObj.attended === false && !dataObj.next_appointment_created) || 
            (dataObj.attended === true && !dataObj.next_appointment_created)
        ) return true
        else return false
    }
    function showDisabledCardButtonPlaceHolder(dataObj: DbRow): boolean {
        if(dataObj.next_appointment_created) return true
            else return false
    } 
    function showAppointmentAttendanceControls(dataObj: DbRow): boolean {
        if(dataObj.attended === null && !dataObj.is_cancelled) return true
            else return false
    }
    function isPatientCardDisabled(dataObj: DbRow): boolean {
        if(dataObj.next_appointment_created) return true
            else return false
    }

    function showFakeLoadingSpinner(): void {
        loading = true
        setTimeout(() => {
            loading = false
        }, 200)
    }


    const todayDateObj = $state(new Date())
    const todayDateString = $state(formatDate(todayDateObj.toLocaleDateString()))
    const tomorrowDateObj = new Date(formatDate(todayDateString))
    tomorrowDateObj.setDate(todayDateObj.getDate() + 1)
    const tomorrowDateString = $state(formatDate(tomorrowDateObj.toLocaleDateString()))

    let filterDate1 = $state("")
    let filterDate2 = $state("")
    function checkFutureData(dataObj: DbRow): boolean {
        if(todayDateObj < new Date(dataObj.appointment_date!)) return true
            else return false
    }
    function checkPastData(dataObj: DbRow): boolean {
        if(todayDateObj > new Date(dataObj.appointment_date!)) return true
            else return false
    }
    const getFutureData = (date1: string, date2: string) => getOrderedDataList(patientAppointments, 'appointment_date', [date1, date2], checkFutureData, true)
    const getPastData = (date1: string, date2: string) => getOrderedDataList(patientAppointments, 'appointment_date', [date1, date2], checkPastData)
    let orderedFutureAppointmentsList = $state({} as DbRow[])
    let orderedPastAppointmentsList = $state({} as DbRow[])
    $effect(() => {
        if(filterDate1 && filterDate2) {
            showFakeLoadingSpinner()
            
            if(filterDate1 > filterDate2) {
                orderedFutureAppointmentsList = getFutureData(filterDate1, filterDate2)
                orderedPastAppointmentsList = getPastData(filterDate2, filterDate1)
            } else {
                orderedFutureAppointmentsList = getFutureData(filterDate2, filterDate1)
                orderedPastAppointmentsList = getPastData(filterDate1, filterDate2)
            }
        } else {
            showFakeLoadingSpinner()
            orderedFutureAppointmentsList = getOrderedDataList(patientAppointments, 'appointment_date', null, checkFutureData, true)
            orderedPastAppointmentsList = getOrderedDataList(patientAppointments, 'appointment_date', null, checkPastData)
        }
    })

    
    function getDayName(dateStr: string) {
        var date = new Date(dateStr);
        return date.toLocaleDateString('ar-eg', { weekday: 'long' });        
    }
</script>

{#snippet cardIcon()}
    <Clock size={32} weight="fill" color="#441306" />
{/snippet}
<div class="w-full gap-1 flex flex-col pb-8 p-4">
    <div class="w-full h-7 flex justify-center items-center gap-2">
        <input 
            type="date" 
            bind:value={filterDate1}
            class="w-full h-full text-sm py-0.5 px-2 bg-orange-100 border border-orange-900 rounded-full flex justify-center items-center hover:bg-orange-200 transition cursor-pointer"
        />
        <input 
            type="date" 
            bind:value={filterDate2}
            class="w-full h-full text-sm py-0.5 px-2 bg-orange-100 border border-orange-900 rounded-full flex justify-center items-center hover:bg-orange-200 transition cursor-pointer"
        />
        <button 
            type="button"
            onclick={() => {
                filterDate1 = "";
                filterDate2 = "";
            }}
            disabled={(filterDate1 || filterDate2) ? false : true}
            class="min-w-9 h-full bg-orange-100 border border-orange-900 rounded-full flex justify-center items-center hover:brightness-80 transition cursor-pointer 
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100"
        >
            <X size={16} weight="bold" color="#441306" />
        </button>
    </div>

    {#if orderedFutureAppointmentsList.length > 0}
        {#each orderedFutureAppointmentsList as appointment, i}
            {#if i === 0 || formatDate(appointment.appointment_date!) !== formatDate(orderedFutureAppointmentsList[i - 1].appointment_date!)}
                <p class="text-xl nth-2:pt-5 py-2 font-bold text-right text-orange-900">
                    {
                        getDayName(appointment.appointment_date!) + " - " + formatDate(appointment.appointment_date!)
                    }
                </p>
            {/if}
            <PatientCard 
                patientData={appointment}
                cardStyle={{
                    patientCardStyle: getPatientCardStyle(appointment),
                    alertCardStyle: getAlertCardStyle(appointment),
                    disablePatientCard: isPatientCardDisabled(appointment),
                    cardIcon: cardIcon
                }}
                texts={{
                    alertCardText: getAlertText(appointment),
                    disabledButtonPlaceholderText: getDisabledButtonPlaceholderText(appointment),
                }}
                visibleControls={{
                    mergePatientCardTriggerActions: false,
                    disabledCardButtonPlaceHolder: {
                        show: showDisabledCardButtonPlaceHolder(appointment),
                    },
                    appointmentAttendanceControls: showAppointmentAttendanceControls(appointment),
                    newAppointmentButton: displayNewAppointmentButton(appointment),
                    deleteOrArchiveRecordControls: true,
                }}
                formControls={{
                    editPatientForm: {
                        preliminaryData: [
                            { name: "patient_id", value: appointment.patient_id! },
                            { name: "appointment_id", value: appointment.appointment_id! },
                        ],
                        rawDatePicker: {
                            defaultValue: appointment.appointment_date!,
                            disabled: disableAppointmentDateEditing(appointment),
                        },
                        formAction: "?/update"
                    },
                    appointmentAttendedConfirmationForm: {
                        preliminaryData: [
                            { name: "patient_id", value: appointment.patient_id! },
                            { name: "appointment_id", value: appointment.appointment_id! },
                        ],
                        formAction: ""
                    },
                    cancelAppointmentConfirmationForm: {
                        preliminaryData: [
                            { name: "appointment_id", value: appointment.appointment_id! },
                        ],
                        formAction: "?/cancelAppointment"
                    },
                    newAppointmentForm: {
                        preliminaryData: [
                            { name: "patient_id", value: appointment.patient_id! },
                            { name: "appointment_id", value: appointment.appointment_id! },
                        ],
                        formAction: "?/newAppointment"
                    },
                    deleteRecordForm: {
                        preliminaryData: [
                            { name: "appointment_id", value: appointment.appointment_id! },
                        ],
                        formAction: "?/deleteAppointment"
                    },
                    archiveRecordForm: {
                        preliminaryData: [
                            { name: "patient_id", value: appointment.patient_id! },
                        ],
                        formAction: "?/archiveAppointment"
                    }
                }}
            />
        {/each}
    {:else}
        <div class="w-full p-4 flex flex-col justify-center items-center gap-3 opacity-75">
            <CalendarDots size={64} weight="thin" color="#441306" />
            <p class="text-lg font-bold text-orange-950" dir="rtl">لا توجد مواعيد محددة!</p>
        </div>
    {/if}
</div>

<hr class="w-full border-10 border-orange-900 self-center mt-8"/>
<div class="w-full min-h-full gap-1 flex flex-col pb-8 p-4 bg-orange-100">
    {#if orderedPastAppointmentsList.length > 0}
        <p class="text-2xl pb-8 font-bold text-center text-orange-900">
            مواعيد سابقة
        </p>

        {#each orderedPastAppointmentsList as appointment, i}
            {#if i === 0 || formatDate(appointment.appointment_date!) !== formatDate(orderedPastAppointmentsList[i - 1].appointment_date!)}
                <p class="text-xl not-nth-2:py-3 font-bold text-right text-orange-900">
                    { getDayName(appointment.appointment_date!) + " - " + formatDate(appointment.appointment_date!) }
                </p>
            {/if}
            <PatientCard 
                patientData={appointment}
                cardStyle={{
                    patientCardStyle: getPatientCardStyle(appointment),
                    alertCardStyle: getAlertCardStyle(appointment),
                    disablePatientCard: true,
                    cardIcon: cardIcon
                }}
                texts={{
                    alertCardText: getAlertText(appointment),
                    disabledButtonPlaceholderText: getDisabledButtonPlaceholderText(appointment),
                }}
                visibleControls={{
                    mergePatientCardTriggerActions: false,
                    disabledCardButtonPlaceHolder: {
                        show: showDisabledCardButtonPlaceHolder(appointment),
                    },
                    appointmentAttendanceControls: showAppointmentAttendanceControls(appointment),
                    newAppointmentButton: displayNewAppointmentButton(appointment),
                    deleteOrArchiveRecordControls: true,
                }}
                formControls={{
                    editPatientForm: {
                        preliminaryData: [
                            { name: "patient_id", value: appointment.patient_id! },
                            { name: "appointment_id", value: appointment.appointment_id! },
                        ],
                        rawDatePicker: {
                            defaultValue: appointment.appointment_date!,
                            disabled: disableAppointmentDateEditing(appointment),
                        },
                        formAction: "?/update"
                    },
                    appointmentAttendedConfirmationForm: {
                        preliminaryData: [
                            { name: "patient_id", value: appointment.patient_id! },
                            { name: "appointment_id", value: appointment.appointment_id! },
                        ],
                        formAction: ""
                    },
                    cancelAppointmentConfirmationForm: {
                        preliminaryData: [
                            { name: "appointment_id", value: appointment.appointment_id! },
                        ],
                        formAction: "?/cancelAppointment"
                    },
                    newAppointmentForm: {
                        preliminaryData: [
                            { name: "patient_id", value: appointment.patient_id! },
                        ],
                        formAction: "?/newAppointment"
                    },
                    deleteRecordForm: {
                        preliminaryData: [
                            { name: "appointment_id", value: appointment.appointment_id! },
                        ],
                        formAction: "?/deleteAppointment"
                    },
                    archiveRecordForm: {
                        preliminaryData: [
                            { name: "patient_id", value: appointment.patient_id! },
                        ],
                        formAction: "?/archiveAppointment"
                    }
                }}
            />
        {/each}
    {/if}

</div>