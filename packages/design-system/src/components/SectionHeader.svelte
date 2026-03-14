<script lang="ts">
  export let label: string;
  export let actions: boolean = false;
</script>

<div class="flex items-center justify-between">
  <p class="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
    {label}
  </p>
  {#if actions}
    <div class="flex items-center gap-1">
      <slot name="actions" />
    </div>
  {/if}
</div>
