<script>
    import Bug from 'phosphor-svelte/lib/Bug';
</script>
<div class="p-4 w-full h-full flex justify-center">
    <div class="w-full lg:w-8/10 max-w-4xl flex flex-col gap-3">
        <div class="flex flex-col gap-1 items-center justify-center">
            <Bug size={100} weight="fill" color="#441306"/>
            <p class="text-lg text-center font-bold text-orange-950" dir="rtl">حدث خطأ، يرجى المحاولة لاحقا!</p>
        </div>
        <a href="/" class="mt-4 w-full flex justify-center">
            <button class="w-full max-w-[400px] self-center p-3 rounded-md flex justify-center items-center bg-orange-900 text-orange-50 text-md font-bold hover:bg-orange-950 transition cursor-pointer">
                الرجوع للصفحة الرئيسية
            </button>
        </a>
    </div>
</div>