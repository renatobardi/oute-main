<script lang="ts">
  import { goto } from '$app/navigation';

  let inputValue = '';

  async function handleSubmit() {
    console.log('[DEBUG] handleSubmit called - NEW VERSION 2026-03-12');
    // Build chat URL with initial message as query parameter if provided
    let chatUrl = window.location.hostname === 'localhost'
      ? 'http://localhost:3002/'
      : '/chat';

    if (inputValue.trim()) {
      const encoded = encodeURIComponent(inputValue.trim());
      chatUrl += `?initial=${encoded}`;
    }

    console.log('[DEBUG] Attempting navigation to:', chatUrl);
    // Use goto for Svelte navigation, fallback to window.location for cross-origin
    if (chatUrl.startsWith('/')) {
      console.log('[DEBUG] Using goto() for same-origin navigation');
      await goto(chatUrl);
    } else {
      console.log('[DEBUG] Using window.location.href for cross-origin');
      window.location.href = chatUrl;
    }

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
