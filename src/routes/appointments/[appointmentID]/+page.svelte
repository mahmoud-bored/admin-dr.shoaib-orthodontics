<script lang="ts">
    import { formatDate, formatTime, getDayName } from '$lib/jsAssets.js';
    import UserProfile from 'phosphor-svelte/lib/UserCircle';
    import X from 'phosphor-svelte/lib/X';
    import Timer from 'phosphor-svelte/lib/Timer';
    import Wallet from 'phosphor-svelte/lib/Wallet';
	import { fade } from 'svelte/transition';
    let { data } = $props();
    const appointmentData = data.appointmentData[0]
    let appointment_date = $state('')
    $effect(() => {
        appointment_date = appointmentData.appointment_date!
    })
    let isCancelAppointmentVerificationOpen = $state(false)
    let isCompleteAppointmentVerificationOpen = $state(false)
</script>

<div class="p-4 w-full h-full flex justify-center">
    <div class="w-full lg:w-8/10 max-w-4xl flex flex-col gap-3">
        <a href="/patients/{appointmentData.patient_id}">
            <button class="w-full p-4 bg-orange-200 rounded-md flex items-center gap-2 hover:bg-orange-300 transition cursor-pointer drop-shadow">
                <div class="p-1 flex justify-center items-center">
                    <UserProfile size={46} weight="fill" color="#441306"/>
                </div>
                <div class="flex flex-col items-baseline justify-center">
                    <p class="text-orange-950 font-bold text-lg">{appointmentData.full_name}</p>
                    <p class="text-orange-950 font-bold text-sm">{appointmentData.email}</p>
                    <p class="bg-orange-950 text-orange-50 font-bold text-sm py-0.5 px-2 mt-1 rounded-md">{appointmentData.phone_number}</p>
                </div>
            </button>
        </a>
        <div class="w-full py-4 px-6 bg-orange-200 rounded-md flex flex-col justify-center gap-2" dir="rtl">
            <div class="flex flex-col w-full gap-1">
                <p class="text-lg text-orange-950 font-bold">
                    تاريخ الموعد: 
                    <span class="bg-orange-950 text-orange-50 font-bold text-sm py-0.5 px-2 mt-1 rounded-md">
                        {getDayName(appointment_date, 'ar-eg')}
                    </span>
                    <span class="text-md">
                        {formatDate(appointment_date)}
                    </span>
                </p>
                <p class="text-lg text-orange-950">
                    <span class="font-bold">
                        وقت الموعد:
                    </span> 
                    <span class="bg-orange-950 text-orange-50 font-bold text-sm py-0.5 px-2 mt-1 rounded-md">
                        {formatTime(appointment_date)}
                    </span>
                </p>
                <p class="text-lg text-orange-950">
                    <span class="font-bold">
                        الحالة:
                    </span> 
                    <span class={[
                        "text-orange-50 font-bold text-sm py-0.5 px-2 mt-1 rounded-md",
                        appointmentData.is_done ? 'bg-green-900' : appointmentData.is_cancelled ? 'bg-red-900' : 'bg-gray-600'
                    ]}>
                        {
                            appointmentData.is_done ? 'اكتمل الموعد' : 
                                appointmentData.is_cancelled ? 'تم الإلغاء' : 
                                    'قيد الانتظار' 
                        }
                    </span>
                </p>
            </div>
            {#if !(appointmentData.is_done || appointmentData.is_cancelled)}
                <hr class="w-6/10 max-w-[250px] bg-orange-900/60 self-center rounded-md my-1"/>
                <form method="POST" class="flex flex-col justify-center items-center w-full gap-2">
                    <input type="hidden" name="patient_id" value="{appointmentData.patient_id}">
                    <input type="hidden" name="appointment_id" value="{appointmentData.appointment_id}">
                    <button 
                        type="button"
                        class="w-full max-w-[400px] p-2 flex justify-center items-center gap-2 bg-red-800 rounded-md text-orange-50 font-bold cursor-pointer hover:bg-red-900 transition"
                        onclick={() => isCancelAppointmentVerificationOpen = true}
                    >
                        إلغاء الموعد
                        <X size={22} weight="bold" color="#fff7ed" class="relative mt-1.5"/>
                    </button>
                    {#if isCancelAppointmentVerificationOpen}
                        <div class="absolute top-0 left-0 bg-gray-900/30 w-full h-full flex justify-center items-center z-10" transition:fade={{ duration: 150 }}>
                            <div class="w-9/10 max-w-[300px] rounded-md bg-orange-200 flex flex-col items-center gap-3 p-3">
                                <p class="text-lg font-bold text-orange-900">هل انت متأكد من إلغاء الموعد؟</p>
                                <div class="flex flex-col justify-center p-1 gap-1.5 w-full">
                                    <button formaction="?/cancel" class="w-full rounded-md bg-red-900 hover:bg-red-800 text-orange-50 font-bold p-2 cursor-pointer">
                                        إلغاء الموعد
                                    </button>
                                    <button 
                                        type="button"
                                        class="w-full rounded-md bg-gray-600 hover:bg-gray-700 text-orange-50 font-bold p-2 cursor-pointer"
                                        onclick={() => isCancelAppointmentVerificationOpen = false }
                                    >
                                        رجوع
                                    </button>
                                </div>
                            </div>
                        </div>
                    {/if}
                    <a href="/appointments/edit?appointment_id={appointmentData.appointment_id}" class="w-full flex justify-center">
                        <button type="button" class="w-full max-w-[400px] p-2 flex justify-center items-center gap-2 bg-gray-700 rounded-md text-orange-50 font-bold cursor-pointer hover:bg-gray-800 transition">
                            تأجيل الموعد
                            <Timer size={22} weight="fill" color="#fff7ed" class="relative mt-0.5"/>
                        </button>
                    </a>
                    <button 
                        type="button"
                        class="mt-2 w-full max-w-[400px] p-2 flex justify-center items-center gap-2 bg-green-600 rounded-md text-orange-50 font-bold cursor-pointer hover:bg-green-700 transition"
                        onclick={() => isCompleteAppointmentVerificationOpen = true}
                    >
                        اكتمل الموعد
                        <Wallet size={22} weight="fill" color="#fff7ed" class="relative mt-0.5 "/>
                    </button>
                    {#if isCompleteAppointmentVerificationOpen}
                        <div class="absolute top-0 left-0 bg-gray-900/30 w-full h-full flex justify-center items-center z-10" transition:fade={{ duration: 150 }}>
                            <div class="w-9/10 max-w-[300px] rounded-md bg-orange-200 flex flex-col items-center gap-3 p-3">
                                <p class="text-lg font-bold text-orange-900">هل انت متأكد من إكمال الموعد؟</p>
                                <div class="flex flex-col justify-center p-1 gap-1.5 w-full">
                                    <button formaction="?/complete" class="w-full rounded-md bg-green-600 hover:bg-green-700 text-orange-50 font-bold p-2 cursor-pointer">
                                        إكمال الموعد
                                    </button>
                                    <button 
                                        type="button"
                                        class="w-full rounded-md bg-gray-600 hover:bg-gray-700 text-orange-50 font-bold p-2 cursor-pointer"
                                        onclick={() => isCompleteAppointmentVerificationOpen = false }
                                    >
                                        رجوع
                                    </button>
                                </div>
                            </div>
                        </div>
                    {/if}
                </form>
            {/if}
        </div>
    </div>
</div>