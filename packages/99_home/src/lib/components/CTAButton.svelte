<script lang="ts">
  export let href: string | null = null;
  export let text = 'Entrar na Oute';

  // If href is provided, use it. Otherwise, use on:click event
  const hasHref = href !== null;
</script>

{#if hasHref}
  <a {href} class="w-full max-w-xs mx-auto block">
    <button
      class="w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
    >
      {text}
    </button>
  </a>
{:else}
  <button
    on:click
    class="w-full max-w-xs mx-auto bg-primary-600 hover:bg-primary-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
  >
    {text}
  </button>
{/if}
