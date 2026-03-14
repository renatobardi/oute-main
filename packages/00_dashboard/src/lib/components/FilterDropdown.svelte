<script lang="ts">
  export let label: string;
  export let icon: string = '';
  export let options: string[] = [];
  export let selected: string = '';

  let open = false;

  function toggle() {
    open = !open;
  }

  function select(option: string) {
    selected = option;
    open = false;
  }
</script>

<div class="relative">
  <button
    class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-neutral-300 border border-dark-border rounded-lg hover:border-primary-500/30 transition-colors"
    on:click={toggle}
  >
    {#if icon !== ''}
      <span class="text-xs">{icon}</span>
    {/if}
    {selected !== '' ? selected : label}
    <svg class="w-3.5 h-3.5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  {#if open}
    <div
      class="absolute right-0 mt-1 w-40 bg-dark-surface border border-dark-border rounded-lg shadow-lg z-10"
    >
      {#each options as option}
        <button
          class="block w-full text-left px-3 py-2 text-sm text-neutral-300 hover:bg-dark-border transition-colors first:rounded-t-lg last:rounded-b-lg"
          on:click={() => select(option)}
        >
          {option}
        </button>
      {/each}
    </div>
  {/if}
</div>

<svelte:window
  on:click={() => {
    if (open) open = false;
  }}
/>
