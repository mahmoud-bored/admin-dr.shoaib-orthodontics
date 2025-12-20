<script lang="ts">
	import { applyAction, enhance } from "$app/forms";
	import { page } from "$app/state";
	import type { Database } from "$lib/database.types";
	import Form from "$lib/Form.svelte";
	import { formatDate, getOrderedDataList } from "$lib/jsAssets";
	import TelInputElmnt from "$lib/TelInputElmnt.svelte";
	import Plus from "phosphor-svelte/lib/Plus";
	import Spinner from "phosphor-svelte/lib/Spinner";
	import { fade } from "svelte/transition";

    let isNewAppointmentFormOpen = $state({ value: false })
    let isPatientSelectorOpen = $state({ value: false })
    let loading = $state(false)
    type DbRow1 = Database['public']['Views']['patient_form_submissions']['Row'];
    type DbRow2 = Database['public']['Views']['patient_appointment']['Row'];
    type DbRow3 = Database['public']['Tables']['patient']['Row'];
    let formData = $state([] as DbRow1[] | DbRow2[] | DbRow3[])
    let currentFormTab = $state('')
    function orderCurrentFormDataset(dataObj: DbRow1[] | DbRow2[] | DbRow3[]): DbRow1[] | DbRow2[] | DbRow3[] {
        if((dataObj[0] as DbRow2).appointment_date) {
            return getOrderedDataList(dataObj as DbRow2[], 'appointment_date', null) as DbRow2[]
        } else if ((dataObj[0] as DbRow1).form_id) {
            return getOrderedDataList(dataObj as DbRow1[], 'created_at', null) as DbRow1[]
        } else if ((dataObj[0] as DbRow3).created_at) {
            return getOrderedDataList(dataObj as DbRow3[], 'created_at', null) as DbRow3[]
        } else return dataObj
    }
    function getDateTitleText(dataRow: DbRow1 | DbRow2 | DbRow3): string {
        if((dataRow as DbRow2).appointment_date) {
            console.log(formatDate((dataRow as DbRow2).appointment_date!))
            return formatDate((dataRow as DbRow2).appointment_date!)
        } else if ((dataRow as DbRow1).form_id) {
            console.log(formatDate((dataRow as DbRow1).created_at!))
            return formatDate((dataRow as DbRow1).created_at!)
        } else if ((dataRow as DbRow3).created_at) {
            console.log(formatDate((dataRow as DbRow1).created_at!))
            return formatDate((dataRow as DbRow3).created_at!)
        } else {
            console.log("")
            return ""
        }
    }
    $inspect(currentFormTab)
    $effect(() => {
        if(!page.form) return

        formData = orderCurrentFormDataset(page.form)
    })
</script>
{#if loading}
    <div class="fixed top-0 left-0 w-full h-full bg-amber-950/40 z-110 flex justify-center items-center" transition:fade={{duration: 100}}>
        <Spinner size={64} weight="bold" color="#441405" class="animate-spin "/>
    </div>
{/if}
{#if isNewAppointmentFormOpen.value}

    <button 
        onclick={() => {
            isNewAppointmentFormOpen.value = false 
        }} 
        class="fixed top-0 left-0 bg-gray-900/50 w-full h-full z-20" 
        aria-label="close" 
        transition:fade={{ duration: 150 }}
    >
    </button>
    <form 
        method="POST" 
        transition:fade={{ duration: 150 }}
        class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-9/10 max-w-[500px] rounded-md bg-orange-200 flex flex-col items-center gap-10 p-3" 
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
        <div class="w-full flex flex-col gap-3">
            <button 
                formaction="?/newAppointments" 
                type="submit" 
                class="w-full h-14 py-2 bg-orange-900 rounded-sm flex justify-center items-center gap-3 hover:bg-orange-800 transition cursor-pointer 
                    drop-shadow-sm drop-shadow-orange-900 font-bold text-lg text-orange-100"
            >
                الحجوزات الجديدة
            </button>
            <button 
                formaction="?/newAppointmentsFollowUps" 
                type="submit" 
                class="w-full h-14 py-2 bg-orange-900 rounded-sm flex justify-center items-center gap-3 hover:bg-orange-800 transition cursor-pointer 
                    drop-shadow-sm drop-shadow-orange-900 font-bold text-lg text-orange-100"
            >
                متابعة الحجوزات
            </button>
            <button 
                formaction="?/followUps" 
                type="submit" 
                class="w-full h-14 py-2 bg-orange-900 rounded-sm flex justify-center items-center gap-3 hover:bg-orange-800 transition cursor-pointer 
                    drop-shadow-sm drop-shadow-orange-900 font-bold text-lg text-orange-100"
            >
                متابعات المرضى
            </button>
        </div>
        <button 
            type="button" 
            class="w-full h-9 py-2 bg-gray-600 rounded-md flex justify-center items-center gap-3 hover:bg-gray-700 transition cursor-pointer 
                drop-shadow-md font-bold text-lg text-orange-100"
            onclick={() => isNewAppointmentFormOpen.value = false}
        >
            اغلاق
        </button>
    </form>

{/if}
{#if isPatientSelectorOpen.value}
    <button 
        onclick={() => {
            isNewAppointmentFormOpen.value = false 
        }} 
        class="fixed top-0 left-0 bg-gray-900/50 w-full h-full z-20" 
        aria-label="close" 
        transition:fade={{ duration: 150 }}
    >
    </button>

    <div transition:fade={{ duration: 150 }} class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-9/10 max-w-[500px] h-7/10 rounded-md bg-orange-200 flex flex-col  gap-3 p-3">
        <p class="text-xl font-bold text-orange-900 w-full text-center">
            <!-- TODO: Remove the Default -->
            {
                currentFormTab === '?/newAppointments' ? 'الحجوزات الجديدة' : 
                currentFormTab === '?/newAppointmentsFollowUps' ? 'متابعة الحجوزات' : 
                currentFormTab === '?/followUps' ? 'متابعات المرضى' : "Default"
            }
        </p>
        <div class="flex flex-col w-full overflow-auto gap-2 ">
            {#each formData as row, i}
                {#if i === 0 || getDateTitleText(row) !== getDateTitleText(formData[i - 1])}
                    <p class="text-xl py-2 font-bold text-right">
                        { getDateTitleText(row) }
                    </p>
                {/if}
                <button type="button" class="w-full p-2 pl-2 bg-orange-300 hover:brightness-85 transition rounded-md flex flex-col justify-between items-baseline border-2 cursor-pointer">
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
            }}
        >
            رجوع
        </button>
    </div>
{/if}
<div class="p-4 w-full flex justify-center">
    <div class="w-full lg:w-8/10 max-w-4xl">
        <div class="w-full gap-2 flex flex-col">



            <div class="w-full flex justify-center items-center p-3 mt-2">
                <button 
                    class="w-full h-9 py-2 bg-orange-900 rounded-md flex justify-center items-center gap-3 hover:bg-orange-800 transition cursor-pointer drop-shadow"
                    type="button"
                    onclick={() => isNewAppointmentFormOpen.value = true}
                >
                    <Plus size={24} weight="bold" color="#ffedd4" class="mt-1"/>
                    <p class="font-bold text-lg text-orange-100">موعد جديد</p>
            
                </button>
            </div>
            <hr class="w-8/10 border border-orange-900/30 self-center my-2"/>


        </div>
    </div>
</div>
