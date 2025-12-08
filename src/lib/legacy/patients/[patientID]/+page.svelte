<script lang="ts">
    import WhatsappLogo from 'phosphor-svelte/lib/WhatsappLogo';
    import Phone from 'phosphor-svelte/lib/Phone';
    import Scroll from 'phosphor-svelte/lib/Scroll'
    import Plus from 'phosphor-svelte/lib/Plus'
    import Wallet from 'phosphor-svelte/lib/Wallet'
    import { formatDate, formatDateTime, formatTime } from '$lib/jsAssets.js';
    let { data } = $props();
    const patientData = data.patientData[0]
    const patientAppointments = data.patientAppointments
    const patientPayments = data.patientPayments
    const patientFormSubmissions = data.patientFormSubmissions
</script>
<div class="p-4 w-full h-full flex justify-center">
    <div class="w-full lg:w-8/10 max-w-4xl flex flex-col gap-3">
        <div class="flex justify-between items-center flex-wrap gap-2 md:gap-0 p-4 bg-orange-200 rounded-md">

            <div class="flex flex-col justify-center items-baseline gap-2">
                <div class="flex flex-col">
                    <p class="text-orange-950 font-bold text-lg">{patientData.full_name}</p>
                    <p class="text-orange-950 font-bold text-sm">{patientData.email}</p>
                </div>
                <p class="text-orange-100 text-sm font-bold p-0.5 px-2 bg-orange-900 rounded-md">{patientData.phone_number}</p>
            </div>
            <div class="w-full md:w-auto flex flex-col justify-center items-center gap-2">
                <a href="https://api.whatsapp.com/send?phone={patientData.phone_number}" target="_blank" class="w-full md:w-auto">
                    <button class="bg-[#25a83f] rounded-md p-2 font-bold text-orange-50 cursor-pointer hover:bg-[#138d2b] transition w-full md:w-[200px] flex justify-center items-center gap-2">
                        <WhatsappLogo size={24} weight="fill" color="#fff" />
                        Whatsapp
                    </button>
                </a>
                <a href="tel:{patientData.phone_number}" target="_blank" class="w-full md:w-auto">
                    <button class="bg-indigo-500 rounded-md p-2 font-bold text-orange-50 cursor-pointer hover:bg-indigo-600 transition w-full md:w-[200px] flex justify-center items-center gap-2">
                        <Phone size={24} weight="regular" color="#fff" />
                        اتصال
                    </button>
                </a>
                <hr class="md:hidden w-8/10 border border-orange-950/70 rounded-full self-center my-1"/>

                <a href="/patients/edit?patient_id={patientData.patient_id}" class="w-full">
                    <button class="bg-gray-500 rounded-md p-2 font-bold text-orange-50 cursor-pointer hover:bg-gray-600 transition w-full md:w-[200px]">
                        تعديل بيانات المريض
                    </button>
                </a>
            </div>

        </div>
        <div class="flex justify-center items-center flex-wrap gap-5 p-4 bg-orange-200 rounded-md">
            <p class="text-xl font-bold text-orange-950">المواعيد</p>

            {#if patientAppointments?.length }
                <a href="/appointments/new?patient_id={patientData.patient_id}" class="w-full">
                    <button class="w-full px-4 py-2 bg-orange-950 rounded-md flex justify-center items-center gap-3 hover:bg-orange-800 transition cursor-pointer drop-shadow">
                        <Plus size={20} weight="bold" color="#ffedd4" class="mt-1"/>
                        <p class="font-bold text-md text-orange-100">موعد جديد</p>
                    </button>
                </a>
                <div class="flex flex-col gap-1.5 w-full ">
                    {#each patientAppointments as appointment}
                        <a href="/appointments/{appointment.appointment_id}" class="w-full">
                            <button class="bg-orange-300 rounded-md py-2 px-4 font-bold text-orange-900 cursor-pointer hover:bg-orange-100 transition w-full flex justify-between items-center">
                                <div class="flex items-center justify-center">
                                    <div class="flex justify-center items-center pr-2 mt-1">
                                        <Scroll size={30} weight="fill" color="#7e2a0c" />
                                    </div>
                                    <div class="flex flex-col items-baseline justify-center">
                                        <p class="text-orange-900 text-md font-bold">{formatDate(appointment.appointment_date)}</p>
                                        <p class="text-orange-900 text-sm font-bold">{formatTime(appointment.appointment_date)}</p>
                                    </div>
                                </div>
                                <div class="flex justify-center items-center">
                                    <div class="p-2 rounded-md bg-orange-900 text-orange-100 hover:bg-orange-800 transition font-bold text-sm">
                                        التفاصيل
                                    </div>
                                </div>
                            </button>
                        </a>
                    {/each}
                </div>
            {:else}
                <div class="w-full flex flex-col justify-center items-center">
                    <Scroll size={46} weight="light" color="#441306" />
                    <p class="text-lg font-bold text-orange-950" dir="rtl">لا توجد مواعيد حتى الآن!</p>
                </div>
                <a href="/appointments/new?patient_id={patientData.patient_id}" class="w-full">
                    <button class="w-full pz-4 py-2 bg-orange-900 rounded-md flex justify-center items-center gap-3 hover:bg-orange-800 transition cursor-pointer drop-shadow">
                        <Plus size={24} weight="bold" color="#ffedd4" class="mt-1"/>
                        <p class="font-bold text-lg text-orange-100">موعد جديد</p>
    
                    </button>
                </a>
            {/if}
        </div>

        <div class="flex justify-center items-center flex-wrap gap-5 p-4 bg-orange-200 rounded-md">
            <p class="text-xl font-bold text-orange-950">المدفوعات</p>

            {#if patientPayments?.length }
                <a href="/payments/new?patient_id={patientData.patient_id}" class="w-full">
                    <button class="w-full px-4 py-2 bg-orange-950 rounded-md flex justify-center items-center gap-3 hover:bg-orange-800 transition cursor-pointer drop-shadow">
                        <Plus size={20} weight="bold" color="#ffedd4" class="mt-1"/>
                        <p class="font-bold text-md text-orange-100">إضافة دفعة جديدة</p>
                    </button>
                </a>
                <div class="flex flex-col gap-1.5 w-full ">
                    {#each patientPayments as payment}
                        <a href="/payments/{payment.payment_id}" class="w-full">
                            <button class="bg-orange-300 rounded-md py-2 px-4 font-bold text-orange-900 cursor-pointer hover:bg-orange-100 transition w-full flex justify-between items-center">

                                <div class="flex items-center justify-center">
                                    <div class="flex justify-center items-center pr-2 mt-1">
                                        <Wallet size={30} weight="fill" color="#7e2a0c" />
                                    </div>
                                    <div class="flex flex-col items-baseline justify-center">
                                        <p class="text-orange-900 text-md font-bold">{ payment.is_amount_positive ? '+' : '-' }{ payment.amount }</p>
                                        <p class="text-orange-900 text-sm font-bold">{formatDateTime(payment.payment_date)}</p>
                                    </div>
                                </div>
                                <div class="flex justify-center items-center">
                                    <div class="p-2 rounded-md bg-orange-900 text-orange-100 hover:bg-orange-800 transition font-bold text-sm">
                                        التفاصيل
                                    </div>
                                </div>
                            </button>
                        </a>
                    {/each}
                </div>
            {:else}
                <div class="w-full flex flex-col justify-center items-center">
                    <Wallet size={46} weight="light" color="#441306" />
                    <p class="text-lg font-bold text-orange-950" dir="rtl">لا توجد مدفوعات حتى الآن!</p>
                </div>
                <a href="/payments/new?patient_id={patientData.patient_id}" class="w-full">
                    <button class="w-full pz-4 py-2 bg-orange-900 rounded-md flex justify-center items-center gap-3 hover:bg-orange-800 transition cursor-pointer drop-shadow">
                        <Plus size={24} weight="bold" color="#ffedd4" class="mt-1"/>
                        <p class="font-bold text-lg text-orange-100">إضافة دفعة جديدة</p>
    
                    </button>
                </a>
            {/if}
        </div>

        
    </div>
</div>
