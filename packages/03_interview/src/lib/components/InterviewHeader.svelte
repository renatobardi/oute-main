<script lang="ts">
  import type { Interview } from '$lib/types/index';
  import { OuteLogo } from '@oute/design-system';

  export let interview: Interview;
  export let notePanelCollapsed: boolean = false;
  export let sidebarCollapsed: boolean = false;

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
      <p class="text-xs text-neutral-500 font-mono">{interview.id}</p>
      <h2 class="text-lg font-semibold text-white">{interview.title}</h2>
    </div>
  </div>
  <div class="flex items-center gap-2 transition-all duration-300" style={notePanelCollapsed ? 'transform: translateX(-112px)' : ''}>
    <span class={`w-2 h-2 rounded-full ${getStatusColor(interview.status)}`}></span>
    <span class="text-sm text-neutral-400">{getStatusLabel(interview.status)}</span>
  </div>
</div>
