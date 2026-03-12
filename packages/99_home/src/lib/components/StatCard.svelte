<script lang="ts">
  export let number: string | number = '0';
  export let label = 'Stat';
</script>

<div class="text-center">
  <div class="text-2xl md:text-3xl font-bold text-primary-600 mb-2">
    {number}
  </div>
  <div class="text-xs text-neutral-500 font-semibold uppercase tracking-wide">
    {label}
  </div>
</div>
