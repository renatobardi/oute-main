<script lang="ts">
  import { Button } from '@oute/design-system';
  import { messages, initialInputValue } from '$lib/stores/conversation';
  import { onMount } from 'svelte';

  let inputValue = '';

  // Load initial value from store when component mounts
  onMount(() => {
    initialInputValue.subscribe(value => {
      if (value) {
        inputValue = value;
        initialInputValue.set(''); // Clear after using
      }
    })();
  });

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

<div class="px-6 py-4 border-t border-[#21404a] bg-[#162a31]">
  <div class="flex gap-3 items-end">
    <textarea
      bind:value={inputValue}
      on:keydown={handleKeydown}
      placeholder="Escreva sua mensagem..."
      class="flex-1 bg-[#0f1e23] border border-[#21404a] rounded-lg px-4 py-2 text-sm text-neutral-300 placeholder-neutral-500 resize-none focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
      rows="3"
    ></textarea>
    <Button variant="primary" size="sm" on:click={handleSend}>Enviar</Button>
  </div>
</div>
