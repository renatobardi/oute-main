<script lang="ts">
  import { currentInterview } from '$lib/stores/conversation';

  let searchQuery = '';
  let interviews = [
    {
      id: 'INT-2024-WHAT',
      title: 'Web Platform Architecture',
      preview: 'Olá, gostaria de estimar um projeto...',
      timestamp: '2 hours ago',
    },
    {
      id: 'INT-2024-APP',
      title: 'Mobile App Development',
      preview: 'E2E testing é importante...',
      timestamp: '5 hours ago',
    },
    {
      id: 'INT-2024-API',
      title: 'API Gateway Design',
      preview: 'Qual é a melhor arquitetura...',
      timestamp: '1 day ago',
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

<div class="flex flex-col h-full">
  <!-- Header -->
  <div class="px-4 py-4 border-b border-[#21404a]">
    <h3 class="text-sm font-semibold text-white mb-3">Interview History</h3>
    <input
      type="text"
      bind:value={searchQuery}
      placeholder="Search..."
      class="w-full bg-[#0f1e23] border border-[#21404a] rounded px-3 py-2 text-xs text-neutral-300 placeholder-neutral-500 focus:outline-none focus:border-primary-600"
    />
  </div>

  <!-- Interview List -->
  <div class="flex-1 overflow-y-auto">
    {#each filteredInterviews as interview (interview.id)}
      <button
        on:click={() => selectInterview(interview.id)}
        class="w-full px-4 py-3 text-left border-b border-[#21404a] hover:bg-[#1a3a44] transition-colors {$currentInterview?.id ===
        interview.id
          ? 'bg-[#21404a]'
          : ''}"
      >
        <p class="text-xs font-mono text-primary-400">{interview.id}</p>
        <p class="text-sm font-medium text-white truncate">{interview.title}</p>
        <p class="text-xs text-neutral-500 truncate">{interview.preview}</p>
        <p class="text-xs text-neutral-600 mt-1">{interview.timestamp}</p>
      </button>
    {/each}
  </div>

  <!-- New Interview Button -->
  <div class="px-4 py-3 border-t border-[#21404a]">
    <button
      class="w-full py-2 px-3 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded transition-colors"
    >
      + New Interview
    </button>
  </div>
</div>
