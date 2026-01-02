<script lang="ts">
	import { applyAction, enhance } from "$app/forms";
	import { page } from "$app/state";
	import type { Database } from "$lib/database.types";
	import Form from "$lib/Form.svelte";
	import { formatDate, formatDateForHTMLInputValue, formatTime, formatTimeForHTMLInputValue, getDayName, getFullDateISOString, getOrderedDataList, stripTime } from "$lib/jsAssets";
	import TelInputElmnt from "$lib/TelInputElmnt.svelte";
	import CaretUp from "phosphor-svelte/lib/CaretUp";
	import Plus from "phosphor-svelte/lib/Plus";
	import Spinner from "phosphor-svelte/lib/Spinner";
	import { fade } from "svelte/transition";
	import AppointmentCard from "./AppointmentCard.svelte";
    let { data } = $props()

    
    const todayDateStripped = $state(stripTime(new Date()).getTime())
    function checkFutureData(dataObj: DbRow2): boolean {
        const strippedDate = stripTime(new Date(dataObj.appointment_date!)).getTime()
        if(todayDateStripped <= strippedDate) return true
            else return false
    }

    type DbRow1 = Database['public']['Views']['patient_form_submissions']['Row'];
    type DbRow2 = Database['public']['Views']['patient_appointment']['Row'];
    type DbRow3 = Database['public']['Tables']['patient']['Row'];
    const patientAppointments = getOrderedDataList(data.patientAppointments, 'appointment_date', null, checkFutureData, true)
    let newAppointmentDefaultValues = $state({
        appointment_date: "",
        appointment_time: "",
        dateIsoString: ""
    })
    $effect(() => {
        if(newAppointmentDefaultValues.appointment_date || newAppointmentDefaultValues.appointment_time) {
            newAppointmentDefaultValues.dateIsoString = getFullDateISOString(newAppointmentDefaultValues.appointment_date!, newAppointmentDefaultValues.appointment_time!)
        }
    })

    const resetNewAppointmentDefaultValues = () => {
        newAppointmentDefaultValues = {
            appointment_date: "",
            appointment_time: "",
            dateIsoString: ""

        }
    }
    let isNewAppointmentFormOpen = $state({ value: false })
    let newAppointmentFinalForm = $state({ value: false })
    let isPatientSelectorOpen = $state({ value: false })
    let newPatientFormOpen = $state({ value: false })

    let loading = $state(false)
    
    
    
    let formData = $state([] as DbRow1[] | DbRow2[] | DbRow3[])
    let currentFormTab = $state('')
    function orderCurrentFormDataset(dataObj: DbRow1[] | DbRow2[] | DbRow3[]): DbRow1[] | DbRow2[] | DbRow3[] {
        if((dataObj[0] as DbRow2).appointment_date) {
            // Appointments Follow ups
            return getOrderedDataList(dataObj as DbRow2[], 'appointment_date', null) as DbRow2[]
        } else if ((dataObj[0] as DbRow1).form_id) {
            // Form Submissions
            return getOrderedDataList(dataObj as DbRow1[], 'created_at', null) as DbRow1[]
        } else if ((dataObj[0] as DbRow3).created_at) {
            // Patients (long term follow ups)
            return getOrderedDataList(dataObj as DbRow3[], 'created_at', null) as DbRow3[]
        } else return dataObj
    }
    function getDateTitleText(dataRow: DbRow1 | DbRow2 | DbRow3): string {
        const todayDateString = formatDate(new Date().toDateString())
        if((dataRow as DbRow2).appointment_date) {
            const dataDateString = formatDate((dataRow as DbRow2).appointment_date!)
            const dataDayName = getDayName((dataRow as DbRow2).appointment_date!, 'ar-eg')
            if(todayDateString === dataDateString) return "اليوم"
                else return `${dataDayName} - ${dataDateString}`
        } else if ((dataRow as DbRow1).form_id) {
            const dataDateString = formatDate((dataRow as DbRow1).created_at!)
            const dataDayName = getDayName((dataRow as DbRow1).created_at!, 'ar-eg')

            if(todayDateString === dataDateString) return "اليوم"
                else return `${dataDayName} - ${dataDateString}`

        } else return ""
    }
    $effect(() => {
        if(!page.form) return

        formData = orderCurrentFormDataset(page.form)
    })
    type SelectedFormPatientData = {
        patient_id: number
        full_name: string
        phone_number: string
    }
    let selectedFormPatientData = $state({} as SelectedFormPatientData)

    type ViewedDatesList = { 
        dateString: string, 
        daySections: DaySection[]
    }[]
    type DaySection = {
        time: [number, number],
        extra: boolean,
        data: DbRow2[]
    }
    function getHourStamp(dateObj: Date, timeArr: number[]): number {
        const newDate = new Date(
            dateObj.getFullYear(), 
            dateObj.getMonth(), 
            dateObj.getDate(), 
            ...timeArr
        ).getTime()
        return newDate
    }
    function getDefaultDayTimes(dateObj: Date): number[] {
        return [
            getHourStamp(dateObj, [14, 0, 0, 0]),
            getHourStamp(dateObj, [15, 0, 0, 0]),
            getHourStamp(dateObj, [16, 0, 0, 0]),
            getHourStamp(dateObj, [17, 0, 0, 0]),
            getHourStamp(dateObj, [18, 0, 0, 0]),
            getHourStamp(dateObj, [19, 0, 0, 0]),
            getHourStamp(dateObj, [20, 0, 0, 0]),
            getHourStamp(dateObj, [21, 0, 0, 0]),
            getHourStamp(dateObj, [24, 0, 0, 0]),
        ]
    }
    function getDefaultDaySections(dateObj: Date): DaySection[] {
        const dayTimes = getDefaultDayTimes(dateObj)
        if(workDays.includes(getDayName(dateObj.toDateString(), 'en-GB'))) {
            return [
                { time: [dayTimes[0], dayTimes[1]], extra: false, data: [] },
                { time: [dayTimes[1], dayTimes[2]], extra: false, data: [] },
                { time: [dayTimes[2], dayTimes[3]], extra: false, data: [] },
                { time: [dayTimes[3], dayTimes[4]], extra: false, data: [] },
                { time: [dayTimes[4], dayTimes[5]], extra: false, data: [] },
                { time: [dayTimes[5], dayTimes[6]], extra: false, data: [] },
                { time: [dayTimes[6], dayTimes[7]], extra: false, data: [] },
                { time: [dayTimes[7], dayTimes[8]], extra: false, data: [] },
            ]
        } 
        else return []
    }
    function getExtraDayTimes(extraDaySections: DaySection[]): number[] {
        const extraDayTimes = [] as number[]
        for(let i = 0; i < extraDaySections.length; i++) {
            extraDayTimes.push(extraDaySections[i].time[0])
            if(i === extraDaySections.length - 1) extraDayTimes.push(extraDaySections[i].time[1])

        }
        return extraDayTimes
    }

    const patientAppointmentsDatesList = $state([] as string[])
    patientAppointments.forEach((patientAppointment: DbRow2) => {
        patientAppointmentsDatesList.push(formatDate(patientAppointment.appointment_date!))
    })
    const workDays = ['Saturday', 'Monday', 'Wednesday']
    function getWorkDatesList(): ViewedDatesList {
        const todayDateObj = new Date()
        const datesArr = [] as ViewedDatesList
        const maxDateObj = new Date()
        maxDateObj.setDate(todayDateObj.getDate() + 60)
        
        const currentDateLoop = todayDateObj
        let currentDateLoopStripped = stripTime(currentDateLoop).getTime()
        let currentDateName = getDayName(currentDateLoop.toString(), 'en-GB')
        const maxDateStripped = stripTime(maxDateObj).getTime()
        while(currentDateLoopStripped <= maxDateStripped) {
            // Check if current date is a work day or if it has any pre-arranged patient appointments
            if(workDays.includes(currentDateName) || patientAppointmentsDatesList.includes(formatDate(currentDateLoop.toDateString()))) {
                // Base day object to push items into
                const dayDataObject = {
                    dateString: currentDateLoop.toDateString(),
                    daySections: getDefaultDaySections(currentDateLoop)
                }
                const dayTimes = getDefaultDayTimes(currentDateLoop)
                let extraDaySections = [] as DaySection[]
                patientAppointments.forEach((patientAppointment: DbRow2) => {
                    const patientAppointmentDate = new Date(patientAppointment.appointment_date!)
                    const patientAppointmentDateStripped = stripTime(patientAppointmentDate).getTime()
                    const patientAppointmentTimeStamp = patientAppointmentDate.getTime()
                    // If the patient appointment date is the same as the current date, assign it to the day
                    if(patientAppointmentDateStripped === currentDateLoopStripped) {
                        let foundTimeSection = false
                        // Loop through the default day time slots and assign appointments to them
                        for(let i = 0; i < dayTimes.length; i++) {
                            const timeArr = [dayTimes[i], dayTimes[i + 1]] as [number, number]
                            if(patientAppointmentTimeStamp >= timeArr[0] && patientAppointmentTimeStamp < timeArr[1]) {
                                dayDataObject.daySections.forEach((daySection: DaySection) => {
                                    if(daySection.time[0] === timeArr[0]) {
                                        daySection.data.push(patientAppointment)
                                        foundTimeSection = true
                                    }
                                })
                            }
                        }
                        // Loop through the extra day time slots and assign appointments to them
                        if(!foundTimeSection && extraDaySections.length > 0) {
                            const extraDayTimes = getExtraDayTimes(extraDaySections)
                            console.log(extraDayTimes)
                            for(let i = 0; i < extraDayTimes.length; i++) {
                                const timeArr = [extraDayTimes[i], extraDayTimes[i + 1]] as [number, number]
                                if(patientAppointmentTimeStamp >= timeArr[0] && patientAppointmentTimeStamp < timeArr[1]) {
                                    extraDaySections.forEach((extraDaySection: DaySection) => {
                                        if(extraDaySection.time[0] === timeArr[0]) {
                                            extraDaySection.data.push(patientAppointment)
                                            foundTimeSection = true
                                        }
                                    })
                                }
                            }
                        }
                        // If no time slot was found, create a new one
                        if(!foundTimeSection) {
                            extraDaySections.push({
                                time: [patientAppointmentTimeStamp, patientAppointmentTimeStamp + 3600000],
                                extra: true,
                                data: [patientAppointment]
                            })
                        }
                    }
                })

                dayDataObject.daySections = [...extraDaySections, ...dayDataObject.daySections]
                datesArr.push(dayDataObject)
            }

            currentDateLoop.setDate(currentDateLoop.getDate() + 1);
            currentDateLoopStripped = stripTime(currentDateLoop).getTime()
            currentDateName = getDayName(currentDateLoop.toString(), 'en-GB')
        }
        return datesArr
    }
    const workDatesList = getWorkDatesList()
    let scrollY = $state(0)

    const scrollToPresent = () => {
        const elRect = document.querySelector("#current")?.getBoundingClientRect().top ?? 0
        scrollTo({
            top: elRect + pageYOffset - 80,
            behavior: "smooth"
        })
    }
</script>
<svelte:window bind:scrollY={scrollY} />

{#if loading}
    <div class="fixed top-0 left-0 w-full h-full bg-amber-950/40 z-110 flex justify-center items-center" transition:fade={{duration: 100}}>
        <Spinner size={64} weight="bold" color="#441405" class="animate-spin "/>
    </div>
{/if}
{#if isNewAppointmentFormOpen.value}

    <button 
        onclick={() => {
            isNewAppointmentFormOpen.value = false 
            resetNewAppointmentDefaultValues()
        }} 
        class="fixed top-0 left-0 bg-gray-900/50 w-full h-full z-20" 
        aria-label="close" 
        transition:fade={{ duration: 150 }}
    >
    </button>
    <form 
        method="POST" 
        transition:fade={{ duration: 150 }}
        class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-9/10 max-w-[500px] rounded-md bg-orange-200 flex flex-col items-center gap-3 p-3" 
        use:enhance={({ action }) => {
            loading = true

            return async ({ result }) => {
                await applyAction(result);
                currentFormTab = action.search
                loading = false;
                isNewAppointmentFormOpen.value = false
                isPatientSelectorOpen.value = true
            };
        }}
    >
        <p class="w-full text-center font-bold text-xl text-orange-900">إنشاء موعد جديد</p>
        <div class="w-full flex flex-col gap-3">
            <button 
                formaction="?/newAppointments" 
                type="submit" 
                class="relative w-full h-14 py-2 bg-orange-900 rounded-lg flex justify-center items-center gap-3 hover:bg-orange-800 transition cursor-pointer 
                    drop-shadow-sm drop-shadow-orange-900 font-bold text-lg text-orange-100"
            >
                <span class="w-6 h-6 rounded-full bg-orange-200 absolute -right-2 text-sm text-orange-900 flex justify-center items-center">1</span>
                الحجوزات الجديدة
            </button>
            <button 
                formaction="?/newAppointmentsFollowUps" 
                type="submit" 
                class="relative w-full h-14 py-2 bg-orange-900 rounded-lg flex justify-center items-center gap-3 hover:bg-orange-800 transition cursor-pointer 
                    drop-shadow-sm drop-shadow-orange-900 font-bold text-lg text-orange-100"
            >
                <span class="w-6 h-6 rounded-full bg-orange-200 absolute -right-2 text-sm text-orange-900 flex justify-center items-center">2</span>
                متابعة الحجوزات
            </button>
            <button 
                formaction="?/followUps" 
                type="submit" 
                class="relative w-full h-14 py-2 bg-orange-900 rounded-lg flex justify-center items-center gap-3 hover:bg-orange-800 transition cursor-pointer 
                    drop-shadow-sm drop-shadow-orange-900 font-bold text-lg text-orange-100"
            >
                <span class="w-6 h-6 rounded-full bg-orange-200 absolute -right-2 text-sm text-orange-900 flex justify-center items-center">3</span>
                متابعات المرضى
            </button>
            <button  
                type="button" 
                class="w-full h-10 py-2 mt-2 border border-dashed border-orange-900 rounded-sm flex justify-center items-center gap-3 hover:bg-orange-300 transition cursor-pointer font-bold text-lg text-orange-900"
                onclick={() => newPatientFormOpen.value = true}
            >
                <Plus size={24} weight="bold" class=" text-orange-900"/>
                مريض جديد
            </button>
        </div>
        <button 
            type="button" 
            class="w-full h-9 py-2 mt-8 bg-gray-600 rounded-md flex justify-center items-center gap-3 hover:bg-gray-700 transition cursor-pointer 
                drop-shadow-md font-bold text-lg text-orange-100"
            onclick={() => {
                isNewAppointmentFormOpen.value = false
                resetNewAppointmentDefaultValues()
            }}
        >
            اغلاق
        </button>
    </form>

{/if}
{#if isPatientSelectorOpen.value}
    <button 
        onclick={() => {
            isPatientSelectorOpen.value = false 
            selectedFormPatientData = {} as SelectedFormPatientData
            resetNewAppointmentDefaultValues()
        }} 
        class="fixed top-0 left-0 bg-gray-900/50 w-full h-full z-20" 
        aria-label="close" 
        transition:fade={{ duration: 150 }}
    >
    </button>

    <div transition:fade={{ duration: 150 }} class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-9/10 max-w-[500px] max-h-9/12 rounded-md bg-orange-200 flex flex-col  gap-3 p-3">
        <p class="text-xl font-bold text-orange-900 w-full text-center">
            {
                currentFormTab === '?/newAppointments' ? 'الحجوزات الجديدة' : 
                currentFormTab === '?/newAppointmentsFollowUps' ? 'متابعة الحجوزات' : 
                currentFormTab === '?/followUps' ? 'متابعات المرضى' : ""
            }
        </p>
        <div class="flex flex-col w-full overflow-auto gap-2 ">
            {#each formData as row, i}
                {#if i === 0 || getDateTitleText(row) !== getDateTitleText(formData[i - 1])}
                    <p class="text-xl py-2 font-bold text-right">
                        { getDateTitleText(row) }
                    </p>
                {/if}
                <button 
                    class="w-full p-2 pl-2 bg-orange-300 hover:brightness-85 transition rounded-md flex flex-col justify-between items-baseline border-2 cursor-pointer"
                    type="button" 
                    onclick={() => {
                        selectedFormPatientData = {
                            patient_id: row.patient_id!,
                            full_name: row.full_name!,
                            phone_number: row.phone_number!
                        }
                        isPatientSelectorOpen.value = false
                        newAppointmentFinalForm.value = true
                    }}
                >
                    <p class="text-orange-950 font-bold text-lg text-left">{row.full_name}</p>
                    <p class="text-orange-800 font-bold text-sm text-left">{row.phone_number}</p>
                </button>
            {/each}
        </div>
        <button 
            type="button" 
            class="w-full h-9 py-2 bg-gray-600 rounded-md flex justify-center items-center gap-3 hover:bg-gray-700 transition cursor-pointer 
                drop-shadow-md font-bold text-lg text-orange-100"
            onclick={() => {
                isPatientSelectorOpen.value = false
                isNewAppointmentFormOpen.value = true
                selectedFormPatientData = {} as SelectedFormPatientData
            }}
        >
            رجوع
        </button>
    </div>
{/if}
{#if newAppointmentFinalForm.value}

    <Form
        bind:isFormOpen={newAppointmentFinalForm}
        formData={{
            title: "موعد جديد",
            preliminaryData: [
                { name: "patient_id", value: selectedFormPatientData.patient_id },
            ],
            actionButtonsProperties: {
                actionButtonsType: "icons",
                actionButtonsFunctions: {
                    cancel: () => {
                        newAppointmentFinalForm.value = false
                        selectedFormPatientData = {} as SelectedFormPatientData
                    }
                }
            },
            formAction: "?/newPatientAppointment"
        }}
    >
        <div class="w-full p-3 bg-orange-300 rounded-md flex flex-col items-baseline justify-center">
            <p class="text-orange-950 font-bold text-lg text-left">
                { selectedFormPatientData.full_name }
            </p>
            <p class="text-orange-800 font-bold text-sm text-left pl-1">
                { selectedFormPatientData.phone_number }
            </p>
        </div>
        
        <div class="h-45 overflow-hidden transition-all flex flex-col gap-2 justify-center items-center w-full pb-2">
            <label for="new_appointment_date" class="w-full text-right mt-2 text-orange-900/90 font-bold">تاريخ الحجز</label>
            <input 
                class="bg-orange-100 w-9/10 p-2 rounded-md" 
                type="date" 
                name="new_appointment_date"
                bind:value={ newAppointmentDefaultValues.appointment_date }
                required
            />
            <label for="new_appointment_time" class="w-full text-right text-orange-900/90 font-bold">موعد الحجز</label>
            <input 
                class="bg-orange-100 w-9/10 p-2 rounded-md" 
                type="time" 
                name="new_appointment_time" 
                bind:value={ newAppointmentDefaultValues.appointment_time }
                required
            />
            <input type="hidden" name="date_iso_string" bind:value={ newAppointmentDefaultValues.dateIsoString } />
        </div>
    </Form>

{/if}

{#if newPatientFormOpen.value}

    <Form
        bind:isFormOpen={newPatientFormOpen}
        formData={{
            title: "مريض جديد",
            preliminaryData: [
                { name: "patient_id", value: selectedFormPatientData.patient_id },
            ],
            actionButtonsProperties: {
                actionButtonsType: "icons",
                actionButtonsFunctions: {
                    cancel: () => {
                        newPatientFormOpen.value = false
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
                bind:value={ newAppointmentDefaultValues.appointment_date }
                required
            />
            <label for="new_appointment_time" class="w-full text-right text-orange-900/90 font-bold">موعد الحجز</label>
            <input 
                class="bg-orange-100 w-9/10 p-2 rounded-md" 
                type="time" 
                name="new_appointment_time" 
                bind:value={ newAppointmentDefaultValues.appointment_time }
                required
            />
            <input type="hidden" name="date_iso_string" bind:value={ newAppointmentDefaultValues.dateIsoString } />
        </div>
    </Form>

{/if}


<div class="fixed bottom-6 right-4 z-10 flex flex-col justify-center items-center gap-4">
    {#if scrollY > 800}
        <button 
            type="button" 
            class="w-12 h-12 py-2 bg-gray-500 rounded-full flex justify-center items-center hover:bg-gray-600 transition cursor-pointer drop-shadow"
            onclick={ scrollToPresent }
            transition:fade={{ duration: 150 }}
        >
            <CaretUp size={24} weight="bold" class=" text-orange-50"/>
        </button>
    {/if}
    <button 
        type="button" 
        class="w-14 h-14 py-2 bg-orange-900 rounded-full flex justify-center items-center hover:bg-orange-800 transition cursor-pointer drop-shadow"
        onclick={() => isNewAppointmentFormOpen.value = true}
    >
        <Plus size={24} weight="bold" class=" text-orange-50"/>
    </button>
</div>
<div class="p-4 w-full flex justify-center">
    <div class="w-full lg:w-8/10 max-w-4xl">
        <div class="w-full gap-2 flex flex-col">

            <div class="relative w-full flex flex-col gap-1 pl-2 pb-8 mb-10">
                {#each workDatesList as workDate}
                    <p class="text-xl pt-1 font-bold text-center text-orange-900" id="{ formatDate(workDate.dateString) === formatDate(new Date().toDateString()) ? "current" : "" }">
                        { formatDate(workDate.dateString) }
                        - 
                        { getDayName(workDate.dateString, 'ar-eg') }
                    </p>
                    <div class="relative mb-4">
                        <span class="absolute -left-3 my-2 h-full w-1 bg-orange-900/60 rounded-full"></span>
                        {#each workDate.daySections as daySection}
                            <div class="relative mt-8 flex flex-col gap-2">
                                <div class="absolute -left-4.5 -top-6 h-4 flex justify-center items-center gap-2">
                                    <div class="w-4 h-4 bg-[#a86752] rounded-full"></div>
                                    <p class="text-sm font-bold text-orange-900"> { formatTime(new Date(daySection.time[0]).toISOString()) }</p>
                                </div>
                                {#if daySection.data.length > 0}
                                    {#each daySection.data as appointment}
                                        <AppointmentCard appointmentData={ appointment } />
                                    {/each}
                                    {#if daySection.data.length === 1 && workDays.includes(getDayName(workDate.dateString, 'en-GB')) && !daySection.extra }
                                        <button 
                                            class="w-full p-2 pl-4 bg-orange-200 border border-orange-900 rounded-md flex justify-center items-center hover:bg-orange-300 transition cursor-pointer opacity-40"
                                            onclick={() => {
                                                newAppointmentDefaultValues.appointment_time = formatTimeForHTMLInputValue(new Date(daySection.time[0]))
                                                newAppointmentDefaultValues.appointment_date = formatDateForHTMLInputValue(new Date(daySection.time[0]))
                                                isNewAppointmentFormOpen.value = true
                                            }}
                                        >
                                            <Plus size={24} weight="bold" class="mt-1 text-orange-900"/>
                                        </button>
                                    {/if}
                                {:else}
                                    <button 
                                        class="w-full p-2 py-4 pl-4 bg-orange-200 border border-orange-900 rounded-md flex justify-center items-center hover:bg-orange-300 transition cursor-pointer opacity-40"
                                        onclick={() => {
                                            newAppointmentDefaultValues.appointment_time = formatTimeForHTMLInputValue(new Date(daySection.time[0]))
                                            newAppointmentDefaultValues.appointment_date = formatDateForHTMLInputValue(new Date(daySection.time[0]))
                                            isNewAppointmentFormOpen.value = true
                                        }}
                                    >
                                        <Plus size={24} weight="bold" class="mt-1 text-orange-900"/>
                                    </button>
                                {/if}
                            </div>
                        {/each}

                    </div>
                {/each}

            </div>
        </div>
    </div>
</div>
