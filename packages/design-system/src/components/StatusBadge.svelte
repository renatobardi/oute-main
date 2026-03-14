<script lang="ts">
  export let status: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  export let label: string;
  export let pulse: boolean = false;
  export let variant: 'dot' | 'pill' = 'pill';

  const styles = {
    success: {
      pill: 'text-emerald-400 bg-emerald-500/20 border border-emerald-500/30',
      dot: 'bg-success',
      text: 'text-success',
    },
    warning: {
      pill: 'text-amber-400 bg-amber-500/20 border border-amber-500/30',
      dot: 'bg-warning',
      text: 'text-warning',
    },
    error: {
      pill: 'text-red-400 bg-red-500/20 border border-red-500/30',
      dot: 'bg-error',
      text: 'text-error',
    },
    info: {
      pill: 'text-sky-400 bg-sky-500/20 border border-sky-500/30',
      dot: 'bg-info',
      text: 'text-info',
    },
    neutral: {
      pill: 'text-neutral-400 bg-neutral-500/20 border border-neutral-500/30',
      dot: 'bg-neutral-500',
      text: 'text-neutral-400',
    },
  };

  $: s = styles[status];
</script>

{#if variant === 'pill'}
  <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold {s.pill}">
    <span class="w-2 h-2 rounded-full {s.dot} {pulse ? 'animate-pulse' : ''}"></span>
    <span>{label}</span>
  </div>
{:else}
  <div class="flex items-center gap-2">
    <span class="w-2 h-2 rounded-full {s.dot} {pulse ? 'animate-pulse' : ''}"></span>
    <span class="text-sm {s.text}">{label}</span>
  </div>
{/if}
