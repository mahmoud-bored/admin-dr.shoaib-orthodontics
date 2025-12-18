<script lang="ts">
	import Check from "phosphor-svelte/lib/Check";
	import X from "phosphor-svelte/lib/X";
	import type { Snippet } from "svelte";
	import { fade } from "svelte/transition";

    interface FormData {
        title: string;
        preliminaryData?: {
            name: string;
            value: string | number;
        }[];
        actionButtonsProperties: {
            removeActionButtons?: boolean;
            actionButtonsType?: "text" | "icons";
            actionButtonsColors?: {
                submit?: string;
                cancel?: string;
            };
            actionButtonsTexts?: {
                submit: string;
                cancel: string;
            };
            actionButtonsFunctions?: {
                submit?: () => void;
                cancel?: () => void;
            };
        }
        formAction?: string;
    }
    let { 
        isFormOpen = $bindable(), 
        formData, 
        children 
    }: { 
        isFormOpen: { value: boolean }, 
        formData: FormData, 
        children: Snippet<[]>
    } = $props();

</script>


<button 
    onclick={() => {
        isFormOpen.value = false 
        formData.actionButtonsProperties.actionButtonsFunctions?.cancel?.()
    }} 
    class="fixed top-0 left-0 bg-gray-900/50 w-full h-full z-20" 
    aria-label="close" 
    transition:fade={{ duration: 150 }}
>
</button>
<form action="{formData.formAction}" method="POST" class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-9/10 max-w-[500px] rounded-md bg-orange-200 flex flex-col items-center gap-3 p-3" transition:fade={{ duration: 150 }}>
    <p class="text-xl font-bold text-orange-900">{formData.title}</p>
    <div class="w-full flex flex-col gap-1.5">
        {#each formData.preliminaryData as formEntry}
            <input type="text" name="{formEntry.name}" value="{formEntry.value}" hidden>
        {/each}

        {@render children()}

    </div>
    {#if !formData.actionButtonsProperties?.removeActionButtons}
        <div class="flex justify-center p-1 gap-4 w-full">
            <button 
                type="button"
                class={[
                    "w-3/10 rounded-full hover:brightness-80 transition text-orange-50 font-bold p-2 cursor-pointer flex justify-center items-center",
                    formData.actionButtonsProperties.actionButtonsColors?.cancel ?? "bg-gray-600",
                    formData.actionButtonsProperties.actionButtonsType === "text" ? "w-full rounded-md" : "w-3/10 rounded-full"
                ]}
                onclick={() => {
                    isFormOpen.value = false 
                    formData.actionButtonsProperties.actionButtonsFunctions?.cancel?.()
                }}
            >
                {#if formData.actionButtonsProperties.actionButtonsType === "icons"}
                    <X size={22} weight="bold" color="#fff7ed" class="relative mt-1.5"/>
                {:else if formData.actionButtonsProperties.actionButtonsType === "text"}
                    {formData.actionButtonsProperties.actionButtonsTexts?.cancel}
                {/if}
            </button>
            <button 
                type="submit"
                class={[
                    "hover:brightness-80 transition text-orange-50 font-bold p-2 cursor-pointer flex justify-center items-center",
                    formData.actionButtonsProperties.actionButtonsColors?.submit ?? "bg-green-600",
                    formData.actionButtonsProperties.actionButtonsType === "text" ? "w-full rounded-md" : "w-3/10 rounded-full"
                ]}
                onclick={() => formData.actionButtonsProperties.actionButtonsFunctions?.submit?.()}
            >
                {#if formData.actionButtonsProperties.actionButtonsType === "icons"}
                    <Check size={22} weight="bold" color="#fff7ed" class="relative mt-1.5"/>
                {:else if formData.actionButtonsProperties.actionButtonsType === "text"}
                    {formData.actionButtonsProperties.actionButtonsTexts?.submit}
                {/if}
            </button>
        </div>
    {/if}
</form>
