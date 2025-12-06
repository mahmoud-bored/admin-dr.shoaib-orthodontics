<script lang="ts">
    import { Select } from "bits-ui";
    import Palette from "phosphor-svelte/lib/Palette";
    import CaretUpDown from "phosphor-svelte/lib/CaretUpDown";
    import CaretDoubleUp from "phosphor-svelte/lib/CaretDoubleUp";
    import CaretDoubleDown from "phosphor-svelte/lib/CaretDoubleDown";
    import MobileDevice from 'phosphor-svelte/lib/DeviceMobileSpeaker'
	import Phone from 'phosphor-svelte/lib/Phone';
	import WhatsappLogo from 'phosphor-svelte/lib/WhatsappLogo';
    import PencilSimple from 'phosphor-svelte/lib/PencilSimple'
    import X from 'phosphor-svelte/lib/X'
    import Check from 'phosphor-svelte/lib/Check'
	import { fade } from 'svelte/transition';
	import { formatDate, formatTime } from "$lib/jsAssets";
	import Scroll from "phosphor-svelte/lib/Scroll";
	import Plus from "phosphor-svelte/lib/Plus";
    type PatientData = {
        patient_id: string
        form_id: string
        appointment_id: string | null
        appointment_date: string
        full_name: string,
        phone_number: string
        call_status: string
        attended: boolean | null
        next_appointment_created: boolean
    }
    const callStatuses = [
        { value: "appointment_refused", label: "رفض الحجز" },
        { value: "no_respose", label: "لم يتم الرد" },
        { value: "appointment_booked", label: "تم الحجز" },
    ]
    let { patientData }: { patientData: PatientData } = $props()


    
    let isCollapsableOpen = $state(false)
    let isEditFormOpen = $state(false)
    let isNewAppointmentFormOpen = $state(false)
    let isCancelAppointmentConfirmationOpen = $state(false)
    let callStatusSelectValue = $state<string>(patientData.call_status ?? "");
    const selectedLabel = $derived(
        callStatusSelectValue
            ? callStatuses.find((callStatus) => callStatus.value === callStatusSelectValue)?.label
            : "لم يتم التواصل"
    );
    const appointmentDateProcessed = $derived(patientData.appointment_date ? new Date(patientData.appointment_date).toISOString().split('T')[0] : "")
    const appointmentTimeProcessed = $derived(patientData.appointment_date ? new Date(patientData.appointment_date).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', hour12: false}) : "")

    let appointmentAttendedConfirmation = $state(false)

    function getAlertText() {
        let alertText = ''

        if(patientData.attended === null) {
            switch (patientData.call_status) {
                case "appointment_booked":
                    alertText = formatDate(patientData.appointment_date)
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
            switch (patientData.attended) {
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
    function displayNewAppointmentButton() {
        console.log(patientData.next_appointment_created)
        if(patientData.attended === null) {
            if(patientData.call_status === "appointment_cancelled" && !patientData.next_appointment_created) return true
        } else if (patientData.attended === false && !patientData.next_appointment_created) return true
        else if (patientData.attended === true && !patientData.next_appointment_created) return true
        else return false
    }
    function calculateCollapsableOpenLevel() {
        // to determine how big the height of the collabsable div should be
        if(patientData.attended === null) {
            switch (patientData.call_status) {
                case "appointment_booked":
                    return 3
                case "appointment_refused":
                    return 1
                case "no_respose":
                    return 1
                case "appointment_cancelled":
                    return 2
                case null:
                    return 1
                default:
                    break
            }
        } else if(patientData.attended === true) {
            return 2
        } else if(patientData.attended === false) {
            return 2
        }
    }
    function getAlertCardStyle() {
        if(patientData.attended === null) {
            switch (patientData.call_status) {
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
        } else if(patientData.attended === true) {
            if(patientData.call_status === "appointment_booked") return "bg-green-600 w-26"
        } else if(patientData.attended === false) {
            if(patientData.call_status === "appointment_booked") return "bg-red-600 drop-shadow-md drop-shadow-red-600/70"
        }
    }
    function getPatientCardStyle() {
        if(patientData.attended === null) {
            switch (patientData.call_status) {
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
        else if(patientData.attended === true) {
            return "border-green-600"
        } else if(patientData.attended === false) {
            if(patientData.call_status === "appointment_booked") return "border-red-600"
        }
    }
</script>

{#if isEditFormOpen}
    <div class="fixed top-0 left-0 bg-gray-900/50 w-full h-full flex justify-center items-center z-20" transition:fade={{ duration: 150 }}>
        <form action="?/update" method="POST" class="w-9/10 max-w-[500px] rounded-md bg-orange-200 flex flex-col items-center gap-3 p-3">
            <p class="text-xl font-bold text-orange-900">تحديث بيانات الكشف</p>
            <div class="w-full flex flex-col gap-1.5">
                
                <input type="text" name="patient_id" value="{patientData.patient_id}" hidden>
                <input type="text" name="form_id" value="{patientData.form_id}" hidden>
                <input type="text" name="appointment_id" value={patientData.appointment_id} hidden>
                <input type="text" name="full_name" class="w-full p-2 rounded-md bg-orange-100 font-bold text-orange-900" value="{patientData.full_name}" required>
                <input type="text" name="phone_number" class="w-full p-2 rounded-md bg-orange-100 font-bold text-orange-900" value="{patientData.phone_number}" required>

                <Select.Root
                    type="single"
                    name="call_status"
                    onValueChange={(v) => (callStatusSelectValue = v)}
                    items={callStatuses}
                    allowDeselect={true}
                    value={patientData.call_status}
                    required={patientData.attended !== null}
                    disabled={patientData.attended !== null}
                >
                    <Select.Trigger
                        class="mt-4 h-input rounded-9px border-border-input bg-orange-300 data-placeholder:text-orange-900 data-placeholder:font-bold inline-flex w-full 
                            touch-none select-none items-center border px-[11px] text-sm transition-colors"
                        style="opacity: {patientData.attended === true ? 0.5 : 1};"
                        aria-label="Call Status"
                        dir="rtl"
                    >
                        <CaretUpDown class="text-muted-foreground ml-auto size-6" />
                        <span class="text-orange-900 font-bold">{selectedLabel}</span>
                        <Phone class="text-orange-900 mr-[9px] size-6" />
                    </Select.Trigger>
                    
                    <Select.Portal>
                        <Select.Content
                            class="focus-override border-muted bg-orange-300 shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 
                                data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2
                                data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 outline-hidden z-50 max-h-(--bits-select-content-available-height) w-full
                                min-w-(--bits-select-anchor-width) select-none rounded-xl border px-1 py-3 data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1
                            "
                            sideOffset={10}
                        >
                            <Select.Viewport class="p-1" dir="rtl">
                                {#each callStatuses as callStatus}
                                    <Select.Item
                                        class="rounded-button data-highlighted:bg-orange-200 outline-hidden flex h-10 w-full select-none items-center py-3 pl-5 pr-1.5 text-sm font-bold text-orange-900"
                                        value={callStatus.value}
                                        label={callStatus.label}
                                    >
                                        {#snippet children({ selected })}
                                            {callStatus.label}
                                            {#if selected}
                                                <div class="ml-auto">
                                                    <Check aria-label="check" />
                                                </div>
                                            {/if}
                                        {/snippet}
                                    </Select.Item>
                                {/each}
                            </Select.Viewport>
                        </Select.Content>

                    </Select.Portal>
                </Select.Root>
                <div 
                    class="h-0 overflow-hidden transition-all flex flex-col gap-2 justify-center items-center w-full pb-2"
                    class:h-45={callStatusSelectValue === "appointment_booked"}
                >
                    <label for="new_appointment_date" class="w-full text-right mt-2 text-orange-900 font-bold">تاريخ الحجز</label>
                    <input 
                        class="bg-orange-100 w-9/10 p-2 rounded-md" 
                        class:opacity-50={patientData.attended !== null || patientData.call_status === "appointment_cancelled"}
                        type="date" 
                        name="new_appointment_date" 
                        value="{appointmentDateProcessed}"
                        disabled={patientData.attended !== null || patientData.call_status === "appointment_cancelled"}
                    />
                    <label for="new_appointment_time" class="w-full text-right text-orange-900 font-bold">موعد الحجز</label>
                    <input 
                        class="bg-orange-100 w-9/10 p-2 rounded-md" 
                        class:opacity-50={patientData.attended !== null || patientData.call_status === "appointment_cancelled"}
                        type="time" 
                        name="new_appointment_time" 
                        value="{appointmentTimeProcessed}"
                        disabled={patientData.attended !== null || patientData.call_status === "appointment_cancelled"}
                    />
                </div>

            </div>
            <div class="flex justify-center p-1 gap-4 w-full">
                <button 
                    type="button"
                    class="w-3/10 rounded-full bg-gray-600 hover:bg-gray-700 transition text-orange-50 font-bold p-2 cursor-pointer flex justify-center items-center"
                    onclick={() => {
                        isEditFormOpen = false 
                        callStatusSelectValue = patientData.call_status ?? ""
                    }}
                >
                    <X size={22} weight="bold" color="#fff7ed" class="relative mt-1.5"/>
                </button>
                <button 
                    type="submit"
                    class="w-3/10 rounded-full bg-green-600 hover:bg-green-700 transition text-orange-50 font-bold p-2 cursor-pointer flex justify-center items-center"
                >
                    <Check size={22} weight="bold" color="#fff7ed" class="relative mt-1.5"/>
                </button>
            </div>
        </form>
    </div>
{/if}

{#if appointmentAttendedConfirmation}
    <div class="fixed top-0 left-0 bg-gray-900/50 w-full h-full flex justify-center items-center z-20" transition:fade={{ duration: 150 }}>
        <form method="POST" class="w-9/10 max-w-[500px] rounded-md bg-orange-200 flex flex-col items-center  p-3">
            <input type="text" name="patient_id" value="{patientData.patient_id}" hidden>
            <input type="text" name="form_id" value="{patientData.form_id}" hidden>
            <input type="text" name="appointment_id" value={patientData.appointment_id} hidden>
            <div class="flex flex-col justify-center items-center">
                <p class="text-xl font-bold text-orange-900">تأكيد حضور الموعد ل</p>
                <p class="text-lg font-bold text-orange-50 py-0.5 px-2 bg-orange-900 rounded-md">{patientData.full_name}</p>
            </div>
            <Scroll size={100} weight="thin" color="#441306" class="mt-3 mb-3" />
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
                onclick={() => appointmentAttendedConfirmation = false}
            >
                رجوع
            </button>
        </form>
    </div>
{/if}

{#if isCancelAppointmentConfirmationOpen}
    <div class="fixed top-0 left-0 bg-gray-900/50 w-full h-full flex justify-center items-center z-20" transition:fade={{ duration: 150 }}>
        <form action="?/cancelAppointment" method="POST" class="w-9/10 max-w-[300px] rounded-md bg-orange-200 flex flex-col items-center gap-3 p-3">
            <input type="text" name="form_id" value="{patientData.form_id}" hidden>
            <input type="text" name="appointment_id" value={patientData.appointment_id} hidden>

            <div class="flex flex-col justify-center items-center">
                <p class="text-xl font-bold text-orange-900">هل انت متأكد من إلغاء الموعد؟</p>
            </div>
            <div class="w-full flex justify-center items-center gap-2">
                <button 
                    type="button" 
                    onclick={() => isCancelAppointmentConfirmationOpen = false} 
                    class="shadow-md bg-gray-600 px-4 py-2 flex justify-center items-center w-full md:max-w-[400px] rounded-md font-bold text-orange-50 cursor-pointer hover:bg-gray-700 transition"
                >
                    رجوع
                </button>
                <button 
                    type="submit" 
                    class="shadow-md bg-red-600 px-4 py-2 flex justify-center items-center w-full md:max-w-[400px] rounded-md font-bold text-orange-50 cursor-pointer hover:bg-red-700 transition"
                >
                    إلغاء الموعد
                </button>

            </div>
        </form>
    </div>
{/if}
{#if isNewAppointmentFormOpen}
    <div class="fixed top-0 left-0 bg-gray-900/50 w-full h-full flex justify-center items-center z-20" transition:fade={{ duration: 150 }}>
        <form action="?/newAppointment" method="POST" class="w-9/10 max-w-[500px] rounded-md bg-orange-200 flex flex-col items-center gap-3 p-3">
            <p class="text-xl font-bold text-orange-900">إنشاء موعد جديد</p>
            <div class="w-full flex flex-col gap-1.5">
                
                <input type="text" name="patient_id" value="{patientData.patient_id}" hidden>
                <input type="text" name="form_id" value="{patientData.form_id}" hidden>

                <div class="flex flex-col gap-2 justify-center items-center w-full pb-2">
                    <label for="new_appointment_date" class="w-full text-right mt-2 text-orange-900 font-bold">تاريخ الحجز</label>
                    <input 
                        class="bg-orange-100 w-9/10 p-2 rounded-md" 
                        type="date" 
                        name="new_appointment_date" 
                    />
                    <label for="new_appointment_time" class="w-full text-right text-orange-900 font-bold">موعد الحجز</label>
                    <input 
                        class="bg-orange-100 w-9/10 p-2 rounded-md" 
                        type="time" 
                        name="new_appointment_time" 
                    />
                </div>
            </div>
            <div class="flex justify-center p-1 gap-4 w-full">
                <button 
                    type="button"
                    class="w-3/10 rounded-full bg-gray-600 hover:bg-gray-700 transition text-orange-50 font-bold p-2 cursor-pointer flex justify-center items-center"
                    onclick={() => isNewAppointmentFormOpen = false }
                >
                    <X size={22} weight="bold" color="#fff7ed" class="relative mt-1.5"/>
                </button>
                <button 
                    type="submit"
                    class="w-3/10 rounded-full bg-green-600 hover:bg-green-700 transition text-orange-50 font-bold p-2 cursor-pointer flex justify-center items-center"
                >
                    <Check size={22} weight="bold" color="#fff7ed" class="relative mt-1.5"/>
                </button>
            </div>
        </form>
    </div>
{/if}


<button 
    class={[
        "z-10 w-full p-3 bg-orange-200 hover:bg-orange-300 transition rounded-md flex justify-between items-center gap-3 drop-shadow border-3 cursor-pointer",
        (patientData.call_status === "appointment_refused" || (patientData.attended === true && patientData.next_appointment_created)) && !isCollapsableOpen ? "opacity-70" : "opacity-100",
        getPatientCardStyle()
    ]}
    onclick={() => isCollapsableOpen = !isCollapsableOpen}
>
    <div class="w-full flex justify-start items-center">
        <div class="flex justify-center items-center h-full">
            <MobileDevice size={32} weight="fill" color="#441306" style="rotate: 180deg;" />
        </div>
        <div class="w-full flex flex-col items-baseline">
            <div class="w-full flex flex-col justify-center items-baseline">
                <p class="text-orange-950 font-bold text-lg text-left">{patientData.full_name}</p>
                <p class="text-orange-950 font-bold text-sm text-left">{patientData.phone_number}</p>
            </div>
        </div>
    </div>
    <div class="w-full flex justify-end items-center gap-1.5">


        <div class={[ "w-20 p-2 rounded-md flex flex-col justify-center items-center text-orange-50 text-sm font-bold", getAlertCardStyle() ]}>
            {#if patientData.attended === null && patientData.call_status === "appointment_booked"}
                <p class="text-center">
                    { formatTime(patientData.appointment_date) }
                </p>
            {/if}
            <p class="text-center">{getAlertText()}</p>
        </div>

    </div>
</button>
<div 
    class="relative z-0 -top-4 h-0 overflow-hidden transition-all w-full bg-orange-300 rounded-md flex flex-col justify-center items-center"
    class:h-26={isCollapsableOpen && calculateCollapsableOpenLevel() === 1}
    class:h-42={isCollapsableOpen && calculateCollapsableOpenLevel() === 2}
    class:h-54={isCollapsableOpen && calculateCollapsableOpenLevel() === 3}
>
    <div class="p-3 w-full flex justify-around md:justify-start items-center gap-3 md:gap-6 md:pl-9">
        <a 
            href="https://api.whatsapp.com/send?phone={patientData.phone_number}" 
            target="_blank" 
            class="flex justify-center h-14 w-14"
        >
            <button type="button" class="bg-[#25a83f] shadow-[#25a83f] shadow-md p-1.5 h-full w-full rounded-full cursor-pointer hover:bg-[#238938] transition flex justify-center items-center" >
                <WhatsappLogo size={36} weight="regular" color="#fff" class="ml-px " />
            </button>
        </a>
        <a 
            href="tel:{patientData.phone_number}"
            target="_blank" 
            class="flex justify-center h-15 w-15"
        >
            <button type="button" class="bg-blue-600 shadow-blue-500 shadow-lg p-1.5 h-full w-full rounded-full cursor-pointer hover:bg-blue-700 transition flex justify-center items-center" >
                <Phone size={36} weight="regular" color="#fff" />
            </button>
        </a>
        <button 
            type="button"
            class="bg-gray-600 shadow-gray-600 shadow-md p-1.5 h-14 w-14 rounded-full cursor-pointer hover:bg-gray-700 transition flex justify-center items-center" 
            onclick={() => isEditFormOpen = true}    
        >
            <PencilSimple size={36} weight="regular" color="#fff" />
        </button>
    </div>
    {#if callStatusSelectValue === "appointment_booked" && patientData.attended === null}
        <div class="p-3 w-full flex justify-around md:justify-start items-center gap-3 md:gap-6 md:pl-9">
            <button 
                type="button" 
                class="shadow-md bg-red-600 px-4 py-2 flex justify-center items-center w-full md:max-w-[400px] rounded-md font-bold text-orange-50 cursor-pointer hover:bg-red-700 transition"
                onclick={() => appointmentAttendedConfirmation = true}
            >
                لم يحضر الموعد
            </button>
            <button 
                type="button" 
                class="shadow-md bg-green-600 px-4 py-2 flex justify-center items-center w-full md:max-w-[400px] rounded-md font-bold text-orange-50 cursor-pointer hover:bg-green-700 transition"
                onclick={() => appointmentAttendedConfirmation = true}    
            >
                تم حضور الموعد
            </button>
        </div>
        <div class="px-3 w-full flex justify-around md:justify-start items-center gap-3 md:gap-6 md:pl-9">
            <button
                type="button"
                class="shadow-md bg-gray-600 px-4 py-2 flex justify-center items-center w-full md:max-w-[400px] rounded-md font-bold text-orange-50 cursor-pointer hover:bg-gray-700 transition"
                onclick={() => isCancelAppointmentConfirmationOpen = true}
            >
                إلغاء الموعد
            </button>
        </div>
    {/if}
    {#if displayNewAppointmentButton()}
        <div class="p-3 w-full flex justify-around md:justify-start items-center gap-3 md:gap-6 md:pl-9">
            <button 
                class="w-full py-2 bg-orange-900 rounded-md flex justify-center items-center gap-3 hover:bg-orange-800 transition cursor-pointer drop-shadow"
                type="button"
                onclick={() => isNewAppointmentFormOpen = true}
            >
                <Plus size={24} weight="bold" color="#ffedd4" class="mt-1"/>
                <p class="font-bold text-lg text-orange-100">موعد جديد</p>

            </button>
        </div>
    {:else if patientData.attended === true && patientData.next_appointment_created}
        <div class="p-3 w-full flex justify-around md:justify-start items-center gap-3 md:gap-6 md:pl-9">
            <button 
                class="w-full py-2 bg-green-200 rounded-md flex justify-center items-center gap-3 border-dashed border-2 border-green-900 opacity-70"
                type="button"
            >
                <p class="font-bold text-lg text-green-900">تم تحديد موعد جديد</p>

            </button>
        </div>
    {/if}
</div>