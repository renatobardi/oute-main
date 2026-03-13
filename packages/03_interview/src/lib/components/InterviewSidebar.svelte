<script lang="ts">
  import { currentInterview } from '$lib/stores/conversation';
  import { OuteLogo } from '@oute/design-system';

  let searchQuery = '';
  let contentEl: HTMLDivElement;
  let showTopGradient = false;
  let showBottomGradient = false;

  function handleScroll() {
    if (!contentEl) return;

    const { scrollTop, scrollHeight, clientHeight } = contentEl;
    showTopGradient = scrollTop > 0;
    showBottomGradient = scrollTop < scrollHeight - clientHeight - 1;
  }

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
    {
      id: 'INT-2024-APJ',
      title: 'Database Optimization',
      preview: 'Performance issues com queries...',
      timestamp: '2 days ago',
      confidence: '78%',
    },
    {
      id: 'INT-2024-APK',
      title: 'Frontend Framework',
      preview: 'React vs Vue comparison...',
      timestamp: '3 days ago',
      confidence: '88%',
    },
    {
      id: 'INT-2024-APU',
      title: 'Cloud Infrastructure',
      preview: 'AWS vs Azure deployment...',
      timestamp: '4 days ago',
      confidence: '72%',
    },
    {
      id: 'INT-2024-APO',
      title: 'Security Audit',
      preview: 'Vulnerabilities assessment...',
      timestamp: '5 days ago',
      confidence: '91%',
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

<aside class="w-72 flex-shrink-0 border-r border-[#000000] bg-[#000000] flex flex-col h-full">
  <!-- Header Section -->
  <div class="flex flex-col gap-3 p-4">
    <!-- Logo -->
    <OuteLogo size="xs" showSlogan={false} horizontal />

    <!-- Action Button -->
    <button class="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 py-2.5 text-sm font-bold text-[#0f1e23] hover:bg-primary-600 transition-colors">
      New Interview
    </button>
  </div>

  <!-- Toolbar Section (Fixed) -->
  <div class="px-4 py-2">
    <!-- Search with Sort/Filter Buttons Inside -->
    <div class="relative flex items-center bg-[#0f1e23] border border-[#21404a] rounded">
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search..."
        class="flex-1 bg-transparent px-3 py-2 text-xs text-neutral-300 placeholder-neutral-500 focus:outline-none"
      />
      <div class="flex items-center gap-1 pr-2">
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
  </div>

  <!-- Content Section (Scrollable) -->
  <div
    bind:this={contentEl}
    on:scroll={handleScroll}
    class="flex-1 overflow-y-auto px-4 py-2 relative"
  >
    <!-- Top Gradient Fade -->
    <div
      class="pointer-events-none sticky top-0 left-0 right-0 h-4 transition-opacity duration-200"
      style="background: linear-gradient(to bottom, #000000, transparent); opacity: {showTopGradient ? 1 : 0}; z-index: 10;"
    />

    <!-- Interview Items -->
    <div class="flex flex-col gap-1">
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

    <!-- Bottom Gradient Fade -->
    <div
      class="pointer-events-none sticky bottom-0 left-0 right-0 h-4 transition-opacity duration-200"
      style="background: linear-gradient(to top, #000000, transparent); opacity: {showBottomGradient ? 1 : 0}; z-index: 10;"
    />
  </div>

  <!-- Bottom Section (Fixed) -->
  <div class="flex flex-col gap-1 border-t border-[#000000] pt-4 p-4">
    <div class="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/5 cursor-pointer">
      <div class="size-8 rounded-full bg-slate-600 flex items-center justify-center text-white font-semibold">U</div>
      <div class="flex flex-col">
        <p class="text-sm font-semibold text-white">User</p>
        <p class="text-[11px] text-slate-500">Professional</p>
      </div>
    </div>
    <button class="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-white/5 cursor-pointer text-slate-400 transition-colors" title="Settings">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <span class="text-xs">Settings</span>
    </button>
  </div>
</aside>
