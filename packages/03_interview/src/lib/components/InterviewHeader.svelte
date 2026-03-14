<script lang="ts">
  import type { Interview } from '$lib/types/index';
  import { OuteLogo } from '@oute/design-system';
  import { currentInterview } from '$lib/stores/conversation';
  import { updateInterviewTitle } from '$lib/api';

  export let interview: Interview;
  export let notePanelCollapsed: boolean = false;
  export let sidebarCollapsed: boolean = false;

  let editing = false;
  let editingTitle = '';
  let saving = false;

  function startEditing() {
    editingTitle = interview.title;
    editing = true;
  }

  async function saveEditing() {
    if (saving || !editingTitle.trim()) return;
    saving = true;
    try {
      const updated = await updateInterviewTitle(interview.id, editingTitle);
      currentInterview.update((ci) => (ci ? { ...ci, title: updated.title } : ci));
      editing = false;
    } catch (err) {
      console.error('[Header] Failed to rename interview', err);
    } finally {
      saving = false;
    }
  }

  function cancelEditing() {
    editing = false;
    editingTitle = '';
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'scheduled':
        return 'bg-neutral-500';
      case 'in_progress':
        return 'bg-warning';
      case 'completed':
        return 'bg-success';
      case 'cancelled':
        return 'bg-error';
      default:
        return 'bg-neutral-500';
    }
  }

  function getStatusLabel(status: string): string {
    switch (status) {
      case 'in_progress':
        return 'In Progress';
      case 'scheduled':
        return 'Scheduled';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  }
</script>

<div class="py-4 bg-[#000000] flex items-center justify-between transition-all duration-300" style="padding-left: {sidebarCollapsed ? '48px' : '24px'}; padding-right: 24px;">
  <div class="flex items-center gap-3">
    {#if sidebarCollapsed}
      <OuteLogo size="xs" showSlogan={false} />
    {/if}
    <div>
      <p class="text-xs text-neutral-500 font-mono">{interview.interviewCode}</p>
      {#if editing}
        <div class="flex items-center gap-1.5 mt-0.5">
          <input
            type="text"
            bind:value={editingTitle}
            class="bg-transparent text-lg font-semibold text-white border-b border-primary-500/50 focus:outline-none focus:border-primary-500 min-w-0"
            on:keydown={(e) => { if (e.key === 'Enter') saveEditing(); if (e.key === 'Escape') cancelEditing(); }}
          />
          <button
            on:click={saveEditing}
            disabled={saving}
            title="Salvar"
            class="flex-shrink-0 p-0.5 text-primary-500 hover:text-primary-400 disabled:opacity-50"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </button>
          <button
            on:click={cancelEditing}
            title="Cancelar"
            class="flex-shrink-0 p-0.5 text-slate-500 hover:text-slate-300"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      {:else}
        <div class="group/title flex items-center gap-1.5">
          <h2 class="text-lg font-semibold text-white">{interview.title}</h2>
          <button
            on:click={startEditing}
            title="Renomear"
            class="flex-shrink-0 p-0.5 opacity-0 group-hover/title:opacity-100 transition-opacity text-slate-500 hover:text-slate-300"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>
      {/if}
    </div>
  </div>
  <div class="flex items-center gap-2 transition-all duration-300" style={notePanelCollapsed ? 'transform: translateX(-112px)' : ''}>
    <span class={`w-2 h-2 rounded-full ${getStatusColor(interview.status)}`}></span>
    <span class="text-sm text-neutral-400">{getStatusLabel(interview.status)}</span>
  </div>
</div>
