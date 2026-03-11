<script lang="ts">
  export let href: string | null = null;
  export let text = 'Entrar na Oute';

  // If href is provided, use it. Otherwise, use on:click event
  const hasHref = href !== null;
</script>

{#if hasHref}
  <a {href} class="inline-block">
    <button
      class="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
    >
      {text}
    </button>
  </a>
{:else}
  <button
    on:click
    class="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
  >
    {text}
  </button>
{/if}
