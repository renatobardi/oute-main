<script lang="ts">
  export let value: string | number;
  export let unit: string = '';
  export let label: string = '';
  export let size: 'sm' | 'md' | 'lg' = 'lg';

  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  };
</script>

<div class="flex flex-col gap-1">
  <div class="{sizeClasses[size]} font-bold text-primary-500">
    {value}<span class="text-neutral-400 font-normal">{unit}</span>
  </div>
  {#if label}
    <p class="text-xs text-neutral-500">{label}</p>
  {/if}
</div>
