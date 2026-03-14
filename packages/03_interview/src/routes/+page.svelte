<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import InterviewSidebar from '$lib/components/InterviewSidebar.svelte';
  import ChatWindow from '$lib/components/ChatWindow.svelte';
  import ChatInput from '$lib/components/ChatInput.svelte';
  import NotesPanel from '$lib/components/NotesPanel.svelte';
  import { currentInterview, messages, notes, initialInputValue, estimationId, estimationStatus } from '$lib/stores/conversation';
  import { sidebarCollapsed, notePanelCollapsed } from '$lib/stores/ui';
  import { fetchInterviews, createInterview, fetchInterviewDetail, getEstimationStatus } from '$lib/api';
  import { startEstimationStream } from '$lib/estimation';

  export let data: { user: App.Locals['user'] };

  // Pass initial message from URL param to chat input
  $: if ($page?.url) {
    const param = $page.url.searchParams.get('initial');
    if (param) initialInputValue.set(param);
  }

  onMount(async () => {
    try {
      let list = await fetchInterviews();

      // If user has no interviews yet, auto-create the first one
      if (list.length === 0) {
        await createInterview('Nova Entrevista');
        list = await fetchInterviews();
      }

      // Load the most recent interview (already sorted DESC by created_at)
      const { interview, messages: msgs, note } = await fetchInterviewDetail(list[0].id);

      currentInterview.set(interview);
      messages.set(msgs);

      if (note) {
        notes.set(note);
      }

      // Recovery de sessão: religa SSE se estimativa estava em andamento
      const savedEstimationId =
        typeof sessionStorage !== 'undefined'
          ? sessionStorage.getItem(`estimation_${interview.id}`)
          : null;

      if (savedEstimationId) {
        const status = await getEstimationStatus(savedEstimationId);
        if (status === 'queued' || status === 'running' || status === 'awaiting_approval') {
          estimationId.set(savedEstimationId);
          estimationStatus.set(status);
          startEstimationStream(savedEstimationId, interview.id);
        } else {
          sessionStorage.removeItem(`estimation_${interview.id}`);
        }
      }
    } catch (err) {
      console.error('[page] Failed to load interview data', err);
    }
  });
</script>

<div class="flex h-full w-full">
  <!-- Left Sidebar -->
  <div class="sidebar-transition hidden lg:flex {$sidebarCollapsed ? 'lg:w-0' : 'lg:w-[340px]'} flex-col h-full overflow-hidden">
    <InterviewSidebar user={data.user} />
  </div>

  <!-- Center Chat Window -->
  <main class="flex-1 flex flex-col h-full relative">
    {#if $sidebarCollapsed}
      <!-- Floating expand button for sidebar -->
      <button
        on:click={() => sidebarCollapsed.toggle()}
        class="absolute left-0 top-4 z-50 hidden lg:flex items-center justify-center text-neutral-400 hover:text-neutral-200 transition-colors p-2"
        title="Expand sidebar"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect height="18" rx="5" ry="5" width="18" x="3" y="3"></rect>
          <line x1="12" x2="12" y1="3" y2="21"></line>
        </svg>
      </button>
    {/if}
    {#if $notePanelCollapsed}
      <!-- Floating expand button for notes panel -->
      <button
        on:click={() => notePanelCollapsed.toggle()}
        class="absolute right-0 top-4 z-50 hidden lg:flex items-center justify-center text-neutral-400 hover:text-neutral-200 transition-colors p-2"
        title="Expand notes panel"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect height="18" rx="5" ry="5" width="18" x="3" y="3"></rect>
          <line x1="12" x2="12" y1="3" y2="21"></line>
        </svg>
      </button>
    {/if}
    <div class="flex-1">
      <ChatWindow />
    </div>
    <div>
      <ChatInput />
    </div>
  </main>

  <!-- Right Notes Panel (Cockpit) -->
  <div class="sidebar-transition hidden lg:flex {$notePanelCollapsed ? 'lg:w-0' : 'lg:w-80'} flex-col h-full overflow-hidden">
    <NotesPanel />
  </div>
</div>
