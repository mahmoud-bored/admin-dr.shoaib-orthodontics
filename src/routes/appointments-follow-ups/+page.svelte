<script lang="ts">
    import X from 'phosphor-svelte/lib/X';
    import Spinner from 'phosphor-svelte/lib/Spinner';
	import { formatDate, formatTime, getOrderedDataList } from '$lib/jsAssets.js';
    import MobileDevice from 'phosphor-svelte/lib/DeviceMobileSpeaker'
	import PatientCard from '$lib/PatientCard.svelte';
	import type { Database } from '$lib/database.types.js';
	import { fade } from 'svelte/transition';

    type DbRow = Database['public']['Views']['patient_form_submission_appointments']['Row'];

    let { data } = $props();
    const formSubmissions = data.formSubmissions


    function getPatientCardStyle(dataObj: DbRow): string {
        if(dataObj.attended === null) {
            switch (dataObj.status) {
                case "appointment_booked":
                    return "border-green-600"
                case "appointment_refused":
                    return "border-gray-600"
                case "no_respose":
                    return "border-red-600"
                case "appointment_cancelled":
                    return "border-red-600"
                case null:
                    return "border-orange-600/70 shadow-sm shadow-orange-600"
                default:
                    break
            }
        }
        else if(dataObj.attended === true) {
            return "border-green-600"
        } else if(dataObj.attended === false) {
            if(dataObj.status === "appointment_booked") return "border-red-600"
        }
        return ""
    }


    function getAlertCardStyle(dataObj: DbRow): string {
        if(dataObj.attended === null) {
            switch (dataObj.status) {
                case "appointment_booked":
                    return "bg-green-600 w-26"
                case "no_respose":
                    return "bg-red-600"
                case "appointment_refused":
                    return "bg-gray-600"
                case "appointment_cancelled":
                    return "bg-red-600 drop-shadow-md drop-shadow-red-600/70"
                case null:
                    return "bg-orange-600 shadow-xl shadow-orange-600"
                default:
                    break
            }
        } else if(dataObj.attended === true) {
            if(dataObj.status === "appointment_booked") return "bg-green-600 w-26"
        } else if(dataObj.attended === false) {
            if(dataObj.status === "appointment_booked") return "bg-red-600 drop-shadow-md drop-shadow-red-600/70"
        }
        return ""
    }

    function getAlertText(dataObj: DbRow): string {
        let alertText = ''
        if(dataObj.attended === null) {
            switch (dataObj.status) {
                case "appointment_booked":
                    alertText = `${formatTime(dataObj.appointment_date!)} \n ${formatDate(dataObj.appointment_date!)}`
                    break;
                case "appointment_refused":
                    alertText = "رفض الحجز"
                    break;
                case "no_respose":
                    alertText = "لم يتم الرد"
                    break;
                case "appointment_cancelled":
                    alertText = "تم إلغاء الموعد"
                    break;
                case null:
                    alertText = "جديد"
                    break;
                default:
                    break;
            }
        } else {
            switch (dataObj.attended) {
                case true:
                    alertText = "تم حضور الموعد"
                    break;
                case false:
                    alertText = "لم يحضر الموعد"
                    break;
                default:
                    break;
            }
        }
        return alertText
    }
    function displayNewAppointmentButton(dataObj: DbRow): boolean {
        if(dataObj.attended === null) {
            if(dataObj.status === "appointment_cancelled" && !dataObj.next_appointment_created) return true
        } else if (dataObj.attended === false && !dataObj.next_appointment_created) return true
        else if (dataObj.attended === true && !dataObj.next_appointment_created) return true
        
        return false
    }
    function showDisabledCardButtonPlaceHolder(dataObj: DbRow): boolean {
        if(dataObj.attended === true && dataObj.next_appointment_created) return true
        else return false
    } 
    function showAppointmentAttendanceControls(dataObj: DbRow): boolean {
        if(dataObj.status === "appointment_booked" && dataObj.attended === null) return true
        else return false
    }
    function isPatientCardDisabled(dataObj: DbRow): boolean {
        if(dataObj.status === "appointment_refused") return true
        else if (dataObj.attended === true && dataObj.next_appointment_created) return true
        else return false
    }
    function isPatientFormStatusDisabled(dataObj: DbRow): boolean {
        if(
            dataObj.attended === true || 
            dataObj.attended === false || 
            dataObj.status === "appointment_cancelled"
        ) 
            return true
        else 
            return false
    }
    function isPatientFormStatusRequired(dataObj: DbRow): boolean {
        if(dataObj.attended === null && dataObj.status !== "appointment_cancelled") return true
        else return false
    }
    let orderedFormSubmissionsList = $state(getOrderedDataList(formSubmissions, 'created_at', ['12-7-2025', '12-5-2025']))

    let filterDate1 = $state("")
    let filterDate2 = $state("")
    let loading = $state(false)
    function checkData(dataObj: DbRow): boolean {
        if(
            dataObj.attended !== null || 
            dataObj.status === "appointment_booked" || 
            dataObj.status === "appointment_cancelled"
        ) return true
        else return false
    }
    $effect(() => {
        if(filterDate1 && filterDate2) {
            loading = true
            setTimeout(() => {
                loading = false
            }, 200)
            if(filterDate1 > filterDate2) {
                orderedFormSubmissionsList = getOrderedDataList(formSubmissions, 'created_at', [filterDate1, filterDate2], checkData)
            } else if(filterDate1 < filterDate2) {
                orderedFormSubmissionsList = getOrderedDataList(formSubmissions, 'created_at', [filterDate2, filterDate1], checkData)
            } else if(filterDate1 === filterDate2) {
                orderedFormSubmissionsList = getOrderedDataList(formSubmissions, 'created_at', [filterDate2, filterDate1], checkData)
            }
        } else {
            loading = true
            setTimeout(() => {
                loading = false
            }, 200)
            orderedFormSubmissionsList = getOrderedDataList(formSubmissions, 'created_at', null, checkData)
        }
    })
    const todayDateObj = $state(new Date())
    const todayDateString = $state(formatDate(todayDateObj.toISOString()))
    const yesterdayDateObj = new Date(formatDate(todayDateString))
    yesterdayDateObj.setDate(todayDateObj.getDate() - 1)
    const yesterdayDateString = $state(formatDate(yesterdayDateObj.toISOString()))
    
    
</script>
{#if loading}
    <div class="absolute top-0 left-0 w-full h-full bg-amber-950/40 z-110 flex justify-center items-center" transition:fade={{duration: 100}}>
        <Spinner size={64} weight="bold" color="#441405" class="animate-spin "/>
    </div>
{/if}
<div class="p-4 w-full h-full flex justify-center">
    <div class="w-full lg:w-8/10 max-w-4xl">
        <div class="w-full gap-2 flex flex-col pb-8">
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
            {#if orderedFormSubmissionsList.length > 0}
                {#each orderedFormSubmissionsList as formSubmission, i}
                    {#if i === 0 || formatDate(formSubmission.created_at!) !== formatDate(orderedFormSubmissionsList[i - 1].created_at!)}
                        <p class="text-xl py-2 font-bold text-right">
                            {
                                formatDate(formSubmission.created_at!) === todayDateString ? "اليوم" :
                                formatDate(formSubmission.created_at!) === yesterdayDateString ? "الأمس" :
                                formatDate(formSubmission.created_at!)
                            }
                        </p>
                    {/if}
                    <PatientCard 
                        patientData={formSubmission}
                        updatePatientDataForm={{
                            patientStatusDisabled: isPatientFormStatusDisabled(formSubmission),
                            patientStatusRequired: isPatientFormStatusRequired(formSubmission),
                        }}
                        cardStyle={{
                            patientCardStyle: getPatientCardStyle(formSubmission),
                            alertCardStyle: getAlertCardStyle(formSubmission),
                            disablePatientCard: isPatientCardDisabled(formSubmission),
                        }}
                        texts={{
                            alertCardText: getAlertText(formSubmission),
                            disabledButtonPlaceholderText: "",
                        }}
                        visibleControls={{
                            disabledCardButtonPlaceHolder: showDisabledCardButtonPlaceHolder(formSubmission),
                            appointmentAttendanceControls: showAppointmentAttendanceControls(formSubmission),
                            newAppointmentButton: displayNewAppointmentButton(formSubmission),
                            
                        }}
                    />
                {/each}
            {:else}
                <div class="w-full p-4 flex flex-col justify-center items-center gap-3 opacity-75">
                    <MobileDevice size={64} weight="thin" color="#441306" style="rotate: 180deg;" />
                    <p class="text-lg font-bold text-orange-950" dir="rtl">لا توجد طلبات في الفترة المحددة!</p>
                </div>
                <hr class="w-8/10 border border-orange-900/40 self-center my-2"/>
            {/if}
            
        </div>
    </div>
    

</div>