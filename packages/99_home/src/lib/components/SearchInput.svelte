<script lang="ts">
  let inputValue = '';

  function handleSubmit() {
    if (inputValue.trim()) {
      console.log('Search query:', inputValue);
      // TODO: Handle search/navigation
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  }
</script>

<div class="flex justify-center mb-8">
  <div class="flex gap-3 w-full max-w-md">
    <input
      type="text"
      bind:value={inputValue}
      on:keydown={handleKeydown}
      placeholder="Descreva seu projeto..."
      class="flex-1 bg-[#0f1e23] border border-[#21404a] rounded-lg px-4 py-2 text-sm text-neutral-300 placeholder-neutral-500 focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
    />
    <button
      on:click={handleSubmit}
      class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center min-w-12"
    >
      ➜
    </button>
  </div>
</div>
