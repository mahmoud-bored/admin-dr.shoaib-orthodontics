<script lang="ts">
    import X from 'phosphor-svelte/lib/X';
    import Spinner from 'phosphor-svelte/lib/Spinner';
	import { formatDate, formatTime, getOrderedDataList } from '$lib/jsAssets.js';
    import MobileDevice from 'phosphor-svelte/lib/DeviceMobileSpeaker'
	import PatientCard from '$lib/PatientCard.svelte';
	import type { Database } from '$lib/database.types.js';
	import { fade } from 'svelte/transition';
	import Form from '$lib/Form.svelte';
	import Plus from 'phosphor-svelte/lib/Plus';
	import TelInputElmnt from '$lib/TelInputElmnt.svelte';


    
    type DbRow = Database['public']['Views']['patient_appointment']['Row'];

    let { data } = $props();
    const formSubmissions = data.formSubmissions

    console.log(formSubmissions)
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
    const todayDateString = $state(formatDate(todayDateObj.toISOString()))
    const tomorrowDateObj = new Date(formatDate(todayDateString))
    tomorrowDateObj.setDate(todayDateObj.getDate() + 1)
    const tomorrowDateString = $state(formatDate(tomorrowDateObj.toISOString()))

    let filterDate1 = $state("")
    let filterDate2 = $state("")
    let loading = $state(false)
    function checkFutureData(dataObj: DbRow): boolean {
        if(todayDateObj < new Date(dataObj.appointment_date!)) return true
            else return false
    }
    function checkPastData(dataObj: DbRow): boolean {
        if(todayDateObj > new Date(dataObj.appointment_date!)) return true
            else return false
    }
    const getFutureData = (date1: string, date2: string) => getOrderedDataList(formSubmissions, 'appointment_date', [date1, date2], checkFutureData, true)
    const getPastData = (date1: string, date2: string) => getOrderedDataList(formSubmissions, 'appointment_date', [date1, date2], checkPastData)
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
            orderedFutureAppointmentsList = getOrderedDataList(formSubmissions, 'appointment_date', null, checkFutureData, true)
            orderedPastAppointmentsList = getOrderedDataList(formSubmissions, 'appointment_date', null, checkPastData)
        }
    })

    
    function getDayName(dateStr: string) {
        var date = new Date(dateStr);
        return date.toLocaleDateString('ar-eg', { weekday: 'long' });        
    }

    let isNewPatientAppointmentFormOpen = $state({ value: false })

</script>
{#if loading}
    <div class="absolute top-0 left-0 w-full h-full bg-amber-950/40 z-110 flex justify-center items-center" transition:fade={{duration: 100}}>
        <Spinner size={64} weight="bold" color="#441405" class="animate-spin "/>
    </div>
{/if}
{#if isNewPatientAppointmentFormOpen.value}
    <Form
        isFormOpen={isNewPatientAppointmentFormOpen}
        formData={{
            title: "كشف جديد",
            preliminaryData: [],
            actionButtonsProperties: {
                actionButtonsType: "icons",
                actionButtonsFunctions: {
                    cancel: () => {
                        isNewPatientAppointmentFormOpen.value = false
                    }
                }
            },
            formAction: "?/newPatientAndAppointment"
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
            <div class="h-45 overflow-hidden transition-all flex flex-col gap-2 justify-center items-center w-full pb-2">
                <label for="new_appointment_date" class="w-full text-right mt-2 text-orange-900/90 font-bold">تاريخ الحجز</label>
                <input 
                    class="bg-orange-100 w-9/10 p-2 rounded-md" 
                    type="date" 
                    name="new_appointment_date" 
                    required
                />
                <label for="new_appointment_time" class="w-full text-right text-orange-900/90 font-bold">موعد الحجز</label>
                <input 
                    class="bg-orange-100 w-9/10 p-2 rounded-md" 
                    type="time" 
                    name="new_appointment_time" 
                    required
                />
            </div>
    </Form>
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


            <div class="w-full flex justify-center items-center p-3 mt-2">
                <button 
                    class="w-full h-9 py-2 bg-orange-900 rounded-md flex justify-center items-center gap-3 hover:bg-orange-800 transition cursor-pointer drop-shadow"
                    type="button"
                    onclick={() => isNewPatientAppointmentFormOpen.value = true}
                >
                    <Plus size={24} weight="bold" color="#ffedd4" class="mt-1"/>
                    <p class="font-bold text-lg text-orange-100">كشف جديد</p>

                </button>
            </div>
            <hr class="w-8/10 border border-orange-900/30 self-center my-2"/>


            {#if orderedFutureAppointmentsList.length > 0}
                {#each orderedFutureAppointmentsList as formSubmission, i}
                    {#if i === 0 || formatDate(formSubmission.appointment_date!) !== formatDate(orderedFutureAppointmentsList[i - 1].appointment_date!)}
                        <p class="text-xl py-2 font-bold text-right text-orange-900">
                            {
                                formatDate(formSubmission.appointment_date!) === todayDateString ? "اليوم" :
                                formatDate(formSubmission.appointment_date!) === tomorrowDateString ? "غدا" :
                                getDayName(formSubmission.appointment_date!) + " - " + formatDate(formSubmission.appointment_date!)
                            }
                        </p>
                    {/if}
                    <PatientCard 
                        patientData={formSubmission}
                        cardStyle={{
                            patientCardStyle: getPatientCardStyle(formSubmission),
                            alertCardStyle: getAlertCardStyle(formSubmission),
                            disablePatientCard: isPatientCardDisabled(formSubmission),
                        }}
                        texts={{
                            alertCardText: getAlertText(formSubmission),
                            disabledButtonPlaceholderText: getDisabledButtonPlaceholderText(formSubmission),
                        }}
                        visibleControls={{
                            mergePatientCardTriggerActions: true,
                            disabledCardButtonPlaceHolder: {
                                show: showDisabledCardButtonPlaceHolder(formSubmission),
                            },
                            appointmentAttendanceControls: showAppointmentAttendanceControls(formSubmission),
                            newAppointmentButton: displayNewAppointmentButton(formSubmission),
                            
                        }}
                        formControls={{
                            editPatientForm: {
                                preliminaryData: [
                                    { name: "patient_id", value: formSubmission.patient_id! },
                                    { name: "appointment_id", value: formSubmission.appointment_id! },
                                ],
                                formAction: "?/update"
                            },
                            appointmentAttendedConfirmationForm: {
                                preliminaryData: [
                                    { name: "patient_id", value: formSubmission.patient_id! },
                                    { name: "appointment_id", value: formSubmission.appointment_id! },
                                ],
                                formAction: ""
                            },
                            cancelAppointmentConfirmationForm: {
                                preliminaryData: [
                                    { name: "appointment_id", value: formSubmission.appointment_id! },
                                ],
                                formAction: "?/cancelAppointment"
                            },
                            newAppointmentForm: {
                                preliminaryData: [
                                    { name: "patient_id", value: formSubmission.patient_id! },
                                ],
                                formAction: "?/newAppointment"
                            }
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

            <hr class="w-8/10 border border-orange-900 self-center my-2"/>
            <p class="text-2xl pb-8 font-bold text-center text-orange-900">
                قديم
            </p>
            {#if orderedPastAppointmentsList.length > 0}
                {#each orderedPastAppointmentsList as formSubmission, i}
                    {#if i === 0 || formatDate(formSubmission.appointment_date!) !== formatDate(orderedPastAppointmentsList[i - 1].appointment_date!)}
                        <p class="text-xl py-2 font-bold text-right text-orange-900">
                            { getDayName(formSubmission.appointment_date!) + " - " + formatDate(formSubmission.appointment_date!) }
                        </p>
                    {/if}
                    <PatientCard 
                        patientData={formSubmission}
                        cardStyle={{
                            patientCardStyle: getPatientCardStyle(formSubmission),
                            alertCardStyle: getAlertCardStyle(formSubmission),
                            disablePatientCard: true,
                        }}
                        texts={{
                            alertCardText: getAlertText(formSubmission),
                            disabledButtonPlaceholderText: getDisabledButtonPlaceholderText(formSubmission),
                        }}
                        visibleControls={{
                            mergePatientCardTriggerActions: true,
                            disabledCardButtonPlaceHolder: {
                                show: showDisabledCardButtonPlaceHolder(formSubmission),
                            },
                            appointmentAttendanceControls: showAppointmentAttendanceControls(formSubmission),
                            newAppointmentButton: displayNewAppointmentButton(formSubmission),
                            
                        }}
                        formControls={{
                            editPatientForm: {
                                preliminaryData: [
                                    { name: "patient_id", value: formSubmission.patient_id! },
                                    { name: "appointment_id", value: formSubmission.appointment_id! },
                                ],
                                formAction: "?/update"
                            },
                            appointmentAttendedConfirmationForm: {
                                preliminaryData: [
                                    { name: "patient_id", value: formSubmission.patient_id! },
                                    { name: "appointment_id", value: formSubmission.appointment_id! },
                                ],
                                formAction: ""
                            },
                            cancelAppointmentConfirmationForm: {
                                preliminaryData: [
                                    { name: "appointment_id", value: formSubmission.appointment_id! },
                                ],
                                formAction: "?/cancelAppointment"
                            },
                            newAppointmentForm: {
                                preliminaryData: [
                                    { name: "patient_id", value: formSubmission.patient_id! },
                                ],
                                formAction: "?/newAppointment"
                            }
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