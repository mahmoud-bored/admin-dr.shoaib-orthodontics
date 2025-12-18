<script lang="ts">
    import Spinner from 'phosphor-svelte/lib/Spinner';
	import { fade } from 'svelte/transition';
    import { Tabs } from "bits-ui";
	import PatientsAppointments from './PatientsAppointments.svelte';
	import PatientsList from './PatientsList.svelte';


    

    let { data } = $props();
    const patientAppointments = data.patientAppointments
    const patientsList = data.patients

    let loading = $state(false)


</script>

{#if loading}
    <div class="fixed top-0 left-0 w-full h-full bg-amber-950/40 z-110 flex justify-center items-center" transition:fade={{duration: 100}}>
        <Spinner size={64} weight="bold" color="#441405" class="animate-spin "/>
    </div>
{/if}



<div class="w-full h-full flex justify-center">
    <Tabs.Root
        value="appointments"
        class="rounded-card bg-background-alt shadow-card w-full lg:w-8/10 max-w-4xl pt-3"
    >
        <Tabs.List class="rounded-9px  text-orange-900 dark:bg-background grid w-full grid-cols-2 gap-1 p-1 text-md font-semibold leading-[0.01em] dark:border dark:border-neutral-600/30 px-2">
            <Tabs.Trigger
                value="patients"
                class="data-[state=active]:shadow-mini dark:data-[state=active]:bg-muted h-10 rounded-[7px] py-2 bg-orange-100 data-[state=active]:bg-orange-200 hover:bg-orange-200 transition cursor-pointer"
            >
                سجل المتابعين
            </Tabs.Trigger>
            <Tabs.Trigger
                value="appointments"
                class="data-[state=active]:shadow-mini dark:data-[state=active]:bg-muted h-10 rounded-[7px] py-2 bg-orange-100 data-[state=active]:bg-orange-200 hover:bg-orange-200 transition cursor-pointer"
            >
                المواعيد
            </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="patients" class="select-none pt-3">

            <PatientsList 
                patientsList={patientsList} 
                bind:loading={loading} 
            />
            
        </Tabs.Content>
        <Tabs.Content value="appointments" class="rounded-b-md">

            <PatientsAppointments 
                patientAppointments={patientAppointments}
                bind:loading={loading}
            />

        </Tabs.Content>
  </Tabs.Root>
</div>

