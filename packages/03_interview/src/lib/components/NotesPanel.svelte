<script lang="ts">
  import ProgressBar from './ProgressBar.svelte';
  import RangeVisualization from './RangeVisualization.svelte';
  import { notes } from '$lib/stores/conversation';

  // Parse estimated hours range
  const parseEstimatedHours = (value: string): { min: number; max: number; tshirtSize?: string } => {
    const match = value.match(/(\d+k?)\s*-\s*(\d+k?)/i);
    if (match) {
      const parseNum = (str: string): number => {
        const num = parseFloat(str);
        return str.toLowerCase().includes('k') ? num * 1000 : num;
      };
      return {
        min: parseNum(match[1]),
        max: parseNum(match[2]),
        tshirtSize: 'M',
      };
    }
    return { min: 0, max: 0 };
  };

  // Parse budget range
  const parseBudget = (value: string): { min: string; max: string } => {
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

  // Map status to human readable text and color
  const getStatusDisplay = (status: string): { text: string; color: string } => {
    const statusMap: Record<string, { text: string; color: string }> = {
      Initial: { text: 'Planning', color: 'text-neutral-400' },
      Low: { text: 'At Risk', color: 'text-red-400' },
      Medium: { text: 'In Progress', color: 'text-yellow-400' },
      High: { text: 'On Track', color: 'text-green-400' },
    };
    return statusMap[status] || { text: 'Unknown', color: 'text-neutral-400' };
  };

  $: statusDisplay = getStatusDisplay(progressStatus);
</script>

<div class="flex flex-col h-full bg-[#0f1e23]">
  <!-- Header -->
  <div class="px-6 py-5 border-b border-[#21404a] flex items-center justify-between bg-gradient-to-r from-[#162a31] to-[#0f1e23]">
    <div class="flex items-center gap-3">
      <span class="text-2xl">🚀</span>
      <h3 class="text-lg font-bold text-white">Cockpit</h3>
    </div>
    <button class="text-neutral-500 hover:text-neutral-300 transition-colors">
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
      </svg>
    </button>
  </div>

  <!-- Scrollable Content -->
  <div class="flex-1 overflow-y-auto px-6 py-5 space-y-7">
    <!-- Progress Section -->
    <div class="space-y-3">
      <p class="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Current Progress</p>

      <div class="flex items-center justify-between gap-4">
        <div class="flex-1">
          <div class="text-4xl font-bold text-primary-600">{$notes.metrics.progress}%</div>
        </div>
        <div class={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusDisplay.color} bg-opacity-10 bg-current`}>
          <span class={`w-2 h-2 rounded-full ${statusDisplay.color.replace('text-', 'bg-')}`}></span>
          {statusDisplay.text}
        </div>
      </div>

      <ProgressBar percentage={$notes.metrics.progress} status={progressStatus} />

      <p class="text-xs text-neutral-500">Targeting Phase 1 completion by Oct 24th</p>
    </div>

    <!-- Estimated Hours Section -->
    <div class="space-y-3 pt-2">
      <p class="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Estimated Hours</p>

      <div class="flex items-center justify-between">
        <div class="text-sm">
          <span class="font-semibold text-white">{estimatedHours.min.toLocaleString('en-US', { maximumFractionDigits: 0 })}k</span>
          <span class="text-neutral-500"> - </span>
          <span class="font-semibold text-white">{estimatedHours.max.toLocaleString('en-US', { maximumFractionDigits: 0 })}k</span>
          <span class="text-neutral-500"> Total</span>
        </div>
        {#if estimatedHours.tshirtSize}
          <div class="px-3 py-1 rounded border border-primary-600 text-primary-400 text-xs font-semibold">
            T-SHIRT: {estimatedHours.tshirtSize}
          </div>
        {/if}
      </div>

      <RangeVisualization
        minValue={estimatedHours.min}
        maxValue={estimatedHours.max}
        barColor="#3B82F6"
      />
    </div>

    <!-- Budget Section -->
    <div class="space-y-3 pt-2">
      <p class="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Project Budget</p>

      <div class="flex items-center justify-between">
        <div class="text-sm">
          <span class="font-semibold text-white">{budgetRange.min}</span>
          <span class="text-neutral-500"> — </span>
          <span class="font-semibold text-white">{budgetRange.max}</span>
        </div>
        <span class="text-xl">💰</span>
      </div>

      <RangeVisualization
        minValue={budgetRange.min}
        maxValue={budgetRange.max}
        barColor="#EC4899"
      />
    </div>

    <!-- Tags Section -->
    {#if $notes.tags.length > 0}
      <div class="space-y-3 pt-2">
        <p class="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Project Tags</p>
        <div class="flex flex-wrap gap-2">
          {#each $notes.tags as tag}
            <span class="px-3 py-1.5 bg-transparent border border-primary-600 text-primary-400 text-xs font-semibold rounded-full">
              {tag}
            </span>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  <!-- Footer -->
  <div class="px-6 py-4 border-t border-[#21404a] flex items-center justify-between bg-gradient-to-r from-[#0f1e23] to-[#162a31]">
    <div class="flex items-center gap-2">
      <div class="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
        A
      </div>
      <div class="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
        B
      </div>
      <button class="w-6 h-6 rounded-full bg-neutral-700 hover:bg-neutral-600 flex items-center justify-center text-white text-xs font-bold transition-colors">
        +4
      </button>
    </div>

    <button class="flex items-center gap-1 text-primary-400 hover:text-primary-300 transition-colors text-sm font-semibold group">
      View Detailed Report
      <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
</div>
