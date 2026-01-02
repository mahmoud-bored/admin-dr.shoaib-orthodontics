<script lang="ts">
	import type { Database } from "$lib/database.types";
	import Form from "$lib/Form.svelte";
	import { formatDateForHTMLInputValue, formatTime, formatTimeForHTMLInputValue, getFullDateISOString } from "$lib/jsAssets";
	import Scroll from "phosphor-svelte/lib/Scroll";
    import Plus from "phosphor-svelte/lib/Plus";

    type DbRow = Database['public']['Views']['patient_appointment']['Row'];
    let { 
        appointmentData 
    }: {
        appointmentData: DbRow
    } = $props()




    let editAppointmentForm = $state({ 
        value: false,
        data: {
            appointment_date: formatDateForHTMLInputValue(new Date(appointmentData.appointment_date!)),
            appointment_time: formatTimeForHTMLInputValue(new Date(appointmentData.appointment_date!)),
            dateIsoString: ""
        } 
    })
    $effect(() => {
        if(editAppointmentForm.data.appointment_date || editAppointmentForm.data.appointment_time) {
            editAppointmentForm.data.dateIsoString = getFullDateISOString(editAppointmentForm.data.appointment_date!, editAppointmentForm.data.appointment_time!)
        }
    })
    let appointmentAttendedConfirmation = $state({ value: false })
    let isCancelAppointmentConfirmationOpen = $state({ value: false })
    let newAppointmentForm = $state({ 
        value: false,
        data: {
            appointment_date: "",
            appointment_time: "",
            dateIsoString: ""
        }
    })
    $effect(() => {
        if(newAppointmentForm.data.appointment_date || newAppointmentForm.data.appointment_time) {
            newAppointmentForm.data.dateIsoString = getFullDateISOString(newAppointmentForm.data.appointment_date!, newAppointmentForm.data.appointment_time!)
        }
    })
    $inspect(newAppointmentForm.data)
    $inspect(editAppointmentForm.data)

    function getAlertText(dataObj: DbRow): string {
        let alertText = ``
        if(dataObj.attended === null) 
                if(dataObj.is_cancelled) alertText = "تم إلغاء الموعد"
                    else alertText = formatTime(dataObj.appointment_date!)
            else if (dataObj.attended === false) alertText = "لم يحضر الموعد"
            else if(dataObj.attended === true) alertText = "تم حضور الموعد"
        
        return alertText
    }
    function getAlertCardStyle(dataObj: DbRow): string {
        if(dataObj.attended === null) {
            if(dataObj.is_cancelled) return "bg-red-500"
        } else if(dataObj.attended === false) {
            return "bg-red-600"
        } else if(dataObj.attended === true) {
            return "bg-green-600"
        }
        return "bg-orange-800 w-26"
    }
    function getAppointmentCardStyle(dataObj: DbRow): string {
        if(dataObj.attended === null) {
            if (dataObj.is_cancelled) return "border-red-500 opacity-70"
        } else if(dataObj.attended === false) {
            return "border-red-600 opacity-70"
        } else if(dataObj.attended === true) {
            return "border-green-600 opacity-70"
        }
        return "border-orange-800"
    }
    function showAppointmentAttendanceControls(dataObj: DbRow): boolean {
        if(dataObj.attended === null && !dataObj.is_cancelled) return true
            else return false
    }
    function disableAppointmentDateEditing(dataObj: DbRow): boolean {
        if(dataObj.attended !== null || dataObj.is_cancelled) return true
            else return false
    }
    function getDisabledAppointmentButtonPlaceholderText(dataObj: DbRow): string {
        if(dataObj.next_appointment) return "تم إنشاء موعد جديد"
            else return ""
    }
    function showDisabledAppointmentButtonPlaceHolder(dataObj: DbRow): boolean {
        if(dataObj.next_appointment) return true
            else return false
    } 
</script>


{#if newAppointmentForm.value}

    <Form
        bind:isFormOpen={newAppointmentForm}
        formData={{
            title: "موعد جديد",
            preliminaryData: [
                { name: "patient_id", value: appointmentData.patient_id! },
                { name: "appointment_id", value: appointmentData.appointment_id! },
            ],
            actionButtonsProperties: {
                actionButtonsType: "icons",
                actionButtonsFunctions: {
                    cancel: () => {
                        newAppointmentForm.value = false
                    }
                }
            },
            formAction: "?/newRelativeAppointment"
        }}
    >
        <div class="w-full p-3 bg-orange-300 rounded-md flex flex-col items-baseline justify-center">
            <p class="text-orange-950 font-bold text-lg text-left">
                { appointmentData.full_name }
            </p>
            <p class="text-orange-800 font-bold text-sm text-left pl-1">
                { appointmentData.phone_number }
            </p>
        </div>
        
        <div class="h-45 overflow-hidden transition-all flex flex-col gap-2 justify-center items-center w-full pb-2">
            <label for="new_appointment_date" class="w-full text-right mt-2 text-orange-900/90 font-bold">تاريخ الحجز</label>
            <input 
                class="bg-orange-100 w-9/10 p-2 rounded-md" 
                type="date" 
                name="new_appointment_date"
                bind:value={ newAppointmentForm.data.appointment_date }
                required
            />
            <label for="new_appointment_time" class="w-full text-right text-orange-900/90 font-bold">موعد الحجز</label>
            <input 
                class="bg-orange-100 w-9/10 p-2 rounded-md" 
                type="time" 
                name="new_appointment_time"
                bind:value={ newAppointmentForm.data.appointment_time }
                required
            />
            <input type="hidden" name="date_iso_string" value={ newAppointmentForm.data.dateIsoString } />
        </div>
    </Form>

{/if}

{#if editAppointmentForm.value}

    <Form
        bind:isFormOpen={editAppointmentForm}
        formData={{
            title: "تعديل الموعد",
            preliminaryData: [
                { name: "appointment_id", value: appointmentData.appointment_id! },
            ],
            actionButtonsProperties: {
                actionButtonsType: "text",
                actionButtonsTexts: {
                    cancel: "رجوع",
                    submit: "حفظ"
                },
                actionButtonsFunctions: {
                    cancel: () => {
                        editAppointmentForm.value = false
                    }
                }
            },
            formAction: "?/editAppointment"
        }}
    >
        <div class="w-full p-3 bg-orange-300 rounded-md flex flex-col items-baseline justify-center">
            <p class="text-orange-950 font-bold text-lg text-left">
                { appointmentData.full_name }
            </p>
            <p class="text-orange-800 font-bold text-sm text-left pl-1">
                { appointmentData.phone_number }
            </p>
        </div>
        
        <div class="h-45 overflow-hidden transition-all flex flex-col gap-2 justify-center items-center w-full pb-2 has-[input:disabled]:opacity-60">
            <label for="new_appointment_date" class="w-full text-right mt-2 text-orange-900/90 font-bold">تاريخ الحجز</label>
            <input 
                class="bg-orange-100 w-9/10 p-2 rounded-md cursor-pointer disabled:cursor-not-allowed" 
                type="date" 
                name="new_appointment_date"
                bind:value={ editAppointmentForm.data.dateIsoString }
                disabled={ disableAppointmentDateEditing(appointmentData) }
                required={ !disableAppointmentDateEditing(appointmentData) }
            />
            <label for="new_appointment_time" class="w-full text-right text-orange-900/90 font-bold">موعد الحجز</label>
            <input 
                class="bg-orange-100 w-9/10 p-2 rounded-md cursor-pointer disabled:cursor-not-allowed" 
                type="time" 
                name="new_appointment_time" 
                bind:value={ editAppointmentForm.data.appointment_time }
                disabled={ disableAppointmentDateEditing(appointmentData) }
                required={ !disableAppointmentDateEditing(appointmentData) }
            />
            <input type="hidden" name="date_iso_string" value={ editAppointmentForm.data.dateIsoString } disabled={ disableAppointmentDateEditing(appointmentData) }/>
        </div>
        {#if showAppointmentAttendanceControls(appointmentData)}
            <div class="w-full flex flex-col p-3 justify-center items-center">
                <hr class="w-8/10 border border-orange-900/30 self-center mb-2"/>

                <div class="p-3 w-full flex justify-around md:justify-start items-center gap-3 md:gap-6 md:pl-9">
                    <button 
                        type="button" 
                        class="shadow-md bg-red-600 px-4 py-2 flex justify-center items-center w-full md:max-w-[400px] rounded-md font-bold text-orange-50 cursor-pointer hover:bg-red-700 transition"
                        onclick={() => {
                            appointmentAttendedConfirmation.value = true
                            editAppointmentForm.value = false
                        }}
                    >
                        لم يحضر الموعد
                    </button>
                    <button 
                        type="button" 
                        class="shadow-md bg-green-600 px-4 py-2 flex justify-center items-center w-full md:max-w-[400px] rounded-md font-bold text-orange-50 cursor-pointer hover:bg-green-700 transition"
                        onclick={() => {
                            appointmentAttendedConfirmation.value = true
                            editAppointmentForm.value = false
                        }} 
                    >
                        تم حضور الموعد
                    </button>
                </div>
                <div class="px-3 w-full flex justify-around md:justify-start items-center gap-3 md:gap-6 md:pl-9">
                    <button
                        type="button"
                        class="shadow-md bg-gray-600 px-4 py-2 flex justify-center items-center w-full md:max-w-[400px] rounded-md font-bold text-orange-50 cursor-pointer hover:bg-gray-700 transition"
                        onclick={() => {
                            isCancelAppointmentConfirmationOpen.value = true
                            editAppointmentForm.value = false
                        }}
                    >
                        إلغاء الموعد
                    </button>
                </div>
                <hr class="w-8/10 border border-orange-900/30 self-center mt-4"/>

            </div>
        {:else}
            {#if !showDisabledAppointmentButtonPlaceHolder(appointmentData)}
                <div class="w-full flex flex-col p-3 justify-center items-center">
                    <div class="px-3 w-full flex justify-around items-center gap-3">
                        <button 
                            class="w-full py-2 bg-orange-900 rounded-md flex justify-center items-center gap-3 hover:bg-orange-800 transition cursor-pointer drop-shadow"
                            type="button"
                            onclick={() => {
                                newAppointmentForm.value = true
                                editAppointmentForm.value = false
                            }}
                        >
                            <Plus size={24} weight="bold" color="#ffedd4" class="mt-1"/>
                            <p class="font-bold text-lg text-orange-100">موعد جديد</p>

                        </button>
                    </div>
                </div>
            {:else}
                <div class="w-full flex flex-col p-3 justify-center items-center">
                    <div class="px-3 w-full flex justify-around items-center gap-3">
                        <button 
                            class={[
                                "w-full py-2 bg-green-200 rounded-md flex justify-center items-center gap-3 border-dashed border-2 border-green-900 opacity-70 cursor-pointer hover:bg-green-300 transition",
                            ]}
                            type="button"
                        >
                            <p class="font-bold text-lg text-green-900" dir="rtl">{ getDisabledAppointmentButtonPlaceholderText(appointmentData) }</p>

                        </button>
                    </div>
                </div>
            {/if}
        {/if}

    </Form>

{/if}

{#if appointmentAttendedConfirmation.value}
    <Form
        bind:isFormOpen={appointmentAttendedConfirmation}
        formData={{
            title: "",
            preliminaryData: [
                { name: "patient_id", value: appointmentData.patient_id! },
                { name: "appointment_id", value: appointmentData.appointment_id! },
            ],
            actionButtonsProperties: {
                removeActionButtons: true,
                actionButtonsFunctions: {
                    cancel: () => {
                        editAppointmentForm.value = true
                    }
                }
            }
        }}
        >
        <div class="flex flex-col justify-center items-center">
            <p class="text-xl font-bold text-orange-900">تأكيد حضور الموعد ل</p>
            <p class="text-lg font-bold text-orange-50 py-0.5 px-2 bg-orange-900 rounded-md">{appointmentData.full_name}</p>
        </div>
        <div class="w-full flex justify-center">
            <Scroll size={100} weight="thin" color="#441306" class="mt-3 mb-3" />
        </div>
        <div class="w-full flex justify-center items-center gap-2">
            <button formaction="?/absent" class="shadow-md bg-red-600 px-4 py-2 flex justify-center items-center w-full md:max-w-[400px] rounded-md font-bold text-orange-50 cursor-pointer hover:bg-red-700 transition">
                لم يحضر الموعد
            </button>
            <button formaction="?/present" class="shadow-md bg-green-600 px-4 py-2 flex justify-center items-center w-full md:max-w-[400px] rounded-md font-bold text-orange-50 cursor-pointer hover:bg-green-700 transition">
                تم حضور الموعد
            </button>
        </div>
        <button 
            type="button" 
            class="mt-2 shadow-md bg-gray-600 px-4 py-2 flex justify-center items-center w-full md:max-w-[400px] rounded-md font-bold text-orange-50 cursor-pointer hover:bg-gray-700 transition"
            onclick={() => {
                appointmentAttendedConfirmation.value = false
                editAppointmentForm.value = true
            }}
        >
            رجوع
        </button>
    </Form>

{/if}

{#if isCancelAppointmentConfirmationOpen.value}
    <Form
        bind:isFormOpen={isCancelAppointmentConfirmationOpen}
        formData={{
            title: "هل انت متأكد من إلغاء الموعد؟",
            preliminaryData: [
                { name: "appointment_id", value: appointmentData.appointment_id! },
            ],
            actionButtonsProperties: {
                actionButtonsType: "text",
                actionButtonsTexts: {
                    submit: "إلغاء الموعد",
                    cancel: "رجوع"
                },
                actionButtonsColors: {
                    submit: "bg-red-600",
                },
                actionButtonsFunctions: {
                    cancel: () => {
                        editAppointmentForm.value = true
                    }
                }
            },
            formAction: "?/cancelAppointment"
        }}
    >
        <span></span>
    </Form>
{/if}
<button 
    type="button"
    id="{appointmentData.appointment_id!.toString()}"
    class={[
        "w-full p-2 pl-4 bg-orange-200 border rounded-md flex justify-between hover:bg-orange-300 transition cursor-pointer",
        getAppointmentCardStyle(appointmentData)
    ]}
    onclick={() => {
        editAppointmentForm.value = true
    }}    
>
    <p class="text-orange-950 font-bold text-lg text-left">
        { appointmentData.full_name }
    </p>
    <div 
        class={[
            "p-1 px-2 text-sm font-bold rounded-md  text-orange-50 flex justify-center items-center text-center",
            getAlertCardStyle(appointmentData)
        ]}
    >
        { getAlertText(appointmentData) }
    </div>
</button>