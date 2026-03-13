<script lang="ts">
  import { OuteLogo } from '@oute/design-system';
  import { createEventDispatcher } from 'svelte';

  export let sender: 'user' | 'ai';
  export let content: string;
  export let timestamp: Date;
  export let userName: string = 'U';
  export let avatarColor: string = 'bg-slate-600';

  const dispatch = createEventDispatcher();

  let copied = false;

  function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  function getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    copied = true;
    setTimeout(() => (copied = false), 1500);
  }

  function handleReference() {
    dispatch('reference', { content });
  }
</script>

<div
  class="group flex gap-3 px-6 py-2 {sender === 'user'
    ? 'justify-end'
    : 'justify-start'}"
>
  <div
    class="relative px-4 py-2 rounded-lg border border-primary-500/20 text-white {sender === 'ai'
      ? 'bg-primary-500/15'
      : 'bg-primary-500/10'} {sender === 'ai'
      ? 'max-w-[80%]'
      : 'max-w-[60%]'}"
  >
    {#if sender === 'ai'}
      <div class="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center bg-[#000000] rounded-full border border-[#21404a]">
        <div class="w-3 h-3 flex items-center justify-center">
          <OuteLogo size="xs" showSlogan={false} horizontal={false} />
        </div>
      </div>
    {:else}
      <div class="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center {avatarColor} rounded-full border border-[#21404a] text-xs font-bold text-white">
        {getInitials(userName)}
      </div>
    {/if}
    <p class="text-sm">{content}</p>
    <p class="text-xs mt-1 text-neutral-500">
      {formatTime(timestamp)}
    </p>

    <!-- Hover action buttons -->
    <div
      class="absolute -bottom-7 {sender === 'user' ? 'right-0' : 'left-0'} flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
    >
      <!-- Copy button -->
      <button
        on:click={handleCopy}
        class="flex items-center justify-center w-6 h-6 rounded bg-[#0f1e23] border border-primary-500/20 text-neutral-400 hover:text-primary-400 hover:border-primary-500/50 transition-colors"
        title={copied ? 'Copiado!' : 'Copiar mensagem'}
        aria-label="Copiar mensagem"
      >
        {#if copied}
          <!-- Checkmark icon -->
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        {:else}
          <!-- Copy/clipboard docs icon -->
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
        {/if}
      </button>

      <!-- Reference/reply button -->
      <button
        on:click={handleReference}
        class="flex items-center justify-center w-6 h-6 rounded bg-[#0f1e23] border border-primary-500/20 text-neutral-400 hover:text-primary-400 hover:border-primary-500/50 transition-colors"
        title="Referenciar como resposta"
        aria-label="Referenciar mensagem"
      >
        <!-- Restart/rotate-left icon -->
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      </button>
    </div>
  </div>
</div>
