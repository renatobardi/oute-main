<script lang="ts">
  export let percentage: number = 0;
  export let status: 'Initial' | 'Low' | 'Medium' | 'High' = 'Initial';

  const statusColors: Record<string, { bg: string; bar: string }> = {
    Initial: { bg: '#1f2937', bar: '#6B7280' },      // Dark gray / Gray
    Low: { bg: '#7f1d1d', bar: '#EF4444' },          // Dark red / Red
    Medium: { bg: '#78350f', bar: '#FBBF24' },       // Dark amber / Amber
    High: { bg: '#0a4a7f', bar: '#0ea5e9' },         // Dark blue / Cyan
  };

  let showTooltip = false;

  const getColors = (st: string): { bg: string; bar: string } =>
    statusColors[st] || { bg: '#1f2937', bar: '#6B7280' };

  $: colors = getColors(status);
</script>

<div
  class="relative h-3 rounded-full overflow-hidden cursor-pointer transition-all group bg-[#1f2937]"
  on:mouseenter={() => (showTooltip = true)}
  on:mouseleave={() => (showTooltip = false)}
  role="progressbar"
  aria-valuenow={percentage}
  aria-valuemin={0}
  aria-valuemax={100}
>
  <!-- Progress Bar Fill -->
  <div
    class="h-full transition-all duration-500"
    style="width: {percentage}%; background: linear-gradient(90deg, #06bcf9, #00d2ff);"
  >
  </div>

  <!-- Tooltip on Hover -->
  {#if showTooltip}
    <div class="absolute -top-9 left-1/2 transform -translate-x-1/2 bg-neutral-900 text-white text-xs px-3 py-1.5 rounded whitespace-nowrap z-10 border border-neutral-700">
      {percentage}%
      <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-3 border-transparent border-t-neutral-900"></div>
    </div>
  {/if}
</div>
