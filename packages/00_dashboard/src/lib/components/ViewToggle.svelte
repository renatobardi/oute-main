<script lang="ts">
  export let active: 'grid' | 'list' = 'grid';
</script>

<div class="inline-flex rounded-lg border border-[#21404a] overflow-hidden">
  <button
    class="px-3 py-1.5 text-sm font-medium transition-colors {active === 'grid'
      ? 'bg-[#21404a] text-white'
      : 'bg-transparent text-neutral-400 hover:text-neutral-200'}"
    on:click={() => (active = 'grid')}
  >
    Grid
  </button>
  <button
    class="px-3 py-1.5 text-sm font-medium transition-colors {active === 'list'
      ? 'bg-[#21404a] text-white'
      : 'bg-transparent text-neutral-400 hover:text-neutral-200'}"
    on:click={() => (active = 'list')}
  >
    List
  </button>
</div>
