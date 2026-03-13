<script lang="ts">
  import ProgressBar from './ProgressBar.svelte';
  import RangeVisualization from './RangeVisualization.svelte';
  import { notes } from '$lib/stores/conversation';
  import { users } from '$lib/stores/users';

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

<div class="flex flex-col h-full bg-[#000000]">
  <!-- Scrollable Content -->
  <div class="flex-1 overflow-y-auto px-6 py-5 space-y-6">
    <!-- Progress Section -->
    <div class="space-y-4">
      <div class="flex items-center">
        <button class="flex items-center justify-center text-neutral-400 hover:text-neutral-200 transition-colors p-1 flex-shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect height="18" rx="5" ry="5" width="18" x="3" y="3"></rect>
            <line x1="12" x2="12" y1="3" y2="21"></line>
          </svg>
        </button>
        <p class="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex-1 text-center">Current Progress</p>
        <button class="flex items-center justify-center text-neutral-400 hover:text-neutral-200 transition-colors p-1 flex-shrink-0">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </button>
      </div>
      <div class="flex justify-between items-center">
        <div class="text-4xl font-bold text-primary-500">{$notes.metrics.progress}%</div>
        <div class="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{statusDisplay.text}</span>
        </div>
      </div>

      <ProgressBar percentage={$notes.metrics.progress} status={progressStatus} />

      <p class="text-sm text-neutral-400">Targeting Phase 1 completion by Oct 24th</p>
    </div>

    <!-- Estimated Hours Section -->
    <div class="space-y-3">
      <p class="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Estimated Hours</p>

      <div class="flex items-center justify-between mb-2">
        <div class="text-sm">
          <span class="font-semibold text-white">{estimatedHours.min.toLocaleString('en-US', { maximumFractionDigits: 0 })}h</span>
          <span class="text-neutral-500"> - </span>
          <span class="font-semibold text-white">{estimatedHours.max.toLocaleString('en-US', { maximumFractionDigits: 0 })}h</span>
          <span class="text-neutral-500"> Total</span>
        </div>
        {#if estimatedHours.tshirtSize}
          <div class="flex items-center gap-3">
            <svg class="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.62 1.96V10a2 2 0 002 2h2v8a2 2 0 002 2h8a2 2 0 002-2v-8h2a2 2 0 002-2V5.42a2 2 0 00-1.62-1.96z" />
            </svg>
            <span class="text-white text-lg font-bold">{estimatedHours.tshirtSize}</span>
          </div>
        {/if}
      </div>

      <RangeVisualization
        minValue={estimatedHours.min}
        maxValue={estimatedHours.max}
        barColor="#0ea5e9"
      />
    </div>

    <!-- Budget Section -->
    <div class="space-y-3">
      <p class="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Project Budget</p>

      <div class="flex items-center justify-between mb-2">
        <div class="text-sm">
          <span class="font-semibold text-white">{budgetRange.min}</span>
          <span class="text-neutral-500"> — </span>
          <span class="font-semibold text-white">{budgetRange.max}</span>
        </div>
        <button class="text-neutral-500 hover:text-neutral-300 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </button>
      </div>

      <RangeVisualization
        minValue={budgetRange.min}
        maxValue={budgetRange.max}
        barColor="#EC4899"
      />
    </div>

    <!-- Tags Section -->
    {#if $notes.tags.length > 0}
      <div class="space-y-3 pt-2 border-t border-[#000000]">
        <p class="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Project Tags</p>
        <div class="flex flex-wrap gap-2">
          {#each $notes.tags as tag}
            <span class="px-3 py-1.5 bg-primary-500/10 border border-primary-600/30 text-primary-400 text-xs font-semibold rounded-full hover:bg-primary-500/20 transition-all cursor-default">
              {tag}
            </span>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Co-authors Section -->
    <div class="space-y-3 pt-2 border-t border-[#000000]">
      <p class="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Co-authors</p>
      <div class="flex items-center gap-2">
        {#each users as user}
          <div class="w-6 h-6 rounded-full {user.avatarColor} flex items-center justify-center text-white text-xs font-bold" title={user.name}>
            {user.initials}
          </div>
        {/each}
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="px-6 py-4 border-t border-[#000000] flex flex-col gap-4">
    <!-- Action Buttons -->
    <div class="flex flex-col gap-2">
      <button class="flex items-center justify-center rounded-lg bg-primary-500 py-2 text-sm font-bold text-[#0f1e23] hover:bg-primary-600 transition-colors">
        Dashboard
      </button>
      <button class="flex items-center justify-center rounded-lg bg-primary-500 py-2 text-sm font-bold text-[#0f1e23] hover:bg-primary-600 transition-colors">
        Projetos
      </button>
    </div>
  </div>
</div>
