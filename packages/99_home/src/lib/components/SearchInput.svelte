<script lang="ts">
  let inputValue = '';

  function handleSubmit() {
    // Build chat URL with initial message as query parameter if provided
    let chatUrl = window.location.hostname === 'localhost'
      ? 'http://localhost:3002/'
      : '/chat';

    if (inputValue.trim()) {
      const encoded = encodeURIComponent(inputValue.trim());
      chatUrl += `?initial=${encoded}`;
    }

    // Use window.location.href for navigation (works in both dev and production)
    window.location.href = chatUrl;

    // Clear input
    inputValue = '';
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  }
</script>

<div class="flex justify-center mb-8">
  <div class="flex gap-3 w-full max-w-2xl">
    <input
      type="text"
      bind:value={inputValue}
      on:keydown={handleKeydown}
      placeholder="Descreva seu projeto..."
      class="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-6 py-4 text-lg text-neutral-300 placeholder-neutral-500 focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
    />
    <button
      on:click={handleSubmit}
      class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-4 rounded-lg font-medium transition-colors flex items-center justify-center min-w-14"
    >
      ➜
    </button>
  </div>
</div>
