<script lang="ts">
    import { Select } from "bits-ui";
    import CaretUpDown from "phosphor-svelte/lib/CaretUpDown";
    import MobileDevice from 'phosphor-svelte/lib/DeviceMobileSpeaker'
	import Phone from 'phosphor-svelte/lib/Phone';
	import WhatsappLogo from 'phosphor-svelte/lib/WhatsappLogo';
    import PencilSimple from 'phosphor-svelte/lib/PencilSimple'
    import Check from 'phosphor-svelte/lib/Check'
	import Scroll from "phosphor-svelte/lib/Scroll";
	import Plus from "phosphor-svelte/lib/Plus";
	import Form from "./Form.svelte";
	import type { Database } from "$lib/database.types";

    const callStatuses = [
        { value: "appointment_refused", label: "رفض الحجز" },
        { value: "no_respose", label: "لم يتم الرد" },
        { value: "appointment_booked", label: "تم الحجز" },
    ]
    let { 
        patientData,
        updatePatientDataForm,
        cardStyle,
        texts,
        visibleControls,
    }: { 
        patientData: Database["public"]["Views"]["patient_form_submission_appointments"]["Row"],
        updatePatientDataForm: {
            patientStatusRequired: boolean;
            patientStatusDisabled: boolean;

        }
        cardStyle: {
            patientCardStyle: string;
            alertCardStyle: string;
            disablePatientCard: boolean;
        };
        texts: {
            alertCardText: string;
            disabledButtonPlaceholderText: string;
        },
        visibleControls: {
            newAppointmentButton: boolean;
            appointmentAttendanceControls: boolean;
            disabledCardButtonPlaceHolder: boolean;
        }
    } = $props()


    
    let isCollapsableOpen = $state(false)
    let isEditFormOpen = $state({ value: false })
    let isNewAppointmentFormOpen = $state({ value: false})
    let isCancelAppointmentConfirmationOpen = $state({ value: false })
    let callStatusSelectValue = $state<string>(patientData.status ?? "");
    const selectedLabel = $derived(
        callStatusSelectValue
            ? callStatuses.find((callStatus) => callStatus.value === callStatusSelectValue)?.label
            : "لم يتم التواصل"
    );
    const appointmentDateProcessed = $derived(patientData.appointment_date ? new Date(patientData.appointment_date).toISOString().split('T')[0] : "")
    const appointmentTimeProcessed = $derived(patientData.appointment_date ? new Date(patientData.appointment_date).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', hour12: false}) : "")

    let appointmentAttendedConfirmation = $state({ value: false })

    // TODO: calculate based on the buttons not on the status
    function calculateCollapsableHeight() {
        const baseLevelHeight = 54
        let currentLevel = 2
        if(visibleControls.appointmentAttendanceControls) currentLevel += 2
        if(visibleControls.newAppointmentButton) currentLevel += 1
        if(visibleControls.disabledCardButtonPlaceHolder) currentLevel += 1

        return currentLevel * baseLevelHeight
    }

    let patientCardTriggerHeight = $state(0)
</script>

{#if isEditFormOpen.value}
    <Form
        isFormOpen={isEditFormOpen}
        formData={{
            title: "تحديث بيانات الكشف",
            preliminaryData: [
                { name: "patient_id", value: patientData.patient_id! },
                { name: "form_id", value: patientData.form_id! },
                { name: "appointment_id", value: patientData.appointment_id! },
            ],
            actionButtonsProperties: {
                actionButtonsType: "icons",
                actionButtonsFunctions: {
                    cancel: () => {
                        callStatusSelectValue = patientData.status ?? ""
                    }
                }
            },
            formAction: "?/update"
        }}
    >
        <input type="text" name="full_name" class="w-full p-2 rounded-md bg-orange-100 font-bold text-orange-900" value="{patientData.full_name}" required>
        <input type="text" name="phone_number" class="w-full p-2 rounded-md bg-orange-100 font-bold text-orange-900" value="{patientData.phone_number}" required>
        <Select.Root
            type="single"
            name="call_status"
            onValueChange={(v) => (callStatusSelectValue = v)}
            items={callStatuses}
            allowDeselect={false}
            value={patientData.status ?? undefined}
            required={updatePatientDataForm.patientStatusRequired}
            disabled={updatePatientDataForm.patientStatusDisabled}
        >
            <Select.Trigger
                class="mt-4 h-input rounded-9px border-border-input bg-orange-300 data-placeholder:text-orange-900 data-placeholder:font-bold inline-flex w-full 
                    touch-none select-none items-center border px-[11px] text-sm transition-colors"
                style="opacity: {updatePatientDataForm.patientStatusDisabled ? 0.5 : 1};"
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
                class:opacity-50={updatePatientDataForm.patientStatusDisabled}
                type="date" 
                name="new_appointment_date" 
                value="{appointmentDateProcessed}"
                disabled={updatePatientDataForm.patientStatusDisabled}
            />
            <label for="new_appointment_time" class="w-full text-right text-orange-900 font-bold">موعد الحجز</label>
            <input 
                class="bg-orange-100 w-9/10 p-2 rounded-md" 
                class:opacity-50={updatePatientDataForm.patientStatusDisabled}
                type="time" 
                name="new_appointment_time" 
                value="{appointmentTimeProcessed}"
                disabled={updatePatientDataForm.patientStatusDisabled}
            />
        </div>
    </Form>
{/if}

{#if appointmentAttendedConfirmation.value}
    <Form
        isFormOpen={appointmentAttendedConfirmation}
        formData={{
            title: "",
            preliminaryData: [
                { name: "patient_id", value: patientData.patient_id! },
                { name: "form_id", value: patientData.form_id! },
                { name: "appointment_id", value: patientData.appointment_id! },
            ],
            actionButtonsProperties: {
                removeActionButtons: true
            }
        }}
        >
        <div class="flex flex-col justify-center items-center">
            <p class="text-xl font-bold text-orange-900">تأكيد حضور الموعد ل</p>
            <p class="text-lg font-bold text-orange-50 py-0.5 px-2 bg-orange-900 rounded-md">{patientData.full_name}</p>
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
            onclick={() => appointmentAttendedConfirmation.value = false}
        >
            رجوع
        </button>
    </Form>

{/if}

{#if isCancelAppointmentConfirmationOpen.value}
    <Form
        isFormOpen={isCancelAppointmentConfirmationOpen}
        formData={{
            title: "هل انت متأكد من إلغاء الموعد؟",
            preliminaryData: [
                { name: "form_id", value: patientData.form_id! },
                { name: "appointment_id", value: patientData.appointment_id! },
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
            },
            formAction: "?/cancelAppointment"
        }}
    >
        <span></span>
    </Form>
{/if}
{#if isNewAppointmentFormOpen.value}
    <Form
        isFormOpen={isNewAppointmentFormOpen}
        formData={{
            title: "انشاء موعد جديد",
            preliminaryData: [
                { name: "patient_id", value: patientData.patient_id! },
                { name: "form_id", value: patientData.form_id! },
            ],
            actionButtonsProperties: {
                actionButtonsType: "icons",
            },
            formAction: "?/newAppointment"
        }}
    >
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
    </Form>
{/if}

<div class="z-10 flex justify-center w-full">
    <button 
        class={[
            " w-full p-3 bg-orange-200 hover:bg-orange-300 transition rounded-md rounded-r-none flex justify-between items-center gap-3 border-3 border-r-0 cursor-pointer",
            !isCollapsableOpen && cardStyle.disablePatientCard ? "opacity-70" : "opacity-100",
            cardStyle
        ]}
        bind:offsetHeight={patientCardTriggerHeight}
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
        
    </button>
    <button 
        class={[
            "flex items-center p-3 pl-1 bg-orange-200 hover:bg-orange-300 transition rounded-md rounded-l-none border-3 border-l-0 cursor-pointer",
            !isCollapsableOpen && cardStyle.disablePatientCard ? "opacity-70" : "opacity-100",
            cardStyle
        ]}
        style="height: {patientCardTriggerHeight}px;"
        onclick={() => isEditFormOpen.value = true}
    >


        <div class={[ "w-20 p-2 rounded-md flex flex-col justify-center items-center text-orange-50 text-sm font-bold", cardStyle.alertCardStyle ]}>
            <p class="text-center">{texts.alertCardText}</p>
        </div>

    </button>
</div>




<div 
    class="relative z-0 -top-4 h-0 overflow-hidden transition-all w-full bg-orange-300 rounded-md flex flex-col justify-center items-center"
    style="height: {isCollapsableOpen ? calculateCollapsableHeight(): "0"}px;"
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
            onclick={() => isEditFormOpen.value = true}    
        >
            <PencilSimple size={36} weight="regular" color="#fff" />
        </button>
    </div>
    {#if visibleControls.appointmentAttendanceControls}
        <div class="p-3 w-full flex justify-around md:justify-start items-center gap-3 md:gap-6 md:pl-9">
            <button 
                type="button" 
                class="shadow-md bg-red-600 px-4 py-2 flex justify-center items-center w-full md:max-w-[400px] rounded-md font-bold text-orange-50 cursor-pointer hover:bg-red-700 transition"
                onclick={() => appointmentAttendedConfirmation.value = true}
            >
                لم يحضر الموعد
            </button>
            <button 
                type="button" 
                class="shadow-md bg-green-600 px-4 py-2 flex justify-center items-center w-full md:max-w-[400px] rounded-md font-bold text-orange-50 cursor-pointer hover:bg-green-700 transition"
                onclick={() => appointmentAttendedConfirmation.value = true}    
            >
                تم حضور الموعد
            </button>
        </div>
        <div class="px-3 w-full flex justify-around md:justify-start items-center gap-3 md:gap-6 md:pl-9">
            <button
                type="button"
                class="shadow-md bg-gray-600 px-4 py-2 flex justify-center items-center w-full md:max-w-[400px] rounded-md font-bold text-orange-50 cursor-pointer hover:bg-gray-700 transition"
                onclick={() => isCancelAppointmentConfirmationOpen.value = true}
            >
                إلغاء الموعد
            </button>
        </div>
    {/if}
    {#if visibleControls.newAppointmentButton}
        <div class="p-3 w-full flex justify-around md:justify-start items-center gap-3 md:gap-6 md:pl-9">
            <button 
                class="w-full py-2 bg-orange-900 rounded-md flex justify-center items-center gap-3 hover:bg-orange-800 transition cursor-pointer drop-shadow"
                type="button"
                onclick={() => isNewAppointmentFormOpen.value = true}
            >
                <Plus size={24} weight="bold" color="#ffedd4" class="mt-1"/>
                <p class="font-bold text-lg text-orange-100">موعد جديد</p>

            </button>
        </div>
    {:else if visibleControls.disabledCardButtonPlaceHolder}
        <div class="p-3 w-full flex justify-around md:justify-start items-center gap-3 md:gap-6 md:pl-9">
            <button 
                class="w-full py-2 bg-green-200 rounded-md flex justify-center items-center gap-3 border-dashed border-2 border-green-900 opacity-70"
                type="button"
            >
                <p class="font-bold text-lg text-green-900" dir="rtl">{texts.disabledButtonPlaceholderText}</p>

            </button>
        </div>
    {/if}
</div>