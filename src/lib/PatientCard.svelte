<script lang="ts">
    import { Checkbox, Label, Select } from "bits-ui";
    import CaretUpDown from "phosphor-svelte/lib/CaretUpDown";
	import Phone from 'phosphor-svelte/lib/Phone';
	import WhatsappLogo from 'phosphor-svelte/lib/WhatsappLogo';
    import PencilSimple from 'phosphor-svelte/lib/PencilSimple'
    import Check from 'phosphor-svelte/lib/Check'
	import Scroll from "phosphor-svelte/lib/Scroll";
	import Plus from "phosphor-svelte/lib/Plus";
	import Form from "./Form.svelte";
	import type { Database } from "$lib/database.types";
	import type { Snippet } from "svelte";
	import { formatDateForHTMLInputValue, formatTimeForHTMLInputValue, getFullDateISOString, getPhoneCallLink, getWhatsappPhoneLink } from "./jsAssets";

    type DbRow1 = Database['public']['Views']['patient_form_submissions']['Row'];
    type DbRow2 = Database['public']['Views']['patient_appointment']['Row'];
    type DbRow3 = Database['public']['Tables']['patient']['Row'];
    type PreliminaryData = { name: string; value: string | number }[]
    let { 
        patientData,
        cardStyle,
        texts,
        visibleControls,
        formControls
    }: { 
        patientData: DbRow1 | DbRow2 | DbRow3;
        cardStyle: {
            patientCardStyle: string;
            alertCardStyle: string;
            disablePatientCard: boolean;
            cardIcon: Snippet;
        };
        texts: {
            alertCardText: string | null;
            disabledButtonPlaceholderText: string;
            bottomBannerTexts?: [string, string]
        },
        visibleControls: {
            mergePatientCardTriggerActions?: boolean;
            newAppointmentButton: boolean;
            appointmentAttendanceControls: boolean;
            disabledCardButtonPlaceHolder?: {
                show: boolean;
                action?: () => void;
            };
            deleteOrArchiveRecordControls: boolean;
        },
        formControls: {
            editPatientForm?: {
                preliminaryData: PreliminaryData
                formSelect?: {
                    required: boolean,
                    disabled: boolean,
                    defaultValue: string,
                    options: { value: string; label: string }[]
                    showDatePicker: boolean
                },
                formCheckbox?: {
                    name: string,
                },
                rawDatePicker?: {
                    defaultValue: string,
                    disabled: boolean,
                }
                formAction: string
            },
            appointmentAttendedConfirmationForm?: {
                preliminaryData: PreliminaryData
                formAction: string
            },
            cancelAppointmentConfirmationForm?: {
                preliminaryData: PreliminaryData
                formAction: string
            },
            newAppointmentForm?: {
                preliminaryData: PreliminaryData
                formAction: string
            },
            deleteRecordForm?: {
                preliminaryData: PreliminaryData
                formAction: string
            }
            archiveRecordForm?: {
                preliminaryData: PreliminaryData
                formAction: string
            }
        }
    } = $props()

    const selectOptions = formControls.editPatientForm?.formSelect?.options


    let isCollapsableOpen = $state(false)
    let isEditFormOpen = $state({ 
        value: false,
        data: {
            default: {
                appointment_time: "",
                appointment_date: "",
                dateIsoString: ""
            },
            rawDatePicker: {
                appointment_time: formControls.editPatientForm?.rawDatePicker?.defaultValue ? formatTimeForHTMLInputValue(new Date(formControls.editPatientForm?.rawDatePicker?.defaultValue)) : "",
                appointment_date: formControls.editPatientForm?.rawDatePicker?.defaultValue ? formatDateForHTMLInputValue(new Date(formControls.editPatientForm?.rawDatePicker?.defaultValue)) : "",
                dateIsoString: formControls.editPatientForm?.rawDatePicker?.defaultValue ? 
                    getFullDateISOString(
                        formatDateForHTMLInputValue(new Date(formControls.editPatientForm?.rawDatePicker?.defaultValue)), 
                        formatTimeForHTMLInputValue(new Date(formControls.editPatientForm?.rawDatePicker?.defaultValue))
                    ) : ""
            }
        }
    })
    $effect(() => {
        if(isEditFormOpen.data.default.appointment_date || isEditFormOpen.data.default.appointment_time) {
            isEditFormOpen.data.default.dateIsoString = getFullDateISOString(isEditFormOpen.data.default.appointment_date!, isEditFormOpen.data.default.appointment_time!)
        }
    })
    $effect(() => {
        if(isEditFormOpen.data.rawDatePicker.appointment_date || isEditFormOpen.data.rawDatePicker.appointment_time) {
            isEditFormOpen.data.rawDatePicker.dateIsoString = getFullDateISOString(isEditFormOpen.data.rawDatePicker.appointment_date!, isEditFormOpen.data.rawDatePicker.appointment_time!)
        }
    })
    let isNewAppointmentFormOpen = $state({ 
        value: false,
        data: {
            appointment_time: "",
            appointment_date: "",
            dateIsoString: ""
        }
    })
    $effect(() => {
        if(isNewAppointmentFormOpen.data.appointment_date || isNewAppointmentFormOpen.data.appointment_time) {
            isNewAppointmentFormOpen.data.dateIsoString = getFullDateISOString(isNewAppointmentFormOpen.data.appointment_date!, isNewAppointmentFormOpen.data.appointment_time!)
        }
    })
    let isCancelAppointmentConfirmationOpen = $state({ value: false })
    let isDeleteRecordConfirmationOpen = $state({ value: false })
    let isArchiveRecordConfirmationOpen = $state({ value: false })

    let callStatusSelectValue = $state<string>(formControls.editPatientForm?.formSelect?.defaultValue ?? "");
    const selectedLabel = $derived(
        callStatusSelectValue
            ? selectOptions?.find((callStatus) => callStatus.value === callStatusSelectValue)?.label
            : "لم يتم التواصل"
    );

    let appointmentAttendedConfirmation = $state({ value: false })

    function calculateCollapsableHeight() {
        let bottomBannerHeight = 0
        if(texts.bottomBannerTexts) bottomBannerHeight = 20
        const baseLevelHeight = 54
        let currentLevel = 2
        if(visibleControls.appointmentAttendanceControls) currentLevel += 2
        if(visibleControls.newAppointmentButton) currentLevel += 1
        if(visibleControls.disabledCardButtonPlaceHolder?.show) currentLevel += 1

        return (currentLevel * baseLevelHeight) + bottomBannerHeight
    }

    let patientCardTriggerHeight = $state(0)

    let patientCardId = $state("")
    $effect(() => {
        const tempData = patientData as (DbRow2 | DbRow1)
        if (tempData.appointment_id) {
            patientCardId = tempData.appointment_id.toString() ?? ""
        } else {
            patientCardId = ""
        }
    })
</script>













{#if visibleControls.deleteOrArchiveRecordControls && isDeleteRecordConfirmationOpen.value}
    <div class="absolute top-0 left-0 w-full h-full z-40">
        <Form
            bind:isFormOpen={isDeleteRecordConfirmationOpen}
            formData={{
                title: "هل انت متأكد من حذف هذا السجل؟",
                preliminaryData: formControls.deleteRecordForm?.preliminaryData,
                actionButtonsProperties: {
                    actionButtonsType: "text",
                    actionButtonsTexts: {
                        submit: "حذف",
                        cancel: "رجوع"
                    },
                    actionButtonsColors: {
                        submit: "bg-red-600",
                    },
                },
                formAction: formControls.deleteRecordForm?.formAction
            }}
        >
            <span></span>
        </Form>
    </div>
{/if}
{#if visibleControls.deleteOrArchiveRecordControls && isArchiveRecordConfirmationOpen.value}
    <div class="absolute top-0 left-0 w-full h-full z-40">
        <Form
            bind:isFormOpen={isArchiveRecordConfirmationOpen}
            formData={{
                title: "هل انت متأكد من ارشفة هذا السجل؟",
                preliminaryData: formControls.archiveRecordForm?.preliminaryData,
                actionButtonsProperties: {
                    actionButtonsType: "text",
                    actionButtonsTexts: {
                        submit: "نقل إلى الارشيف",
                        cancel: "رجوع"
                    },
                    actionButtonsColors: {
                        submit: "bg-red-600",
                    },
                },
                formAction: formControls.archiveRecordForm?.formAction
            }}
        >
            <span></span>
        </Form>
    </div>
{/if}

{#if formControls.editPatientForm && isEditFormOpen.value}
    <Form
        bind:isFormOpen={isEditFormOpen}
        formData={{
            title: "تحديث بيانات الكشف",
            preliminaryData: formControls.editPatientForm?.preliminaryData ,
            actionButtonsProperties: {
                actionButtonsType: "text",
                actionButtonsFunctions: {
                    cancel: () => {
                        callStatusSelectValue = formControls.editPatientForm?.formSelect?.defaultValue ?? ""
                    }
                },
                actionButtonsTexts: {
                    submit: "حفظ",
                    cancel: "رجوع"
                }
            },
            formAction: formControls.editPatientForm?.formAction
        }}
    >
        <input type="text" name="full_name" class="w-full p-2 rounded-md bg-orange-100 font-bold text-orange-900" value="{patientData.full_name}" required>
        <input type="text" name="phone_number" class="w-full p-2 rounded-md bg-orange-100 font-bold text-orange-900" value="{patientData.phone_number}" required>
        {#if formControls.editPatientForm.formSelect}
            <Select.Root
                type="single"
                name="status"
                onValueChange={(v) => (callStatusSelectValue = v)}
                items={selectOptions}
                allowDeselect={false}
                value={formControls.editPatientForm?.formSelect?.defaultValue ?? undefined}
                required={formControls.editPatientForm.formSelect?.required}
                disabled={formControls.editPatientForm.formSelect?.disabled}
            >
                <Select.Trigger
                    class="mt-4 h-input rounded-9px border-border-input bg-orange-300 data-placeholder:text-orange-900 data-placeholder:font-bold inline-flex w-full 
                        touch-none select-none items-center border px-[11px] text-sm transition-colors"
                    style="opacity: {formControls.editPatientForm.formSelect?.disabled ? 0.5 : 1};"
                    aria-label="Status"
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
                            {#each selectOptions as selectOption}
                                <Select.Item
                                    class="rounded-button data-highlighted:bg-orange-200 outline-hidden flex h-10 w-full select-none items-center py-3 pl-5 pr-1.5 text-sm font-bold text-orange-900"
                                    value={selectOption.value}
                                    label={selectOption.label}
                                >
                                    {#snippet children({ selected })}
                                        {selectOption.label}
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
                    class:opacity-50={formControls.editPatientForm.formSelect?.disabled}
                    type="date" 
                    name="new_appointment_date" 
                    bind:value={ isEditFormOpen.data.default.appointment_date }
                    disabled={formControls.editPatientForm.formSelect?.disabled}
                />
                <label for="new_appointment_time" class="w-full text-right text-orange-900 font-bold">موعد الحجز</label>
                <input 
                    class="bg-orange-100 w-9/10 p-2 rounded-md" 
                    class:opacity-50={formControls.editPatientForm.formSelect?.disabled}
                    type="time" 
                    name="new_appointment_time" 
                    bind:value={ isEditFormOpen.data.default.appointment_time }
                    disabled={formControls.editPatientForm.formSelect?.disabled}
                />
                <input type="hidden" name="date_iso_string" bind:value={ isEditFormOpen.data.default.dateIsoString } disabled={ formControls.editPatientForm.formSelect?.disabled }>
            </div>
        {/if}
        {#if formControls.editPatientForm.rawDatePicker}
            <div 
                class="transition-all flex flex-col gap-2 justify-center items-center w-full pb-2" 
                class:opacity-60={formControls.editPatientForm.rawDatePicker.disabled}
            >
                <label for="new_appointment_date" class="w-full text-right mt-2 text-orange-900 font-bold">تاريخ الحجز</label>
                {#if formControls.editPatientForm.rawDatePicker.disabled}
                    <input type="date" name="new_appointment_date" bind:value="{ isEditFormOpen.data.rawDatePicker.appointment_date }" hidden />
                    <input type="time" name="new_appointment_time" bind:value="{ isEditFormOpen.data.rawDatePicker.appointment_time }" hidden />
                {/if}
                <input 
                    class="bg-orange-100 w-9/10 p-2 rounded-md"
                    type="date" 
                    name="new_appointment_date" 
                    bind:value={ isEditFormOpen.data.rawDatePicker.appointment_date }
                    disabled={formControls.editPatientForm.rawDatePicker.disabled}
                    required
                />
                <label for="new_appointment_time" class="w-full text-right text-orange-900 font-bold">موعد الحجز</label>
                <input 
                    class="bg-orange-100 w-9/10 p-2 rounded-md" 
                    type="time" 
                    name="new_appointment_time" 
                    bind:value={ isEditFormOpen.data.rawDatePicker.appointment_time }
                    disabled={formControls.editPatientForm.rawDatePicker.disabled}
                    required
                />
                <input type="hidden" name="date_iso_string" bind:value={ isEditFormOpen.data.rawDatePicker.dateIsoString }>
            </div>
        {/if}
        {#if formControls.editPatientForm?.formCheckbox?.name}
            <div class="flex items-center space-x-3 mr-3 mt-2" dir="rtl">
                <Checkbox.Root
                    id="long_term"
                    aria-labelledby="long_term"
                    class="border-muted bg-foreground data-[state=unchecked]:border-border-input data-[state=unchecked]:bg-background data-[state=unchecked]:hover:border-dark-40 
                        peer inline-flex size-[25px] items-center justify-center rounded-md border transition-all duration-150 ease-in-out active:scale-[0.98]"
                    name={formControls.editPatientForm?.formCheckbox.name}
                    value="true"
                >
                    {#snippet children({ checked })}
                        <div class="text-background inline-flex items-center justify-center">
                            {#if checked}
                                <Check class="size-[15px]" weight="bold" />
                            {/if}
                        </div>
                    {/snippet}
                </Checkbox.Root>
                <Label.Root
                    id="long_termlabel"
                    for="long_term"
                    class="text-lg font-bold text-orange-900 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    تم تركيب تقوم
                    <span class="text-orange-900/80">
                        (نقل إلى متابعات المرضى)
                    </span>
                </Label.Root>
            </div>
        {/if}

        {#if visibleControls.deleteOrArchiveRecordControls}
            <hr class="w-8/10 border border-orange-900/30 self-center"/>

            <div class="h-32 overflow-hidden transition-all flex flex-col gap-2 justify-center items-center w-full pb-2">
                <div class="p-3 w-8/10 flex flex-col justify-around md:justify-start items-center gap-3 md:gap-6 md:pl-9">
                    <button 
                        type="button" 
                        class="shadow-md bg-red-600/60 px-4 py-2 flex justify-center items-center w-full md:max-w-[400px] rounded-md font-bold text-orange-50 cursor-pointer hover:brightness-70 transition"
                        onclick={() => isDeleteRecordConfirmationOpen.value = true}    
                    >
                        حذف السجل
                    </button>
                    <button 
                        type="button" 
                        class="shadow-md bg-gray-600/60 px-4 py-2 flex justify-center items-center w-full md:max-w-[400px] rounded-md font-bold text-orange-50 cursor-pointer hover:brightness-70 transition"
                        onclick={() => isArchiveRecordConfirmationOpen.value = true}
                    >
                        نقل إلى الارشيف
                    </button>

                </div>
            </div>
        {/if}
    </Form>
{/if}

{#if formControls.appointmentAttendedConfirmationForm && appointmentAttendedConfirmation.value}
    <Form
        bind:isFormOpen={appointmentAttendedConfirmation}
        formData={{
            title: "",
            preliminaryData: formControls.appointmentAttendedConfirmationForm?.preliminaryData,
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

{#if formControls.cancelAppointmentConfirmationForm && isCancelAppointmentConfirmationOpen.value}
    <Form
        bind:isFormOpen={isCancelAppointmentConfirmationOpen}
        formData={{
            title: "هل انت متأكد من إلغاء الموعد؟",
            preliminaryData: formControls.cancelAppointmentConfirmationForm?.preliminaryData,
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
            formAction: formControls.cancelAppointmentConfirmationForm?.formAction
        }}
    >
        <span></span>
    </Form>
{/if}
{#if formControls.newAppointmentForm && isNewAppointmentFormOpen.value}
    <Form
        bind:isFormOpen={isNewAppointmentFormOpen}
        formData={{
            title: "انشاء موعد جديد",
            preliminaryData: formControls.newAppointmentForm?.preliminaryData,
            actionButtonsProperties: {
                actionButtonsType: "icons",
            },
            formAction: formControls.newAppointmentForm?.formAction
        }}
    >
        <div class="flex flex-col gap-2 justify-center items-center w-full pb-2">
            <label for="new_appointment_date" class="w-full text-right mt-2 text-orange-900 font-bold">تاريخ الحجز</label>
            <input 
                class="bg-orange-100 w-9/10 p-2 rounded-md" 
                type="date" 
                name="new_appointment_date" 
                bind:value={ isNewAppointmentFormOpen.data.appointment_date }
            />
            <label for="new_appointment_time" class="w-full text-right text-orange-900 font-bold">موعد الحجز</label>
            <input 
                class="bg-orange-100 w-9/10 p-2 rounded-md" 
                type="time" 
                name="new_appointment_time" 
                bind:value={ isNewAppointmentFormOpen.data.appointment_time }
            />
            <input type="hidden" name="date_iso_string" bind:value={ isNewAppointmentFormOpen.data.dateIsoString }>
        </div>
    </Form>
{/if}

<div class="z-10 flex justify-center w-full" id="{ patientCardId }">
    <button 
        class={[
            "peer w-full p-3 pl-2 bg-orange-200 hover:bg-orange-300 transition rounded-md rounded-r-none flex justify-between items-center gap-3 border-3 border-r-0 cursor-pointer",
            !isCollapsableOpen && cardStyle.disablePatientCard ? "opacity-70" : "opacity-100",
            cardStyle.patientCardStyle
        ]}
        bind:offsetHeight={patientCardTriggerHeight}
        onclick={() => isCollapsableOpen = !isCollapsableOpen}
    >
        <div class="w-full flex justify-start items-center gap-1">
            <div class="flex justify-center items-center h-full">
                {@render cardStyle.cardIcon()}
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
            visibleControls.mergePatientCardTriggerActions ? "peer-hover:bg-orange-300" : "",
            !isCollapsableOpen && cardStyle.disablePatientCard ? "opacity-70" : "opacity-100",
            cardStyle.patientCardStyle
        ]}
        style="height: {patientCardTriggerHeight}px;"
        onclick={() => {
            if(visibleControls.mergePatientCardTriggerActions) {
                isCollapsableOpen = !isCollapsableOpen
            } else {
                isEditFormOpen.value = true
            }
        }}
    >

        {#if texts.alertCardText}
            <div class={[ "w-20 p-2 rounded-md flex flex-col justify-center items-center text-orange-50 text-sm font-bold", cardStyle.alertCardStyle ]}>
                <p class="text-center">{texts.alertCardText}</p>
            </div>
        {/if}
    </button>
</div>




<div 
    class="relative z-0 -top-4 h-0 overflow-hidden transition-all w-full bg-orange-300 rounded-md flex flex-col justify-center items-center"
    style="height: {isCollapsableOpen ? calculateCollapsableHeight() : "0"}px;"
>
    <div class="p-3 w-full flex justify-around md:justify-start items-center gap-3 md:gap-6 md:pl-9">
        <a 
            href="{getWhatsappPhoneLink(patientData.phone_number!)}" 
            target="_blank" 
            class="flex justify-center h-14 w-14"
        >
            <button type="button" class="bg-[#25a83f] shadow-[#25a83f] shadow-md p-1.5 h-full w-full rounded-full cursor-pointer hover:bg-[#238938] transition flex justify-center items-center" >
                <WhatsappLogo size={36} weight="regular" color="#fff" class="ml-px " />
            </button>
        </a>
        <a 
            href="{getPhoneCallLink(patientData.phone_number!)}"
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
    {:else if visibleControls.disabledCardButtonPlaceHolder?.show}
        <div class="p-3 w-full flex justify-around md:justify-start items-center gap-3 md:gap-6 md:pl-9">
            <button 
                class={[
                    "w-full py-2 bg-green-200 rounded-md flex justify-center items-center gap-3 border-dashed border-2 border-green-900 opacity-70",
                    visibleControls.disabledCardButtonPlaceHolder.show ? "cursor-pointer hover:bg-green-300 transition opacity-100" : ""
                ]}
                type="button"
                onclick={() => visibleControls.disabledCardButtonPlaceHolder?.action?.() }
            >
                <p class="font-bold text-lg text-green-900" dir="rtl">{texts.disabledButtonPlaceholderText}</p>

            </button>
        </div>
    {/if}
    {#if texts.bottomBannerTexts}
        <div class="absolute px-3 py-px bottom-0 w-full flex justify-between items-center gap-3 bg-orange-800 text-orange-100 text-sm">
            <p>{ texts.bottomBannerTexts[0] }</p>
            <p>{ texts.bottomBannerTexts[1] }</p>
        </div>
    {/if}
</div>