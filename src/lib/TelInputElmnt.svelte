<script lang="ts">
    import { TelInput } from 'svelte-tel-input';
	import type { CountryCode } from 'svelte-tel-input/types';
	import type { E164Number } from 'svelte-tel-input/types';
	import type { DetailedValue } from 'svelte-tel-input/types';
	import { normalizedCountries } from 'svelte-tel-input';

    let { inputName }: { inputName: string } = $props()

    let phoneNumberContainer: HTMLDivElement | undefined = $state()

        // Any Country Code Alpha-2 (ISO 3166)
    let selectedCountry: CountryCode | null = $state('EG');

    // You must use E164 number format. It's guarantee the parsing and storing consistency.
    let phoneValue: E164Number | null = $state('');
    // Validity
    let phoneValid = $state(true);
    let phoneDetailedValue: DetailedValue | null = $state(null);
    let phoneNumber: string | undefined = $state()
    $effect(() => {
        phoneNumber = phoneDetailedValue?.phoneNumber ?? undefined
    })
</script>
<div class="relative w-full flex flex-row-reverse justify-center items-center rounded-sm transition font-bold text-orange-900" bind:this={phoneNumberContainer}>
    <TelInput
        bind:country={selectedCountry}
        bind:value={phoneValue}
        bind:valid={phoneValid}
        bind:detailedValue={phoneDetailedValue}
        required
        class="basic-tel-input {!phoneValid ? 'invalid border-2 border-red-500' : ''} w-full h-10 bg-orange-100 p-2 rounded-r-md"
    />
    <select
        class="country-select {!phoneValid ? 'invalid' : ''} bg-orange-100 border-r p-2 h-10 max-w-26 rounded-l-md border-gray-300"
        aria-label="Default select example"
        bind:value={selectedCountry}
    >
        <option value={null} hidden={selectedCountry !== null}>Please select</option>
        {#each normalizedCountries as currentCountry (currentCountry.id)}
            <option
                value={currentCountry.iso2}
                selected={currentCountry.iso2 === selectedCountry}
                aria-selected={currentCountry.iso2 === selectedCountry}
            >
                {currentCountry.iso2} (+{currentCountry.dialCode})
            </option>
        {/each}
    </select>

    <input type="text" name={inputName} bind:value={phoneNumber} hidden>
</div>