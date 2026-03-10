<script lang="ts">
  export let href = '/dashboard';
  export let text = 'Entrar na Oute';
</script>

<a {href} class="inline-block">
  <button
    class="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
  >
    {text}
  </button>
</a>
