<script lang="ts">
  export let percentage: number = 0;

  let showTooltip = false;
</script>

<div
  class="relative h-3 rounded-full overflow-hidden cursor-pointer bg-neutral-800"
  on:mouseenter={() => (showTooltip = true)}
  on:mouseleave={() => (showTooltip = false)}
  role="progressbar"
  aria-valuenow={percentage}
  aria-valuemin={0}
  aria-valuemax={100}
>
  <div
    class="h-full transition-all duration-500"
    style="width: {percentage}%; background: linear-gradient(90deg, var(--color-primary-500), var(--color-primary-600));"
  ></div>

  {#if showTooltip}
    <div
      class="absolute -top-9 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-xs px-3 py-1.5 rounded whitespace-nowrap z-10 border border-neutral-700"
    >
      {percentage}%
    </div>
  {/if}
</div>
