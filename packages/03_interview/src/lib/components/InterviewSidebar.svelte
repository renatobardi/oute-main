<script lang="ts">
  import { currentInterview } from '$lib/stores/conversation';
  import { sidebarCollapsed } from '$lib/stores/ui';
  import { OuteLogo } from '@oute/design-system';
  import { users } from '$lib/stores/users';

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

<aside class="sidebar-transition w-[340px] flex-shrink-0 border-r border-[#000000] bg-[#000000] flex flex-col h-full">
  <!-- Header Section -->
  <div class="flex flex-col gap-3 p-4">
    <!-- Logo and Icon Row -->
    <div class="flex items-center justify-between">
      <OuteLogo size="xs" showSlogan={false} horizontal />
      <button
        on:click={() => sidebarCollapsed.toggle()}
        class="flex items-center justify-center text-neutral-400 hover:text-neutral-200 transition-colors p-1"
        title="Collapse sidebar"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect height="18" rx="5" ry="5" width="18" x="3" y="3"></rect>
          <line x1="12" x2="12" y1="3" y2="21"></line>
        </svg>
      </button>
    </div>

    <!-- Action Button -->
    <button class="flex w-4/5 mx-auto items-center justify-center gap-2 rounded-lg bg-transparent py-2.5 text-sm font-bold text-primary-500 border-2 border-primary-500 hover:bg-primary-500/10 transition-colors">
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
    ></div>

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
    ></div>
  </div>

  <!-- Bottom Section (Fixed) -->
  {#if users.length > 0}
    <div class="flex items-center gap-2 border-t border-[#000000] py-6 px-4">
      <div class="size-8 rounded-full {users[0].avatarColor} flex items-center justify-center text-white font-semibold flex-shrink-0">{users[0].initials}</div>
      <p class="text-sm font-semibold text-white">{users[0].name}</p>
      <button class="text-neutral-500 hover:text-neutral-300 transition-colors ml-auto" aria-label="User options">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      </button>
    </div>
  {/if}
</aside>
