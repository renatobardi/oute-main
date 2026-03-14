<script lang="ts">
  export let label: string;
  export let value: string | number;
  export let icon: string = '';
  export let color: 'primary' | 'success' | 'warning' | 'error' = 'primary';

  const colorMap = {
    primary: 'bg-primary-600/10 text-primary-400',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    error: 'bg-error/10 text-error',
  };
</script>

<div class="flex items-center gap-2">
  {#if icon}
    <span class="text-lg">{icon}</span>
  {/if}
  <div>
    <p class="text-xs text-neutral-500">{label}</p>
    <p class={`text-sm font-semibold ${colorMap[color]}`}>{value}</p>
  </div>
</div>
