<script lang="ts">
  export let percentage: number = 0;
  export let status: 'Initial' | 'Low' | 'Medium' | 'High' = 'Initial';

  const statusColors: Record<string, { bg: string; bar: string }> = {
    Initial: { bg: '#1f2937', bar: '#6B7280' },      // Dark gray / Gray
    Low: { bg: '#7f1d1d', bar: '#EF4444' },          // Dark red / Red
    Medium: { bg: '#78350f', bar: '#FBBF24' },       // Dark amber / Amber
    High: { bg: '#064e3b', bar: '#10B981' },         // Dark green / Green
  };

  let showTooltip = false;

  const getColors = (st: string): { bg: string; bar: string } =>
    statusColors[st] || { bg: '#1f2937', bar: '#6B7280' };

  $: colors = getColors(status);
</script>

<div
  class="relative h-10 rounded-lg overflow-hidden cursor-pointer transition-all group"
  on:mouseenter={() => (showTooltip = true)}
  on:mouseleave={() => (showTooltip = false)}
  role="progressbar"
  aria-valuenow={percentage}
  aria-valuemin={0}
  aria-valuemax={100}
  style="background-color: {colors.bg};"
>
  <!-- Progress Bar Fill -->
  <div
    class="h-full flex items-center justify-center text-sm font-bold text-white transition-all duration-500"
    style="width: {percentage}%; background: linear-gradient(90deg, {colors.bar}, {colors.bar}dd);"
  >
    {#if percentage > 15}
      <span class="px-2">{percentage}%</span>
    {/if}
  </div>

  <!-- Tooltip on Hover -->
  {#if showTooltip}
    <div class="absolute -top-9 left-1/2 transform -translate-x-1/2 bg-neutral-900 text-white text-xs px-3 py-1.5 rounded whitespace-nowrap z-10 border border-neutral-700">
      {percentage}%
      <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-3 border-transparent border-t-neutral-900" />
    </div>
  {/if}
</div>
