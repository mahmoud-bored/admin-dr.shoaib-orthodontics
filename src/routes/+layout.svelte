<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { fly } from 'svelte/transition';
	
	let { children } = $props();
	let isSidebarOpen = $state(false);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
<nav class="h-18 bg-orange-50 flex justify-between items-center md:px-4 shadow-md">
	<div class="font-bold text-xl px-4">Title to be Replaced</div>
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
		<a href="patients" class="h-full p-4 flex justify-center items-center hover:bg-orange-100 transition">
			Page 1
		</a>
		<a href="appointments" class="h-full p-4 flex justify-center items-center hover:bg-orange-100 transition">
			Page 2
		</a>
		<a href="website-submissions" class="h-full p-4 flex justify-center items-center hover:bg-orange-100 transition">
			Page 3
		</a>
		<button class="h-10 w-32 mx-2 rounded-md flex justify-center items-center bg-red-500 hover:bg-red-600 transition text-white font-bold cursor-pointer">
			Logout
		</button>
	</div>

</nav>
{#if isSidebarOpen}
	<div 
		class="md:hidden absolute top-0 left-0 w-full h-full bg-orange-100 shadow-md flex flex-col items-center justify-between transition-transform duration-300 ease-in-out"
		transition:fly={{ duration: 200, x: 300 }}>
		<div class="w-full flex flex-col justify-center items-center">
			<a href="patients" class="w-full p-4 flex justify-center items-center hover:bg-orange-200 transition" onclick={() => isSidebarOpen = false}>
				Page 1
			</a>
			<a href="appointments" class="w-full p-4 flex justify-center items-center hover:bg-orange-200 transition" onclick={() => isSidebarOpen = false}>
				Page 2
			</a>
			<a href="website-submissions" class="w-full p-4 flex justify-center items-center hover:bg-orange-200 transition" onclick={() => isSidebarOpen = false}>
				Page 3
			</a>
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

<div>
	{@render children()}

</div>
