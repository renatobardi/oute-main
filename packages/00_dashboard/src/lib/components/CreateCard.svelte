<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
</script>

<button
  class="bg-[#162a31]/50 border border-dashed border-[#21404a] rounded-xl p-5 flex flex-col items-center justify-center gap-3 min-h-[200px] hover:border-[#2d5560] hover:bg-[#162a31] transition-colors cursor-pointer"
  on:click={() => dispatch('create')}
>
  <div
    class="w-10 h-10 rounded-full border border-[#21404a] flex items-center justify-center text-neutral-400"
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
    </svg>
  </div>
  <span class="text-sm text-neutral-400">Criar nova estimativa</span>
</button>
