<script lang="ts">
  import InterviewSidebar from '$lib/components/InterviewSidebar.svelte';
  import ChatWindow from '$lib/components/ChatWindow.svelte';
  import NotesPanel from '$lib/components/NotesPanel.svelte';
  import ChatInput from '$lib/components/ChatInput.svelte';
  import { sidebarCollapsed, notePanelCollapsed } from '$lib/stores/ui';

  export let data: { user: import('$app/types').App.Locals['user'] };
</script>

<div class="flex h-full overflow-hidden bg-dark-bg">
  <!-- Left Sidebar -->
  {#if !$sidebarCollapsed}
    <InterviewSidebar />
  {/if}

  <!-- Main Content -->
  <div class="flex-1 flex flex-col overflow-hidden">
    <ChatWindow />
    <ChatInput />
  </div>

  <!-- Right Notes Panel -->
  {#if !$notePanelCollapsed}
    <div class="w-[280px] flex-shrink-0 border-l border-[#000000]">
      <NotesPanel />
    </div>
  {/if}
</div>
