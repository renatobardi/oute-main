<script lang="ts">
  import { Button } from '@oute/design-system';
  import { messages, initialInputValue } from '$lib/stores/conversation';
  import { onMount } from 'svelte';

  let inputValue = '';
  let textareaElement: HTMLTextAreaElement;
  const minRows = 3;
  const maxRows = 7;
  const lineHeight = 20; // Approximate line height in pixels

  // Load initial value from store when component mounts
  onMount(() => {
    // Initialize textarea height
    adjustTextareaHeight();

    initialInputValue.subscribe(value => {
      if (value) {
        inputValue = value;
        initialInputValue.set(''); // Clear after using
        adjustTextareaHeight();
      }
    })();
  });

  function adjustTextareaHeight() {
    if (textareaElement) {
      textareaElement.style.height = 'auto';
      const scrollHeight = textareaElement.scrollHeight;
      const minHeight = minRows * lineHeight + 16; // 16px for padding
      const maxHeight = maxRows * lineHeight + 16;
      const newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight));
      textareaElement.style.height = newHeight + 'px';
      textareaElement.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
    }
  }

  function handleInput() {
    adjustTextareaHeight();
  }

  function handleSend() {
    if (inputValue.trim()) {
      messages.update((msgs) => [
        ...msgs,
        {
          id: Date.now().toString(),
          timestamp: new Date(),
          sender: 'user',
          content: inputValue,
          type: 'text',
        },
      ]);
      inputValue = '';
      adjustTextareaHeight();

      // Simulate AI response after a delay
      setTimeout(() => {
        messages.update((msgs) => [
          ...msgs,
          {
            id: (Date.now() + 1).toString(),
            timestamp: new Date(),
            sender: 'ai',
            content: 'Entendido. Vou processar essa informação.',
            type: 'text',
          },
        ]);
      }, 500);
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }
</script>

<div class="px-6 py-4 border-t border-[#000000] bg-[#000000]">
  <div class="relative">
    <!-- Message Input with Clip Icon Inside -->
    <div class="flex-1 relative">
      <!-- Icons Container -->
      <div class="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-10">
        <!-- Clip/Attachment Button -->
        <button
          class="w-5 h-5 text-neutral-400 hover:text-neutral-200 transition-colors flex items-center justify-center"
          title="Adicionar anexo"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.414a6 6 0 108.486 8.486L7.586 15" />
          </svg>
        </button>

        <!-- Help/Info Button -->
        <button
          class="w-5 h-5 text-neutral-400 hover:text-neutral-200 transition-colors flex items-center justify-center"
          title="Ajuda"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      <textarea
        bind:this={textareaElement}
        bind:value={inputValue}
        on:keydown={handleKeydown}
        on:input={handleInput}
        placeholder="Digite sua resposta aqui..."
        class="w-full bg-[#0f1e23] border border-[#21404a] rounded-lg pl-12 pr-14 py-2 text-sm text-white placeholder-neutral-500 resize-none focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 overflow-hidden"
        rows="1"
      ></textarea>

      <!-- Send Button Inside -->
      <button
        on:click={handleSend}
        class="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-primary-500 hover:bg-primary-600 flex items-center justify-center text-[#0f1e23] transition-colors z-10"
        title="Enviar mensagem"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </button>
    </div>
  </div>
</div>
