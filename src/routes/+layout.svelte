<script lang="ts">
	import './layout.css';
	import Spinner from 'phosphor-svelte/lib/Spinner';
	import favicon from '$lib/assets/favicon.svg';
	import { fade, fly } from 'svelte/transition';
	import { page, navigating } from '$app/state';

	let { children } = $props();
	let isSidebarOpen = $state(false);
	const websiteTabs = [
		{ name: "الصفحة الرئيسية", link: "/" },
		{ name: "الحجوزات الجديدة", link: "/new-appointments" },
		{ name: "متابعة الحجوزات", link: "/appointments-follow-ups" },
		{ name: "متابعات المرضى", link: "/follow-ups" },
	]


	let navbarHeight = $state(0)
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
<nav class="sticky top-0 z-100 w-full h-18 bg-orange-100 flex justify-between items-center md:px-4 shadow-md" bind:clientHeight={navbarHeight}>
	<div class="font-bold text-xl px-4 text-orange-950 text-center">عيادة د/ شعيب علوان</div>
	<button 
		class="md:hidden flex flex-col justify-center items-center gap-2 p-6 cursor-pointer h-full hover:bg-orange-100 transition" 
		onclick={() => isSidebarOpen = !isSidebarOpen}
		aria-label="Menu Button"
	>
		<svg width="23" height="17" viewBox="0 0 23 15" fill="none" xmlns="http://www.w3.org/2000/svg">
			<line x1="1.5" y1="1.5" x2="21.5" y2="1.5" stroke="#1A0C00" stroke-width="3" stroke-linecap="round"/>
			<line x1="1.5" y1="7.5" x2="21.5" y2="7.5" stroke="#1A0C00" stroke-width="3" stroke-linecap="round"/>
			<line x1="1.5" y1="13.5" x2="21.5" y2="13.5" stroke="#1A0C00" stroke-width="3" stroke-linecap="round"/>
		</svg>

	</button>
	<div class="hidden md:flex justify-center items-center h-full">
		<div class="flex flex-row-reverse justify-center items-center h-full">
			{#each websiteTabs as tab}
				<a 
					class="h-full p-4 flex justify-center items-center hover:bg-orange-200 transition font-bold text-orange-950 text-md text-center cursor-pointer" 
					class:bg-orange-200={page.url.pathname === tab.link}
					href="{tab.link}" 
				>
					{tab.name}
				</a>
			{/each}
		</div>
		
		<button class="h-10 w-32 mx-2 rounded-md flex justify-center items-center bg-red-500 hover:bg-red-600 transition text-white font-bold cursor-pointer">
			Logout
		</button>
	</div>

</nav>
{#if isSidebarOpen}
	<div 
		class="md:hidden z-100 fixed top-0 left-0 w-full h-full bg-orange-100 shadow-md flex flex-col items-center justify-between transition-transform duration-300 ease-in-out"
		transition:fly={{ duration: 200, x: 300 }}>
		<div class="relative w-full flex justify-center items-center">
			<div class="w-full flex flex-col justify-center items-center">
				{#each websiteTabs as tab}
					<a 
						href="{tab.link}" 
						class="w-full p-4 flex justify-center items-center hover:bg-orange-200 transition font-bold text-orange-950 text-md border-b border-orange-900/30" 
						class:bg-orange-200={page.url.pathname === tab.link}
						onclick={() => isSidebarOpen = false}
					>
						{tab.name}
					</a>
				{/each}
			</div>
			<div class="absolute bottom-7 right-4 h-2/4 border-2 border-orange-900 flex justify-between items-center opacity-65">
				<span class="absolute right-1/2 -top-3 translate-x-1/2 w-5 h-5 rounded-full bg-orange-900 text-orange-50 font-bold text-sm flex justify-center items-center">1</span>
				<span class="absolute right-1/2 translate-x-1/2 w-5 h-5 rounded-full bg-orange-900 text-orange-50 font-bold text-sm flex justify-center items-center">2</span>
				<span class="absolute right-1/2 -bottom-3 translate-x-1/2 w-5 h-5 rounded-full bg-orange-900 text-orange-50 font-bold text-sm flex justify-center items-center">3</span>
			</div>
		</div>
		<div class="w-full flex flex-col justify-center items-center p-6 gap-2">
			<button class="h-12 w-full rounded-md flex justify-center items-center bg-orange-300 text-orange-900 font-bold hover:bg-orange-400 transition cursor-pointer"
				onclick={() => isSidebarOpen = false}
			>
				Close
			</button>
			<button class="h-12 w-full rounded-md flex justify-center items-center bg-red-500 hover:bg-red-600 transition text-white font-bold cursor-pointer">
				Logout
			</button>
		</div>
	</div>
{/if}

<div class="relative" style="height: calc(100vh - {navbarHeight}px);">
	{#if navigating.to}
		<div class="fixed top-0 left-0 w-full h-full bg-amber-950/20 z-110 flex justify-center items-center" transition:fade={{duration: 100}}>
			<Spinner size={64} weight="bold" color="#441405" class="animate-spin "/>
		</div>
	{/if}
	{@render children()}

</div>
