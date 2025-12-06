<script lang="ts">
    import UserProfile from 'phosphor-svelte/lib/UserCircle';
    import WhatsappLogo from 'phosphor-svelte/lib/WhatsappLogo';
    import Phone from 'phosphor-svelte/lib/Phone';
    import { formatDate, formatTime } from '$lib/jsAssets.js';
    let { data } = $props();
    const patientFormSubmissions = data.patientFormSubmissions[0]
</script>

<div class="p-4 w-full h-full flex justify-center">
    <div class="w-full lg:w-8/10 max-w-4xl flex flex-col gap-3">
        <a href="/patients/{patientFormSubmissions.patient_id}">
            <button class="w-full p-4 bg-orange-200 rounded-md flex items-center gap-2 hover:bg-orange-300 transition cursor-pointer drop-shadow">
                <div class="p-1 flex justify-center items-center">
                    <UserProfile size={46} weight="fill" color="#441306"/>
                </div>
                <div class="flex flex-col items-baseline justify-center">
                    <p class="text-orange-950 font-bold text-lg">{patientFormSubmissions.full_name}</p>
                    <p class="text-orange-950 font-bold text-sm">{patientFormSubmissions.email}</p>
                    <p class="bg-orange-950 text-orange-50 font-bold text-sm py-0.5 px-2 mt-1 rounded-md">{patientFormSubmissions.phone_number}</p>
                </div>
            </button>
        </a>
    
        <div class="w-full p-4 bg-orange-200 rounded-md flex flex-col justify-center gap-2 " dir="rtl">
            <table dir="rtl">
                <tbody>
                    <tr>
                        <td class="font-bold text-md px-1 pb-1">الإسم: </td>
                        <td>{patientFormSubmissions.full_name}</td>
                    </tr>
                    <tr>
                        <td class="font-bold text-md px-1 pb-1">رقم الهاتف: </td>
                        <td>{patientFormSubmissions.phone_number}</td>
                    </tr>
                    <tr>
                        <td class="font-bold text-md px-1 pb-1">تاريخ الطلب: </td>
                        <td>
                            {formatDate(patientFormSubmissions.created_at!)}
                            <span class="p-0.5 px-2 bg-orange-900 text-sm font-bold text-orange-50 rounded-md mx-2">{formatTime(patientFormSubmissions.created_at!)}</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="font-bold text-sm px-1 pb-1 pt-2">UTM Campaign</td>
                        <td>{patientFormSubmissions.utm_campaign}</td>
                    </tr>
                    <tr>
                        <td class="font-bold text-sm px-1 pb-1">UTM Medium</td>
                        <td>{patientFormSubmissions.utm_medium}</td>
                    </tr>
                    <tr>
                        <td class="font-bold text-sm px-1 pb-1">UTM Source</td>
                        <td>{patientFormSubmissions.utm_source}</td>
                    </tr>
                </tbody>
            </table>
            <div class="flex flex-col justify-center items-center gap-1" dir="ltr">
                <a href="https://api.whatsapp.com/send?phone={patientFormSubmissions.phone_number}" target="_blank" class="w-full flex justify-center">
                    <button class="bg-[#25a83f] rounded-md px-2 py-1 font-bold text-orange-50 cursor-pointer hover:bg-[#1dac3a] transition w-full max-w-[400px] flex justify-center items-center gap-2" >
                        <WhatsappLogo size={22} weight="fill" color="#fff" />
                        Whatsapp
                    </button>
                </a>
                <a href="tel:{patientFormSubmissions.phone_number}" target="_blank" class="w-full flex justify-center">
                    <button class="bg-indigo-500 rounded-md px-2 py-1 font-bold text-orange-50 cursor-pointer hover:bg-indigo-600 transition w-full max-w-[400px] flex justify-center items-center gap-2">
                        <Phone size={22} weight="regular" color="#fff" />
                        اتصال
                    </button>
                </a>
                <hr class="w-8/10 max-w-[300px] border border-orange-950/70 rounded-full self-center my-1"/>
                <a href="/appointments/new?patient_id={patientFormSubmissions.patient_id}" class="w-full flex justify-center">
                    <button class="bg-gray-500 rounded-md p-2 font-bold text-orange-50 cursor-pointer hover:bg-gray-600 transition w-full max-w-[400px]">
                        إنشاء موعد جديد
                    </button>
                </a>
            </div>
        </div>
    </div>
</div>