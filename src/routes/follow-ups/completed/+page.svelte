<script lang="ts">
    import { page } from '$app/state';
	import { getFullDateISOString } from '$lib/jsAssets';
	import Plus from 'phosphor-svelte/lib/Plus';
    const patient_id = page.url.searchParams.get('patient_id');
    const appointment_id = page.url.searchParams.get('appointment_id');

    console.log(patient_id, appointment_id)
    let isPaymentFormOpen = $state(false)
    let paymentAmount = $state(0)
    let isAmountPositive = $state("true")
    let notes = $state("")

    let isNewAppointmentFormOpen = $state({
        value: false,
        data: {
            appointment_time: "",
            appointment_date: "",
            dateIsoString: ""
        }
    })
    $effect(() => {
        if(isNewAppointmentFormOpen.data.appointment_date || isNewAppointmentFormOpen.data.appointment_time) {
            isNewAppointmentFormOpen.data.dateIsoString = getFullDateISOString(isNewAppointmentFormOpen.data.appointment_date!, isNewAppointmentFormOpen.data.appointment_time!)
        }
    })
    const notesList = [
        { text: "ملاحظة 1" },
        { text: "ملاحظة 2" },
        { text: "ملاحظة 3" },
    ]
</script>

<div class="p-4 w-full h-full flex justify-center">
    <form method="POST" class="w-full lg:w-8/10 max-w-4xl flex flex-col items-center gap-3">
        <input type="text" name="patient_id" value="{patient_id}" hidden>
        <input type="text" name="appointment_id" value="{appointment_id}" hidden>
        <input type="text" name="new_payment" value="{isPaymentFormOpen ? "true" : "false"}" hidden>
        <input type="text" name="new_appointment" value="{isNewAppointmentFormOpen.value ? "true" : "false"}" hidden>
        <input type="text" name="notes" bind:value={notes} hidden>
        <input type="text" name="date_iso_string" bind:value={isNewAppointmentFormOpen.data.dateIsoString} hidden>
        
        <div class="w-full md:max-w-[400px] bg-green-100 border-2 border-green-600 p-3 rounded-md">
            <p class="w-full text-center text-lg text-green-600 font-bold">تم تأكيد حضور الموعد بنجاح</p>   
        </div>
        <hr class="w-8/10 border border-green-600/40 self-center my-2"/>
        <button 
            type="button"
            class={[
                "w-full py-2  rounded-md flex justify-center items-center gap-3  transition cursor-pointer drop-shadow",
                isPaymentFormOpen ? "bg-gray-700 hover:bg-gray-800" : "bg-orange-900 hover:bg-orange-800"
            ]}
            onclick={() => isPaymentFormOpen = !isPaymentFormOpen }
        >
            <Plus size={24} weight="bold" color="#ffedd4" class={["mt-1", isPaymentFormOpen ? "hidden" : ""]}/>
            <p class="font-bold text-lg text-orange-100">
                { isPaymentFormOpen ? "إلغاء الدفعة المالية" : "إضافة دفعة مالية"}
            </p>
        </button>
        <div 
            class="h-0 w-full overflow-hidden flex flex-col justify-center items-center transition-all"
            class:h-26={isPaymentFormOpen}>
            <div class="flex w-full p-2">
                <select 
                    name="is_amount_positive" 
                    class="w-12 bg-orange-200 p-2 rounded-l-md rounded-r-none h-12 border-r border-orange-900 text-xl font-bold text-orange-900"
                    bind:value={isAmountPositive}
                >
                    <option value="true" selected>+</option>
                    <option value="false">-</option>
                </select>
                <input 
                    type="number" 
                    name="payment_amount" 
                    class="w-full h-12 p-2 rounded-r-md rounded-l-none bg-orange-200 font-bold text-orange-900 appearance-none"
                    placeholder="500"
                    bind:value={paymentAmount}
                />
            </div>
            <p class="text-lg text-orange-900 font-bold w-full pr-4" dir="rtl">
                المبلغ:
                {paymentAmount}
                {isAmountPositive == "true" ? "+" : "-"}
            </p>
        </div>
        <hr class="w-8/10 border border-orange-900/40 self-center my-2"/>
        <button 
            type="button"
            class={[
                "w-full py-2 rounded-md flex justify-center items-center gap-3 transition cursor-pointer drop-shadow",
                isNewAppointmentFormOpen.value ? "bg-gray-700 hover:bg-gray-800" : "bg-orange-900 hover:bg-orange-800"
            ]}
            onclick={() => isNewAppointmentFormOpen.value = !isNewAppointmentFormOpen.value}    
        >
            <Plus size={24} weight="bold" color="#ffedd4" class="mt-1"/>
            <p class="font-bold text-lg text-orange-100">إضافة موعد جديد</p>
        </button>
        <div 
            class="h-0 w-full overflow-hidden flex flex-col justify-center items-center transition-all"
            class:h-40={isNewAppointmentFormOpen.value}>
            <div class="flex flex-col w-full px-2 gap-2">
                <label for="new_appointment_date" class="w-full text-right text-orange-900 font-bold">تاريخ الحجز</label>
                <input class="bg-orange-200 w-full p-2 rounded-md" type="date" name="new_appointment_date" bind:value={ isNewAppointmentFormOpen.data.appointment_date }>
                <label for="new_appointment_time" class="w-full text-right text-orange-900 font-bold">موعد الحجز</label>
                <input class="bg-orange-200 w-full p-2 rounded-md" type="time" name="new_appointment_time" bind:value={ isNewAppointmentFormOpen.data.appointment_time }>
            </div>
        </div>

        <!-- <hr class="w-8/10 border border-orange-900/40 self-center my-2"/>

        <div class="w-full flex flex-col justify-center items-center gap-3">
            <p class="text-xl font-bold w-full text-right text-orange-900 mb-4">إضافة ملاحظات</p>
            {#each notesList as note}
                <button 
                    type="button"
                    class={[
                        "w-9/10 py-2 rounded-md flex justify-center items-center gap-3 transition cursor-pointer drop-shadow  hover:bg-sky-800 hover:text-orange-50 font-bold border-2 border-sky-900/30",
                        notes == note.text ? "bg-sky-800 text-orange-50" : "bg-sky-200 text-orange-900"
                    ]}
                    onclick={() => {
                        if(notes == note.text) notes = ""
                            else notes = note.text
                        
                    }}    
                >
                    {note.text}
                </button>
            {/each}
            <div class="w-full flex justify-center items-center gap-2 text-lg font-bold text-orange-900 mt-4" dir="rtl">
                <input 
                    type="text" 
                    name="other-note" 
                    placeholder="ملاحظات اخرى"
                    class="border-b border-orange-900 rounded-sm bg-orange-100 p-2 w-9/10"
                />
            </div>

        </div> -->




        <div class="fixed bottom-2 p-3 flex w-full">
            <button 
                type="submit" 
                class="w-full px-4 py-2 bg-green-600 rounded-md flex justify-center items-center gap-3 hover:bg-green-800 transition cursor-pointer drop-shadow"
            >
                <p class="font-bold text-lg text-orange-100">تم</p>
            </button>
        </div>
    </form>
</div>