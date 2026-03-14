<script lang="ts">
  export let picture: string | undefined = undefined;
  export let name: string = '';
  export let size: 'xs' | 'sm' | 'md' | 'lg' = 'md';
  export let color: string = 'bg-slate-600';

  let imgError = false;

  const sizes: Record<string, string> = {
    xs: 'w-6 h-6 text-[9px]',
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
  };

  function getInitials(n: string): string {
    return n
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';
  }
</script>

<div
  class="rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center font-semibold text-white {sizes[size]} {!picture || imgError ? color : ''}"
>
  {#if picture && !imgError}
    <img
      src={picture}
      alt={name}
      class="w-full h-full object-cover"
      on:error={() => (imgError = true)}
      referrerpolicy="no-referrer"
    />
  {:else}
    {getInitials(name)}
  {/if}
</div>
