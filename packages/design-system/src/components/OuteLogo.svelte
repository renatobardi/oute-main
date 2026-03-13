<script lang="ts">
	export let size: 'xs' | 'sm' | 'md' | 'lg' = 'md';
	export let showSlogan = true;
	export let horizontal = false;

	const sizeMap = {
		xs: 'w-6 h-6',
		sm: 'w-8 h-8',
		md: 'w-12 h-12',
		lg: 'w-16 h-16'
	};

	const sizeClass = sizeMap[size];
</script>

{#if horizontal}
	<div class="flex flex-col gap-1">
		<div class="flex items-center gap-3">
			<!-- Oute Logo SVG -->
			<svg
				class={`${sizeClass} flex-shrink-0`}
				fill="none"
				viewBox="0 0 100 100"
				xmlns="http://www.w3.org/2000/svg"
			>
				<defs>
					<linearGradient id="logo-gradient" x1="0%" x2="100%" y1="0%" y2="100%">
						<stop offset="0%" style="stop-color:#22D3EE" />
						<stop offset="100%" style="stop-color:#0EA5E9" />
					</linearGradient>
				</defs>
				<!-- Outer Ring -->
				<path
					d="M50 10C27.9086 10 10 27.9086 10 50C10 72.0914 27.9086 90 50 90C72.0914 90 90 72.0914 90 50"
					stroke="url(#logo-gradient)"
					stroke-linecap="round"
					stroke-width="12"
				/>
				<!-- Inner Geometric Element with pulse animation -->
				<rect
					class="animate-pulse"
					fill="url(#logo-gradient)"
					height="30"
					rx="8"
					width="16"
					x="42"
					y="35"
				/>
			</svg>

			<!-- Name Oute -->
			<span class="text-lg font-bold text-white">Oute</span>
		</div>

		<!-- Slogan (optional) -->
		{#if showSlogan}
			<p class="text-xs font-medium text-white text-center">A jornada começa aqui!</p>
		{/if}
	</div>
{:else}
	<div class="flex flex-col items-center {showSlogan ? 'gap-2' : ''}">
		<!-- Oute Logo SVG -->
		<svg
			class={`${sizeClass} flex-shrink-0`}
			fill="none"
			viewBox="0 0 100 100"
			xmlns="http://www.w3.org/2000/svg"
		>
			<defs>
				<linearGradient id="logo-gradient" x1="0%" x2="100%" y1="0%" y2="100%">
					<stop offset="0%" style="stop-color:#22D3EE" />
					<stop offset="100%" style="stop-color:#0EA5E9" />
				</linearGradient>
			</defs>
			<!-- Outer Ring -->
			<path
				d="M50 10C27.9086 10 10 27.9086 10 50C10 72.0914 27.9086 90 50 90C72.0914 90 90 72.0914 90 50"
				stroke="url(#logo-gradient)"
				stroke-linecap="round"
				stroke-width="12"
			/>
			<!-- Inner Geometric Element with pulse animation -->
			<rect
				class="animate-pulse"
				fill="url(#logo-gradient)"
				height="30"
				rx="8"
				width="16"
				x="42"
				y="35"
			/>
		</svg>

		<!-- Slogan (optional) -->
		{#if showSlogan}
			<p class="text-xs font-medium text-white text-center">A jornada começa aqui!</p>
		{/if}
	</div>
{/if}

<style>
	/* Tailwind handles all styling via classes */
</style>
