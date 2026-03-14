<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let label: string;
  export let removable: boolean = false;

  const dispatch = createEventDispatcher<{ remove: string }>();
</script>

<span
  class="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-500/10 border border-primary-600/30 text-primary-400 text-xs font-semibold rounded-full hover:bg-primary-500/20 transition-all cursor-default"
>
  {label}
  {#if removable}
    <button
      class="ml-1 text-primary-400/60 hover:text-primary-400 transition-colors"
      on:click={() => dispatch('remove', label)}
      aria-label="Remove tag {label}"
    >
      ×
    </button>
  {/if}
</span>
