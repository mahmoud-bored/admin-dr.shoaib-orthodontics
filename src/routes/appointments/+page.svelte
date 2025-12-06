<script lang="ts">
    import Scroll from 'phosphor-svelte/lib/Scroll'
    import Plus from 'phosphor-svelte/lib/Plus'
    import { formatDate, formatTime } from '$lib/jsAssets';
    let { data } = $props();
    const patientsAppointments = data.patientsAppointments


</script>

<div class="p-4 w-full h-full flex justify-center">
    <div class="w-full lg:w-8/10 max-w-4xl">
        <div class="w-full gap-3 flex flex-col">
            <a href="/appointments/new">
                <button class="w-full pz-4 py-2 bg-orange-200 rounded-md flex justify-center items-center gap-3 hover:bg-orange-300 transition cursor-pointer drop-shadow">
                    <Plus size={24} weight="bold" color="#441306" />
                    <p class="font-bold text-lg text-orange-950">موعد جديد</p>
    
                </button>
            </a>
            <hr class="w-8/10 border border-orange-950/70 rounded-full self-center my-2"/>
            {#each patientsAppointments as patientAppointment}
                <a href="/appointments/{patientAppointment.appointment_id!.toString()}">
                    <button class="w-full p-4 bg-orange-200 rounded-md flex justify-start items-center gap-3 hover:bg-orange-300 transition cursor-pointer drop-shadow">
                        <div class="flex justify-center items-center h-full">
                            <Scroll size={32} weight="fill" color="#441306" />
                        </div>
                        <div class="w-full flex flex-col items-baseline">
                            <div class="w-full flex flex-col justify-center items-baseline">
                                <p class="text-orange-950 font-bold text-lg text-left">{patientAppointment.full_name}</p>
                                <p class="text-orange-950 font-bold text-sm text-left">{patientAppointment.phone_number}</p>
                                <p class="text-orange-50 font-bold text-md mt-0.5">
                                    <span class="bg-orange-950 p-0.5 px-2 rounded-sm">
                                        {formatTime(patientAppointment.appointment_date!)}
                                    </span>
                                    <span class="bg-orange-950 p-0.5 px-2 rounded-sm">
                                        {formatDate(patientAppointment.appointment_date!)}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <div class="flex justify-center items-center">
                            <div class={[
                                "rounded-md flex flex-col justify-center items-center py-1 px-3 w-18",
                                patientAppointment.is_done ? 'bg-green-700' : 
                                    patientAppointment.is_cancelled ? 'bg-red-700' : 
                                        'bg-gray-700'
                            ]}>
                                <p class="text-orange-50 font-bold text-md">
                                    {
                                        patientAppointment.is_done ? 'اكتمل الموعد' : 
                                            patientAppointment.is_cancelled ? 'تم الإلغاء' : 
                                                'قيد الانتظار' 
                                    }
                                </p>

                            </div>
                        </div>
                    </button>
                </a>
            {/each}
        </div>
    </div>
    

</div>