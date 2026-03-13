<script lang="ts">
  import ProgressBar from './ProgressBar.svelte';
  import RangeVisualization from './RangeVisualization.svelte';
  import { notes } from '$lib/stores/conversation';

  // Parse estimated hours range
  const parseEstimatedHours = (value: string): { min: number; max: number; tshirtSize?: string } => {
    // Format: "180k - 240k" or "180k-240k"
    const match = value.match(/(\d+k?)\s*-\s*(\d+k?)/i);
    if (match) {
      const parseNum = (str: string): number => {
        const num = parseFloat(str);
        return str.toLowerCase().includes('k') ? num * 1000 : num;
      };
      return {
        min: parseNum(match[1]),
        max: parseNum(match[2]),
        tshirtSize: 'M', // Default or could be derived
      };
    }
    return { min: 0, max: 0 };
  };

  // Parse budget range
  const parseBudget = (value: string): { min: string; max: string } => {
    // Format: "$134k" - for single value, use as midpoint approximation
    const match = value.match(/\$([\d.]+)([km]?)/i);
    if (match) {
      const num = parseFloat(match[1]);
      const suffix = match[2] || '';
      const base = suffix.toLowerCase() === 'k' ? num * 1000 : suffix.toLowerCase() === 'm' ? num * 1000000 : num;
      return {
        min: `$${(base * 0.8).toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
        max: `$${(base * 1.2).toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
      };
    }
    return { min: '$0', max: '$0' };
  };

  $: estimatedHours = parseEstimatedHours($notes.metrics.estimatedHours);
  $: budgetRange = parseBudget($notes.metrics.budget);

  // Determine progress status based on percentage
  const getProgressStatus = (
    percentage: number
  ): 'Initial' | 'Low' | 'Medium' | 'High' => {
    if (percentage < 25) return 'Initial';
    if (percentage < 50) return 'Low';
    if (percentage < 75) return 'Medium';
    return 'High';
  };

  $: progressStatus = getProgressStatus($notes.metrics.progress);
</script>

<div class="flex flex-col h-full">
  <!-- Header -->
  <div class="px-4 py-4 border-b border-[#21404a]">
    <h3 class="text-sm font-semibold text-white">Cockpit</h3>
  </div>

  <!-- Content -->
  <div class="flex-1 overflow-y-auto px-4 py-4 space-y-6">
    <!-- Progress Bar -->
    <div>
      <p class="text-xs text-neutral-500 mb-2">Progress</p>
      <ProgressBar percentage={$notes.metrics.progress} status={progressStatus} />
    </div>

    <!-- Estimated Hours -->
    <RangeVisualization
      label="Estimated Hours"
      minValue={estimatedHours.min}
      maxValue={estimatedHours.max}
      tshirtSize={estimatedHours.tshirtSize}
      barColor="#8B5CF6"
    />

    <!-- Budget -->
    <RangeVisualization
      label="Budget"
      minValue={budgetRange.min}
      maxValue={budgetRange.max}
      barColor="#EC4899"
    />

    <!-- Tags -->
    {#if $notes.tags.length > 0}
      <div>
        <p class="text-xs text-neutral-500 mb-2">Tags</p>
        <div class="flex flex-wrap gap-2">
          {#each $notes.tags as tag}
            <span class="px-2 py-1 bg-primary-600/10 text-primary-400 text-xs rounded">
              {tag}
            </span>
          {/each}
        </div>
      </div>
    {/if}
  </div>

</div>
