<script lang="ts">
  export let avatars: string[] = [];
  export let max: number = 3;

  const visibleColors = ['#f59e0b', '#06bcf9', '#10b981', '#ef4444', '#8b5cf6'];
  $: visible = avatars.slice(0, max);
  $: remaining = avatars.length - max;
</script>

<div class="flex items-center -space-x-2">
  {#each visible as avatar, i}
    <div
      class="w-7 h-7 rounded-full border-2 border-dark-surface flex items-center justify-center text-[10px] font-bold text-white"
      style="background-color: {visibleColors[i % visibleColors.length]}; z-index: {max - i};"
      title={avatar}
    >
      {avatar.charAt(0).toUpperCase()}
    </div>
  {/each}
  {#if remaining > 0}
    <div
      class="w-7 h-7 rounded-full border-2 border-dark-surface flex items-center justify-center text-[10px] font-medium text-neutral-300 bg-dark-border"
      style="z-index: 0;"
    >
      +{remaining}
    </div>
  {/if}
</div>
