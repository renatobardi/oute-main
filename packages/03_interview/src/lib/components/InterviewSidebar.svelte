<script lang="ts">
  import { currentInterview } from '$lib/stores/conversation';

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
    <div class="flex items-center gap-3 px-2">
      <div class="size-8 bg-primary-500 rounded-lg flex items-center justify-center text-[#0f1e23]">
        <span class="text-lg font-bold">A</span>
      </div>
      <h1 class="text-xl font-bold tracking-tight text-white">Oute</h1>
    </div>

    <!-- Action Button -->
    <button class="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 py-2.5 text-sm font-bold text-[#0f1e23] hover:bg-primary-600 transition-colors">
      <span class="material-symbols-outlined text-[20px]">add_box</span>
      Nova Entrevista
    </button>

    <!-- Navigation List -->
    <div class="flex flex-col gap-1">
      <div class="flex items-center justify-between px-3 mb-2">
        <p class="text-[11px] font-bold uppercase tracking-wider text-slate-500">Entrevistas</p>
        <div class="flex gap-1">
          <button class="p-1 hover:bg-white/10 rounded text-slate-500 hover:text-slate-300 transition-colors" title="Sort">
            <span class="material-symbols-outlined text-[16px]">sort</span>
          </button>
          <button class="p-1 hover:bg-white/10 rounded text-slate-500 hover:text-slate-300 transition-colors" title="Filter">
            <span class="material-symbols-outlined text-[16px]">filter_list</span>
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
    <button class="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/5 cursor-pointer text-slate-400 transition-colors">
      <span class="material-symbols-outlined text-[20px]">settings</span>
      <p class="text-sm font-medium">Configurações</p>
    </button>
  </div>
</aside>
