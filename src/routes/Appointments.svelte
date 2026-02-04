<script lang="ts">
	import type { Database } from "$lib/database.types";
	import { 
        formatDate, 
        formatDateForHTMLInputValue, 
        formatTime, 
        formatTimeForHTMLInputValue, 
        getDayName, 
        getFullDateISOString, 
        getOrderedDataList, 
        stripTime 
    } from "$lib/jsAssets";
	import Plus from "phosphor-svelte/lib/PlusIcon";
	import AppointmentCard from "./AppointmentCard.svelte";
	import AddAppointment from "./AddAppointment.svelte";
    let { data, isPast }: { data: any, isPast: boolean } = $props()

    
    const todayDateStripped = $state(stripTime(new Date()).getTime())
    function checkData(dataObj: DbRow): boolean {
        const strippedDate = stripTime(new Date(dataObj.appointment_date!)).getTime()
        const dateChecker = isPast ? (todayDateStripped > strippedDate) : (todayDateStripped <= strippedDate)
        if(dateChecker) return true
            else return false
    }

    type DbRow = Database['public']['Views']['patient_appointment']['Row'];
    const patientAppointments = getOrderedDataList(data.patientAppointments, 'appointment_date', null, checkData, isPast ? false : true)



    type ViewedDatesList = { 
        dateString: string, 
        daySections: DaySection[]
    }[]
    type DaySection = {
        time: [number, number],
        extra: boolean,
        data: DbRow[]
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
    patientAppointments.forEach((patientAppointment: DbRow) => {
        patientAppointmentsDatesList.push(formatDate(patientAppointment.appointment_date!))
    })
    const workDays = ['Saturday', 'Monday', 'Wednesday']
    function getPresentWorkDatesList(): ViewedDatesList {
        const todayDateObj = new Date()
        const datesArr = [] as ViewedDatesList
        const maxDateObj = new Date()
        maxDateObj.setDate(todayDateObj.getDate() + 60)
        const maxDateTime = stripTime(maxDateObj).getTime()
        
        const currentDateLoop = todayDateObj
        let currentDateLoopStripped = stripTime(currentDateLoop).getTime()
        let currentDateName = getDayName(currentDateLoop.toString(), 'en-GB')
        while(currentDateLoopStripped <= maxDateTime) {

            // Check if current date is a work day or if it has any pre-arranged patient appointments
            if(workDays.includes(currentDateName) || patientAppointmentsDatesList.includes(formatDate(currentDateLoop.toDateString()))) {
                // Base day object to push items into
                const dayDataObject = {
                    dateString: currentDateLoop.toDateString(),
                    daySections: getDefaultDaySections(currentDateLoop)
                }
                const dayTimes = getDefaultDayTimes(currentDateLoop)
                let extraDaySections = [] as DaySection[]
                patientAppointments.forEach((patientAppointment: DbRow) => {
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
    
    function getPastWorkDatesList(): ViewedDatesList {

        const datesArr = [] as ViewedDatesList

        patientAppointments.forEach((patientAppointment: DbRow) => {
            const patientAppointmentDate = new Date(patientAppointment.appointment_date!)
            // Check if the date is already in the datesArr
            const dateExistsIndex = datesArr.findIndex(dateObj => formatDate(dateObj.dateString) === formatDate(patientAppointmentDate.toDateString()))
            if(dateExistsIndex === -1) {
                // If not, create a new date object
                const newDateObj = {
                    dateString: patientAppointmentDate.toDateString(),
                    daySections: [] as DaySection[]
                }
                // Create a new time section for the appointment
                newDateObj.daySections.push({
                    time: [patientAppointmentDate.getTime(), patientAppointmentDate.getTime() + 3600000],
                    extra: true,
                    data: [patientAppointment]
                })
                datesArr.push(newDateObj)
            } else {
                // If it exists, check if the time section exists
                let foundTimeSection = false
                datesArr[dateExistsIndex].daySections.forEach((daySection: DaySection) => {
                    if(daySection.time[0] === patientAppointmentDate.getTime()) {
                        daySection.data.unshift(patientAppointment)
                        foundTimeSection = true
                    }
                })
                // If not, create a new time section
                if(!foundTimeSection) {
                    datesArr[dateExistsIndex].daySections.unshift({
                        time: [patientAppointmentDate.getTime(), patientAppointmentDate.getTime() + 3600000],
                        extra: true,
                        data: [patientAppointment]
                    })
                }
            }
        })
        return datesArr
    }
    const workDatesList = isPast ? getPastWorkDatesList() : getPresentWorkDatesList()



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

    let isNewAppointmentFormOpen = $state({ value: false })
</script>

<AddAppointment 
    bind:isNewAppointmentFormOpen 
    bind:newAppointmentDefaultValues 
/>

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
