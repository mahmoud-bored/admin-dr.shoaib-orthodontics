<script lang="ts">
	import { search } from '$lib/jsAssets.js';
    import UserProfile from 'phosphor-svelte/lib/UserCircle';
    let { data } = $props();
    const patientsData = data.patientsData
    let searchString = $state('')
    const filteredPatientsData = $derived(search(patientsData, 'full_name', searchString))
</script>

<div class="p-4 w-full h-full flex justify-center">
    <div class="w-full lg:w-8/10 max-w-4xl">
        <div>
            <input 
                type="text" 
                placeholder="Search..." 
                class="w-full p-3 bg-orange-100 border-orange-950/40 border rounded-md mb-4" 
                bind:value={searchString}
            />
        </div>
        <div class="w-full gap-3 flex flex-col">
            {#each filteredPatientsData as patientData}
                <a href="/patients/{patientData.patient_id.toString()}">

                    <button class="w-full p-4 bg-orange-200 rounded-md flex justify-start items-center gap-3 hover:bg-orange-300 transition cursor-pointer drop-shadow">
                        <div class="flex justify-center items-center h-full">
                            <UserProfile size={40} weight="fill" color="#441306"/>
                        </div>
                        <div class="w-full flex flex-col items-baseline">
                            <div class="w-full flex flex-col justify-center items-baseline">
                                <p class="text-orange-950 font-bold text-lg">{patientData.full_name}</p>
                                <p class="text-orange-950 font-bold text-sm">{patientData.email}</p>
                            </div>
                            <p class="text-orange-100 text-sm font-bold p-0.5 px-2 bg-orange-900 rounded-md">{patientData.phone_number}</p>
                        </div>
                    </button>
                </a>
            {/each}
        </div>
    </div>
    

</div>