<script lang="ts">
  export let percentage: number = 0;
  export let status: 'Initial' | 'Low' | 'Medium' | 'High' = 'Initial';

  const statusColors: Record<string, string> = {
    Initial: '#6B7280', // Cinza
    Low: '#EF4444', // Vermelho
    Medium: '#FBBF24', // Amarelo
    High: '#10B981', // Verde
  };

  let showTooltip = false;

  const getColor = (st: string): string => statusColors[st] || '#6B7280';
</script>

<div class="w-full">
  <div
    class="relative h-8 bg-[#0f1e23] border border-[#21404a] rounded-lg overflow-hidden cursor-pointer transition-all"
    on:mouseenter={() => (showTooltip = true)}
    on:mouseleave={() => (showTooltip = false)}
    role="progressbar"
    aria-valuenow={percentage}
    aria-valuemin={0}
    aria-valuemax={100}
  >
    <!-- Progress Bar Fill -->
    <div
      class="h-full flex items-center justify-center text-sm font-semibold text-white transition-all duration-300"
      style="width: {percentage}%; background-color: {getColor(status)};"
    >
      {#if percentage > 20}
        <span>{status}</span>
      {/if}
    </div>

    <!-- Status Label (if bar is small) -->
    {#if percentage <= 20}
      <div class="absolute inset-0 flex items-center justify-center text-sm font-semibold text-neutral-300 pointer-events-none">
        {status}
      </div>
    {/if}

    <!-- Tooltip -->
    {#if showTooltip}
      <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-neutral-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
        {percentage}%
        <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-neutral-800" />
      </div>
    {/if}
  </div>
</div>
