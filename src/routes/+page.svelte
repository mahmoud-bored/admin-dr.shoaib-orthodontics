<script lang="ts">
	import { Tabs } from "bits-ui";
	import Appointments from "./Appointments.svelte";
    let { data } = $props()
    
</script>

<div class="w-full h-full flex justify-center">
    <Tabs.Root
        value="present"
        class="rounded-card bg-background-alt shadow-card w-full lg:w-8/10 max-w-4xl pt-3"
    >
        <Tabs.List class="rounded-9px  text-orange-900 dark:bg-background grid w-full grid-cols-2 gap-1 p-1 text-md font-semibold leading-[0.01em] dark:border dark:border-neutral-600/30 px-2">
            <Tabs.Trigger
                value="past"
                class="data-[state=active]:shadow-mini dark:data-[state=active]:bg-muted h-10 rounded-[7px] py-2 bg-orange-100 data-[state=active]:bg-orange-200 hover:bg-orange-200 transition cursor-pointer"
            >
                المواعيد السابقة
            </Tabs.Trigger>
            <Tabs.Trigger
                value="present"
                class="data-[state=active]:shadow-mini dark:data-[state=active]:bg-muted h-10 rounded-[7px] py-2 bg-orange-100 data-[state=active]:bg-orange-200 hover:bg-orange-200 transition cursor-pointer"
            >
                الرئيسية
            </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="past" class="select-none pt-3">

            <Appointments { data } isPast={ true } />
            
        </Tabs.Content>
        <Tabs.Content value="present" class="rounded-b-md">

            <Appointments { data } isPast={ false } />

        </Tabs.Content>
  </Tabs.Root>
</div>

