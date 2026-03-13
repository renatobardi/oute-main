<script lang="ts">
  import { currentInterview } from '$lib/stores/conversation';
  import { OuteLogo } from '@oute/design-system';

  let searchQuery = '';
  let interviews = [
    {
      id: 'INT-2024-WHAT',
      title: 'Web Platform Architecture',
      preview: 'Olá, gostaria de estimar um projeto...',
      timestamp: '2 hours ago',
      confidence: '85%',
    },
    {
      id: 'INT-2024-APP',
      title: 'Mobile App Development',
      preview: 'E2E testing é importante...',
      timestamp: '5 hours ago',
      confidence: '92%',
    },
    {
      id: 'INT-2024-API',
      title: 'API Gateway Design',
      preview: 'Qual é a melhor arquitetura...',
      timestamp: '1 day ago',
      confidence: '45%',
    },
  ];

  function selectInterview(id: string) {
    const interview = interviews.find((i) => i.id === id);
    if (interview) {
      currentInterview.set({
        id: interview.id,
        title: interview.title,
        status: 'in_progress',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  $: filteredInterviews = interviews.filter(
    (i) =>
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.id.toLowerCase().includes(searchQuery.toLowerCase())
  );
</script>

<aside class="w-72 flex-shrink-0 border-r border-[#21404a] bg-[#0a1519] flex flex-col justify-between p-4">
  <div class="flex flex-col gap-6">
    <!-- Logo -->
    <OuteLogo size="sm" showSlogan={false} horizontal />

    <!-- Action Button -->
    <button class="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 py-2.5 text-sm font-bold text-[#0f1e23] hover:bg-primary-600 transition-colors">
      New Interview
    </button>

    <!-- Navigation List -->
    <div class="flex flex-col gap-1">
      <div class="flex items-center justify-end px-3 mb-2">
        <div class="flex gap-1">
          <button class="p-1 hover:bg-white/10 rounded text-slate-500 hover:text-slate-300 transition-colors" title="Sort">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
          <button class="p-1 hover:bg-white/10 rounded text-slate-500 hover:text-slate-300 transition-colors" title="Filter">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Search -->
      <div class="px-3 mb-3">
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Search..."
          class="w-full bg-[#0f1e23] border border-[#21404a] rounded px-3 py-2 text-xs text-neutral-300 placeholder-neutral-500 focus:outline-none focus:border-primary-500"
        />
      </div>

      <!-- Interview Items -->
      {#each filteredInterviews as interview (interview.id)}
        <button
          on:click={() => selectInterview(interview.id)}
          class="w-full text-left rounded-lg px-3 py-2 hover:bg-white/5 transition-colors {$currentInterview?.id === interview.id
            ? 'bg-primary-500/10 border border-primary-500/20'
            : 'border border-transparent'}"
        >
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-medium text-primary-500">{interview.id}</span>
            <span class="text-[10px] font-bold text-primary-500 bg-primary-500/20 px-1.5 py-0.5 rounded">
              {interview.confidence}
            </span>
          </div>
          <p class="text-sm font-medium text-white truncate">{interview.title}</p>
          <p class="text-xs text-slate-500 truncate">{interview.preview}</p>
          <p class="text-xs text-slate-600 mt-1">{interview.timestamp}</p>
        </button>
      {/each}
    </div>
  </div>

  <!-- Sidebar Bottom -->
  <div class="flex flex-col gap-1 border-t border-[#21404a] pt-4">
    <div class="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/5 cursor-pointer">
      <div class="size-8 rounded-full bg-slate-600 flex items-center justify-center text-white font-semibold">U</div>
      <div class="flex flex-col">
        <p class="text-sm font-semibold text-white">User</p>
        <p class="text-[11px] text-slate-500">Professional</p>
      </div>
    </div>
    <button class="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/5 cursor-pointer text-slate-400 transition-colors" title="Settings">
      <span class="material-symbols-outlined text-[20px]">settings</span>
    </button>
  </div>
</aside>
