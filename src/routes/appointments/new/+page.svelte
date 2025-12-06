<script lang="ts">
    import { page } from '$app/state';
    const patient_id = page.url.searchParams.get('patient_id');
    
    const { data } = $props();
    const patientsData = data.patientsData
</script>

<div class="p-4 w-full h-full flex justify-center">
    <div class="w-full lg:w-8/10 max-w-4xl">
        <div class="w-full px-4 py-2 bg-orange-200 rounded-md flex flex-col justify-center items-center gap-3">
            <p class="w-full text-center text-xl text-orange-950 font-bold">موعد جديد</p>
            <form action="" class="w-full p-3">
                <select name="patient_id" class="bg-orange-300 p-3 rounded-md w-full">
                    {#each patientsData as patientData}
                        <option value={patientData.patient_id} class="bg-orange-100 rounded-t-none hover:bg-orange-200 hover:n">
                            {patientData.full_name}
                        </option>
                        <option class="bg-orange-100 rounded-t-none" value="{patientData.patient_id}">{patientData.phone_number}</option>
                    {/each}
                </select>
            </form>
        </div>
    </div>
</div>